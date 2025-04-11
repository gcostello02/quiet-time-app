import { useRef, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import esvData from "../data/ESV.json";

ChartJS.register(ArcElement, Tooltip);

const bibleBooks = Object.keys(esvData)

const SpinnerWheel = () => {
  const chartRef = useRef(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const spinWheel = () => {
    const totalSpins = 6;
    const spinDuration = 6;
  
    const finalAngle = Math.floor(Math.random() * 360);
    const totalRotation = 360 * totalSpins + finalAngle;
  
    const spinnerDiv = document.getElementById("spinner-container");
    spinnerDiv.style.transition = `transform ${spinDuration}s ease-out`;
    spinnerDiv.style.transform = `rotate(${totalRotation}deg)`;
  
    setTimeout(() => {
      const normalizedAngle = finalAngle % 360;
      const segmentAngle = 360 / bibleBooks.length;
      const selectedIndex = Math.floor(
        (bibleBooks.length - (normalizedAngle / segmentAngle)) % bibleBooks.length
      );
  
      setSelectedBook(bibleBooks[selectedIndex]);
    }, spinDuration * 1000);
  };

  const data = {
    labels: bibleBooks,
    datasets: [{
      data: new Array(bibleBooks.length).fill(1),
      backgroundColor: bibleBooks.map((_, i) =>
        `hsl(${240 + (i * 60) / bibleBooks.length}, 70%, 65%)`
      ),
      borderWidth: 1,
    }]
  };

  return (
    <div className="text-center space-y-4 mt-4">
      <div className="w-64 h-64 mx-auto relative">
        <div
          className="w-full h-full transition-transform ease-out duration-[6000ms]"
          style={{ transformOrigin: "center center" }}
          id="spinner-container"
        >
          <Doughnut
            data={data}
            ref={chartRef}
            options={{
              rotation: -90,
              animation: false,
              plugins: { legend: { display: false } },
            }}
          />
        </div>

        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        </div>
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={spinWheel}
      >
        Spin the Wheel!
      </button>
      {selectedBook && (
        <p className="text-lg font-semibold text-indigo-600">
          You should read {selectedBook}
        </p>
      )}
    </div>
  );
};

export default SpinnerWheel;
