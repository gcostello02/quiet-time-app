import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Information = () => {

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">      
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto p-6 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                Privacy Policy
              </h2>
              <div className="bg-white p-6 rounded-xl shadow">
                Privacy Policy is in development.
              </div>
            </div>
            <div className="">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                Terms of Service
              </h2>
              <div className="bg-white p-6 rounded-xl shadow">
                Terms of Service is in development.
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Information;