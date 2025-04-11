import Navbar from "../components/Navbar";
import readingPlan from "../data/40DayReadingPlan.json"

const Plan = () => {

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">      
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">40 Day Getting Started Reading Plan</h1>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse rounded-xl overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Day</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Book</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Chapters</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {readingPlan.map((item) => (
                <tr
                  key={item.day}
                  className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.day}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.book}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.chapters}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Plan;
