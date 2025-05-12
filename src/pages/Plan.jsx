import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import readingPlan from "../data/40DayReadingPlan.json"

const Plan = () => {

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">      
      <Navbar />
      <main className="flex-grow">

        <div className="max-w-5xl mx-auto p-6 space-y-8">
          <div>
            <h1 className="text-2xl text-center font-bold text-gray-900 mb-2">
              40 Day Getting Started Reading Plan
            </h1>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse rounded-xl overflow-hidden">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Day</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Book</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Chapters</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {readingPlan.map((item) => (
                  <tr
                    key={item.day}
                    className="bg-white hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">{item.day}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.book}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.chapters}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Plan;
