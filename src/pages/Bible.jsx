import React, { useState } from "react";
import esvData from "../data/ESV.json";
import Navbar from "../components/Navbar";

const Bible = () => {
  const [selectedBook, setSelectedBook] = useState(Object.keys(esvData)[0]);
  const [selectedChapter, setSelectedChapter] = useState("1");

  const books = Object.keys(esvData);
  const chapters = Object.keys(esvData[selectedBook]);

  return (
    <div>
      <Navbar />
      <div className="min-h-screen p-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Bible (ESV) {/* TODO: Add more translations */}
        </h2>
        <div className="flex justify-center gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
              Select Book:
            </label>
            <select
              value={selectedBook}
              onChange={(e) => {
                setSelectedBook(e.target.value);
                setSelectedChapter("1"); // Reset chapter when book changes
              }}
              className="mt-1 block w-48 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
            >
              {books.map((book) => (
                <option key={book} value={book}>
                  {book}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
              Select Chapter:
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="mt-1 block w-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
            >
              {chapters.map((chapter) => (
                <option key={chapter} value={chapter}>
                  {chapter}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedBook} {selectedChapter}
          </h3>
          <div className="mt-2 space-y-2">
            {esvData[selectedBook][selectedChapter].map((verse) => (
              <p key={verse.verse} className="text-gray-900 dark:text-gray-300">
                <strong>{verse.verse}</strong> {verse.text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bible;
