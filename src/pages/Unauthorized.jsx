import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Unauthorized = () => {

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">      
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto p-6 space-y-8">
          <div className="">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Sorry, you are unauthorized to view this data
            </h2>
            <h2 className="text-xl font-bold text-center text-gray-900 mb-4">
              Here is a funny meme instead
            </h2>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <img
              src="/src/assets/meme.jpg"
              alt="Funny Meme"
              className="w-full rounded"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Unauthorized;
