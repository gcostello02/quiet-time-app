import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import SpinnerWheel from "../components/Spinner";

const HowTo = () => {

  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl text-center font-bold text-gray-900 dark:text-white mb-2">
            Where to Start when doing Time Alone with God
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">What do I read? The Bible is so big, where do I start?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            You can start wherever you want! If you are new to the Bible, you can start by following this{" "} 
            <Link
                  to={"/plan"}
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              40 Day Reading Plan!
            </Link>
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Alternatively, spin the wheel to select a random book of the Bible to start reading!
          </p>
          <SpinnerWheel></SpinnerWheel>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">How do I study the Bible? &rarr; Follow COMA</h2>
            <div>
              <p className="font-semibold">Context:</p>
              <p className="text-gray-700 dark:text-gray-300">
                What sort of writing is this?
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                What circumstances surround the writing?
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Who is the author?
              </p>
            </div>
            <div>
              <p className="font-semibold">Observation:</p>
              <p className="text-gray-700 dark:text-gray-300">
                What appears to be the main point of the passage?
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Is the passage broken down into subsections?
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                What stands out about this passage?
              </p>
            </div>
            <div>
              <p className="font-semibold">Meaning:</p>
              <p className="text-gray-700 dark:text-gray-300">
                What is the true meaning of this passage?
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                What does this teach about God?
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                What does this teach about Humanity?
              </p>
            </div>
            <div>
              <p className="font-semibold">Application:</p>
              <p className="text-gray-700 dark:text-gray-300">
                How does this passage make me feel?
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                How does this apply to my life?
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                How can I respond in prayer?
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">How do I pray? &rarr; Follow ACTS</h2>
            <div>
              <p className="font-semibold">Adoration:</p>
              <p className="text-gray-700 dark:text-gray-300">
                Begin by praising and worshiping God for who He is, acknowledging His greatness and character.
              </p>
            </div>
            <div>
              <p className="font-semibold">Confession:</p>
              <p className="text-gray-700 dark:text-gray-300">
                Admit and confess your sins to God, seeking forgiveness.
              </p>
            </div>
            <div>
              <p className="font-semibold">Thanksgiving:</p>
              <p className="text-gray-700 dark:text-gray-300">
                Express gratitude for God's blessings and the good things in your life, recognizing His provision and grace.
              </p>
            </div>
            <div>
              <p className="font-semibold">Supplication:</p>
              <p className="text-gray-700 dark:text-gray-300">
                Present your requests and needs to God, asking for His help and intervention in your life and the lives of others. 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowTo;
