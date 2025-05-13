import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import esvData from "../data/ESV.json";
import React, { useState } from "react"
import { Randomizer } from "../components/Randomizer";
import Footer from "../components/Footer";

const HowTo = () => {
  const books = Object.keys(esvData)
  const [command, setCommand] = useState('');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto p-6 space-y-8">
          <div>
            <h1 className="text-3xl text-center font-bold text-gray-900">
              Where to Start when doing Time Alone with God
            </h1>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-2">What do I read? The Bible is so big, where do I start?</h2>
            <p className="text-gray-700">
              You can start wherever you want! If you are new to the Bible, you can start by following this{" "} 
              <Link
                    to={"/plan"}
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                40 Day Reading Plan!
              </Link>
            </p>
            <p className="text-gray-700">
              Alternatively, click start to get a random book of the Bible to start reading!
            </p>
            <div className="max-w-sm mx-auto flex justify-center items-center flex-col">
              <Randomizer 
                command={command}
                items={books}
              />        
              <div className="mt-4 flex justify-center gap-4">
                <button onClick={() => {setCommand('start')}} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Start</button>
                <button onClick={() => {setCommand('reset')}} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Reset</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-2">How do I study the Bible? &rarr; Follow COMA</h2>
              <div>
                <p className="font-semibold text-gray-900">Context:</p>
                <p className="text-gray-700">
                  What sort of writing is this?
                </p>
                <p className="text-gray-700">
                  What circumstances surround the writing?
                </p>
                <p className="text-gray-700">
                  Who is the author?
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Observation:</p>
                <p className="text-gray-700">
                  What appears to be the main point of the passage?
                </p>
                <p className="text-gray-700">
                  Is the passage broken down into subsections?
                </p>
                <p className="text-gray-700">
                  What stands out about this passage?
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Meaning:</p>
                <p className="text-gray-700">
                  What is the true meaning of this passage?
                </p>
                <p className="text-gray-700">
                  What does this teach about God?
                </p>
                <p className="text-gray-700">
                  What does this teach about Humanity?
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Application:</p>
                <p className="text-gray-700">
                  How does this passage make me feel?
                </p>
                <p className="text-gray-700">
                  How does this apply to my life?
                </p>
                <p className="text-gray-700">
                  How can I respond in prayer?
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-2">How do I pray? &rarr; Follow ACTS</h2>
              <div>
                <p className="font-semibold text-gray-900">Adoration:</p>
                <p className="text-gray-700">
                  Begin by praising and worshiping God for who He is, acknowledging His greatness and character.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Confession:</p>
                <p className="text-gray-700">
                  Admit and confess your sins to God, seeking forgiveness.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Thanksgiving:</p>
                <p className="text-gray-700">
                  Express gratitude for God's blessings and the good things in your life, recognizing His provision and grace.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Supplication:</p>
                <p className="text-gray-700">
                  Present your requests and needs to God, asking for His help and intervention in your life and the lives of others. 
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowTo;
