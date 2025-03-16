import { createContext, useContext, useEffect, useState } from "react" 
import { supabase } from "../supabaseClient" 

const AuthContext = createContext() 

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined) 
  const [profile, setProfile] = useState(null);

  const adjectives = [
    "adorable", "adventurous", "aggressive", "alert", "amusing", "ancient", "angry", "anxious", "artistic", "astonishing",
    "attractive", "awesome", "awkward", "beautiful", "bewildered", "bold", "bossy", "bouncy", "brave", "bright",
    "brilliant", "broad", "bumpy", "calm", "careful", "charming", "cheerful", "clever", "clumsy", "colorful",
    "compassionate", "confused", "courageous", "cozy", "crazy", "creepy", "crispy", "curious", "cute", "daring",
    "dazzling", "delightful", "determined", "dirty", "dynamic", "eager", "ecstatic", "efficient", "elegant", "energetic",
    "enormous", "enthusiastic", "fabulous", "fancy", "fantastic", "fearless", "fierce", "fluffy", "fortunate", "fragile",
    "friendly", "funny", "fuzzy", "gentle", "gloomy", "glorious", "graceful", "grateful", "greedy", "happy",
    "harmonious", "helpful", "hilarious", "honest", "hopeful", "humble", "hungry", "imaginative", "important", "impressive",
    "incredible", "intelligent", "jolly", "joyful", "jumpy", "kind", "lively", "lonely", "loud", "lovely",
    "lucky", "magnificent", "massive", "melodic", "mighty", "mysterious", "nervous", "noisy", "obedient", "outstanding",
    "peaceful", "playful", "powerful", "quick", "radiant", "robust", "silly", "tender", "vibrant", "witty"
  ];

  const animals = [
    "aardvark", "alligator", "alpaca", "antelope", "armadillo", "baboon", "badger", "bat", "bear", "beaver",
    "bison", "boar", "buffalo", "butterfly", "camel", "capybara", "caribou", "cat", "caterpillar", "cheetah",
    "chimpanzee", "chinchilla", "cobra", "cougar", "cow", "coyote", "crab", "crocodile", "crow", "deer",
    "dingo", "dog", "dolphin", "donkey", "dragonfly", "duck", "eagle", "echidna", "eel", "elephant",
    "elk", "falcon", "ferret", "flamingo", "fox", "frog", "gazelle", "gecko", "giraffe", "goat",
    "goose", "gorilla", "grasshopper", "hamster", "hare", "hedgehog", "hippopotamus", "hornet", "horse", "hummingbird",
    "hyena", "ibex", "iguana", "jackal", "jaguar", "jellyfish", "kangaroo", "kingfisher", "koala", "komodo dragon",
    "lemur", "leopard", "lion", "lizard", "lobster", "lynx", "macaw", "manatee", "mandrill", "meerkat",
    "mole", "mongoose", "monkey", "moose", "narwhal", "newt", "ocelot", "octopus", "okapi", "orangutan",
    "otter", "owl", "panda", "panther", "parrot", "peacock", "pelican", "penguin", "pigeon", "platypus",
    "polar bear", "porcupine", "quail", "quokka", "rabbit", "raccoon", "raven", "reindeer", "rhinoceros", "salamander"
  ];

  const generateUniqueUsername = async () => {
    let username;
    let isUnique = false;

    while (!isUnique) {
      const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
      username = `${randomAdjective}_${randomAnimal}`;

      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username);

      if (!data || data.length === 0) {
        isUnique = true;
      }
    }

    return username;
  };

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  };

  const signUpNewUser = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password,
    })

    if (error) {
      console.error("Error signing up: ", error) 
      return { success: false, error } 
    }

    if (data.user) {
      console.log("Sign-up success:", data) 

      const username = await generateUniqueUsername();

      const { error: perror } = await supabase
        .from("profiles")
        .insert([
          {
            id: data.user.id,
            username, 
            avatar_url: "https://www.nicepng.com/png/detail/933-9332131_profile-picture-default-png.png"
          },
        ]);
      
      if (perror) {
        console.error("Error inserting profile:", perror) 
        return { success: false, error: perror } 
      }
    }

    const userProfile = await fetchProfile(data.user.id);
    console.log("User Profile:", userProfile)
    if (userProfile) {
      setProfile(userProfile);
    }
    console.log("Profile Sign Up", profile)

    return { success: true, data } 
  } 

  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      }) 

      if (error) {
        console.error("Sign-in error:", error.message) 
        return { success: false, error: error.message } 
      }

      console.log("Sign-in success:", data) 

      const userProfile = await fetchProfile(data.user.id);
      console.log("User Profile:", userProfile)
      if (userProfile) {
        setProfile(userProfile);
      }
      console.log("Profile Sign In", profile)

      return { success: true, data } 

    } catch (error) {
      console.error("Unexpected error during sign-in:", error.message) 
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      } 
    }
  } 

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id).then((profileData) => {
          if (profileData) {
            setProfile(profileData);
          }
        });
        console.log("Profile", profile)
      } else {
        setProfile(null);
      }
    });
  }, []);

  async function signOut() {
    const { error } = await supabase.auth.signOut() 
    if (error) {
      console.error("Error signing out:", error) 
    }
  }

  return (
    <AuthContext.Provider
      value={{ signUpNewUser, signInUser, session, signOut, profile, setProfile }}
    >
      {children}
    </AuthContext.Provider>
  ) 
} 

export const UserAuth = () => {
  return useContext(AuthContext) 
} 