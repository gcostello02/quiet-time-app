# Deploying to Google Cloud Run

This app is a Vite + React SPA. It runs on **Cloud Run** using the repo’s `Dockerfile` and optional **Cloud Build** config.

## Environment config

- **Local / dev:** Use a **`.env`** file in the project root. Vite loads it for `npm run dev` and `npm run build`. Add:
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```
- **Cloud Build:** Uses **Secret Manager** by default. Store your env as the secret `quiet-time-app-env` (same format as `env.yaml`: one `KEY=value` per line). Alternatively you can pass `_VITE_SUPABASE_URL` and `_VITE_SUPABASE_ANON_KEY` as trigger substitution variables.

## Prerequisites

- A [Google Cloud project](https://console.cloud.google.com/)
- [gcloud](https://cloud.google.com/sdk/docs/install) installed and logged in
- Supabase values for production (in `.env` locally or in `env.yaml` / trigger for Cloud Build)

## 1. Set project and enable APIs

This repo is set up for project **gcostello** and region **us-east4** (see `cloudbuild.yaml`).

```bash
gcloud config set project gcostello
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com
```

## 2. Secret Manager (one-time)

Cloud Build reads build-time env from the secret **`quiet-time-app-env`** (see `_ENV_SECRET` in `cloudbuild.yaml`).

### Create the secret in Google Cloud Console

1. Open [Secret Manager](https://console.cloud.google.com/security/secret-manager) in project **gcostello**.
2. Click **Create secret**.
3. **Name:** `quiet-time-app-env` (must match `_ENV_SECRET` in `cloudbuild.yaml`).
4. **Secret value:** paste the following, then replace the placeholders with your real values (one `KEY=value` per line, no spaces around `=`):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
5. Create the secret. Then grant Cloud Build access (see “Grant access” below).

### Create the secret from a file (alternative)

1. Create a local file with your values (same format as above):
   ```bash
   cp env.yaml.example env.yaml
   # Edit env.yaml with real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   ```
2. Create the secret and grant access:
   ```bash
   gcloud secrets create quiet-time-app-env --data-file=env.yaml
   ```
   To add a new version later: `gcloud secrets versions add quiet-time-app-env --data-file=env.yaml`

### Grant access

After the secret exists (Console or gcloud), grant the Cloud Build service account permission to read it:

```bash
PROJECT_NUMBER=$(gcloud projects describe gcostello --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding quiet-time-app-env \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

If the build still can’t access the secret, also grant the same role to:  
`serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com`

## 3. Create Artifact Registry repo (one-time)

```bash
gcloud artifacts repositories create quiet-time-app \
  --repository-format=docker \
  --location=us-east4 \
  --description="Docker repo for quiet-time-app"
```

## 4. Deploy with Cloud Build (recommended)

With Secret Manager set up, the build fetches `quiet-time-app-env` and uses it as `env.yaml` for the Docker build.

**From your machine:**
```bash
gcloud builds submit --config=cloudbuild.yaml .
```

**From a trigger (e.g. on push):** Create a trigger that uses this repo and `cloudbuild.yaml`. The default substitution `_ENV_SECRET=quiet-time-app-env` is already in the config, so the build will use that secret. No need to set `_VITE_SUPABASE_*` unless you want to skip the secret and use substitution variables instead.

To skip Secret Manager and use a local `env.yaml` when running manually, pass an empty secret name:
```bash
gcloud builds submit --config=cloudbuild.yaml --substitutions=_ENV_SECRET= .
```
(Your local `env.yaml` will be in the build context and used if the fetch step didn’t create one.)

## 5. One-off deploy without Cloud Build

If you prefer not to use `cloudbuild.yaml`:

**Using `.env` (local):**

```bash
# Ensure .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run build
# Then build the image; the Dockerfile expects build-args, so pass them from .env or export first:
export $(grep -v '^#' .env | xargs)
docker build \
  --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
  -t us-east4-docker.pkg.dev/gcostello/quiet-time-app/quiet-time-app:latest .
gcloud auth configure-docker us-east4-docker.pkg.dev
docker push us-east4-docker.pkg.dev/gcostello/quiet-time-app/quiet-time-app:latest
gcloud run deploy quiet-time-app \
  --image us-east4-docker.pkg.dev/gcostello/quiet-time-app/quiet-time-app:latest \
  --region us-east4 \
  --platform managed \
  --allow-unauthenticated
```

**Using `env.yaml`:**

```bash
# Ensure env.yaml exists (copy from env.yaml.example)
docker build --build-arg VITE_SUPABASE_URL="$(grep VITE_SUPABASE_URL env.yaml | cut -d= -f2-)" \
  --build-arg VITE_SUPABASE_ANON_KEY="$(grep VITE_SUPABASE_ANON_KEY env.yaml | cut -d= -f2-)" \
  -t us-east4-docker.pkg.dev/gcostello/quiet-time-app/quiet-time-app:latest .
# ... push and deploy as above (us-east4-docker.pkg.dev, region us-east4)
```

## 6. App URL

After deploy, Cloud Run prints the service URL. Or:

```bash
gcloud run services describe quiet-time-app --region us-east4 --format 'value(status.url)'
```

**Note:** The IAM binding above grants the default compute service account access to the secret. If your build fails with a permission error, grant the same role to the Cloud Build service account: `gcloud secrets add-iam-policy-binding quiet-time-app-env --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"`.

## Custom domain

In [Cloud Run](https://console.cloud.google.com/run), open the service → **Manage custom domains**, then follow the DNS steps.

## Troubleshooting

- **Blank page or Supabase errors**  
  Rebuild with the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (via `.env` / `env.yaml` or trigger substitutions).

- **404 on refresh or direct URLs**  
  The image serves the SPA with `serve -s dist`; all routes should serve `index.html`. If not, confirm you’re using the repo’s Dockerfile and that the build completed.

- **Permission denied on push**  
  Run `gcloud auth configure-docker us-east4-docker.pkg.dev` and `gcloud auth login`.
