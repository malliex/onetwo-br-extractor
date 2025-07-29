import clsx from "clsx";
import { useDropzone, type DropzoneProps } from "react-dropzone";
import { processSingleXml, processZipFile } from "../services/fileProcessor";
import type { ProgressCb } from "../types/osx";
import Spinner from "./Spinner";

type MyDropzoneProps = {
  className?: string;
  isProcessing: boolean;
  onStartProcessing: () => void;
  onStopProcessing: () => void;
  onDownloadReady: (url: string) => void;
  onProgressUpdate?: ProgressCb;
  onMessageUpdate?: (msg: string) => void;
};

export default function MyDropzone({
  className,
  isProcessing,
  onStartProcessing,
  onStopProcessing,
  onDownloadReady,
  onProgressUpdate,
  onMessageUpdate,
}: MyDropzoneProps) {
  const handleFile = async (file: File) => {
    onStartProcessing();
    onMessageUpdate?.("");
    try {
      const blob = file.name.toLowerCase().endsWith(".zip")
        ? await processZipFile(file, onProgressUpdate)
        : await processSingleXml(file, onProgressUpdate);

      const url = URL.createObjectURL(blob);
      onDownloadReady(url);
      onMessageUpdate?.(`Processed: ${file.name}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Processing failed";
      onMessageUpdate?.(msg);
    } finally {
      onStopProcessing();
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (!acceptedFiles[0]) return;
    onDownloadReady(""); // clear previous
    handleFile(acceptedFiles[0]);
  };

  const baseProps: DropzoneProps = {
    accept: {
      "application/zip": [".zip"],
      "application/x-zip-compressed": [".zip"],
      "multipart/x-zip": [".zip"],
      "application/xml": [".xml"],
      "text/xml": [".xml"],
    },
    maxFiles: 1,
    multiple: false,
    onDrop,
  };

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone(baseProps);

  const dropzoneClass = clsx(
    "relative flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-md min-h-[120px] transition-colors duration-300 ease-in-out outline-none",
    "bg-gray-50 text-gray-400",
    {
      "border-blue-500 bg-blue-50": isFocused,
      "border-green-500 bg-green-50": isDragAccept,
      "border-red-500 bg-red-50": isDragReject,
    },
    className
  );

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className={dropzoneClass} {...getRootProps()}>
        <input {...getInputProps()} />
        <p className={clsx({ "blur-sm opacity-50": isProcessing })}>
          Drag &apos;n&apos; drop AppZip or XML files here, or click to select
        </p>
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size={6} />
          </div>
        )}
      </div>
    </div>
  );
}
