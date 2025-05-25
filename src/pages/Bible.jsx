import React, { useState } from "react";
import esvData from "../data/ESV.json";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Bible = () => {
  const [selectedBook, setSelectedBook] = useState(Object.keys(esvData)[0]);
  const [selectedChapter, setSelectedChapter] = useState("1");

  const books = Object.keys(esvData);
  const chapters = Object.keys(esvData[selectedBook]);

  const enduringWord = selectedBook === 'Psalms' ? "https://enduringword.com/bible-commentary/psalm-" + selectedChapter + "/" : "https://enduringword.com/bible-commentary/" + selectedBook + "-" + selectedChapter + "/"

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto p-6 space-y-8">
          <div className="">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              The Holy Bible
            </h2>
            <h2 className="text-xl font-bold text-center text-gray-900 mb-4">
              English Standard Version
            </h2>
          </div>
          <div className="flex justify-center gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Select Book:
              </label>
              <select
                size={1}
                value={selectedBook}
                onChange={(e) => {
                  setSelectedBook(e.target.value);
                  setSelectedChapter("1");
                }}
                className="mt-1 block w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
              >
                {books.map((book) => (
                  <option key={book} value={book}>
                    {book}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">
                Select Chapter:
              </label>
              <select
                size={1}
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="mt-1 block w-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
              >
                {chapters.map((chapter) => (
                  <option key={chapter} value={chapter}>
                    {chapter}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-lg font-bold text-center text-gray-900">
            <a
              href={enduringWord}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              Enduring Word Commentary for {selectedBook} {selectedChapter}
            </a>
          </div>

          <div className="mx-auto bg-white p-4 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedBook} {selectedChapter}
            </h3>
            <h3 className="text-md font-semibold text-gray-900">
              {esvData[selectedBook][selectedChapter][0].verse === 0 ? esvData[selectedBook][selectedChapter][0].text : ""}
            </h3>
            <p className="text-gray-900 italic">
              {esvData[selectedBook][selectedChapter][1].verse === -1 ? esvData[selectedBook][selectedChapter][1].text : ""}
            </p>
            <div className="mt-2 space-y-2">
              {esvData[selectedBook][selectedChapter].map((verse) => (
                verse.verse !== 0 && verse.verse !== -1 ?
                <p key={verse.verse} className="text-gray-900">
                  <strong>{verse.verse}</strong> {verse.text}
                </p> : <></>
              ))}
            </div>
          </div>

          <div className="mt-1 text-center text-sm text-gray-600 px-4">
            The Holy Bible, English Standard Version. ESV® Text Edition: 2016. Copyright © 2001 by{" "}
            <a
              href="https://www.crossway.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Crossway Bibles, a publishing ministry of Good News Publishers.
            </a>      
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Bible;
