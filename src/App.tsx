import clsx from "clsx";
import { useState } from "react";
import MyDropzone from "./components/MyDropzone";
import ProgressBar from "./components/ProgressBar";
import { useDownloadManager } from "./hooks/useDownloadManager";
import { useProcessingState } from "./hooks/useProcessingState";
import { useProgressState } from "./hooks/useProgressState";
import "./index.css";

function App() {
  const { downloadUrl, updateDownloadUrl, resetDownload } =
    useDownloadManager();
  const { isProcessing, startProcessing, stopProcessing } =
    useProcessingState(false);
  const { progress, updateProgress, resetProgress } = useProgressState();
  const [message, setMessage] = useState("");

  const handleReset = () => {
    resetDownload();
    resetProgress();
    setMessage("");
  };

  const showProgress = isProcessing && progress.total > 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
        OneTwo Business Rules Extractor
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Extract business rules from AppZip or XML files
      </p>

      <MyDropzone
        className="w-full max-w-md min-h-32"
        isProcessing={isProcessing}
        onStartProcessing={() => {
          resetProgress();
          startProcessing();
          setMessage("");
        }}
        onStopProcessing={stopProcessing}
        onDownloadReady={updateDownloadUrl}
        onProgressUpdate={updateProgress}
        onMessageUpdate={setMessage}
      />

      {/* Dynamic status container */}
      <div className="w-full max-w-md min-h-[170px] mt-6 flex flex-col items-center justify-start space-y-4">
        {/* Message */}
        <p
          className={clsx(
            "text-sm text-gray-700 font-medium h-5 transition-opacity duration-300",
            message ? "opacity-100 visible" : "opacity-0 invisible"
          )}
        >
          {message || "placeholder"}
        </p>

        {/* Progress */}
        <div
          className={clsx(
            "w-full transition-opacity duration-300",
            showProgress ? "opacity-100 visible" : "opacity-0 invisible"
          )}
        >
          <span className="text-gray-700 block text-center mb-1">
            Processing {progress.current}/{progress.total} files...
          </span>
          <ProgressBar current={progress.current} total={progress.total} />
        </div>

        {/* Buttons */}
        <div
          className={clsx(
            "flex space-x-4 transition-opacity duration-300",
            !isProcessing && downloadUrl
              ? "opacity-100 visible"
              : "opacity-0 invisible"
          )}
        >
          <a
            href={downloadUrl}
            download="OneTwoBrExtract.zip"
            className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
          >
            Download result
          </a>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
