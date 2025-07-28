import { useCallback, useEffect, useRef } from "react";

type WorkerReq = { type: "parse"; xml: string };
type WorkerRes =
  | { type: "result"; xml: string }
  | { type: "error"; message: string };

export function useParserWorker() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const w = new Worker(new URL("./parser.worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = w;

    return () => {
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  const processXml = useCallback((xml: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const worker = workerRef.current;
      if (!worker) {
        reject(new Error("Worker not initialized"));
        return;
      }

      const onMessage = (e: MessageEvent<WorkerRes>) => {
        const data = e.data;
        if (data.type === "result") {
          worker.removeEventListener("message", onMessage);
          resolve(data.xml);
        } else if (data.type === "error") {
          worker.removeEventListener("message", onMessage);
          reject(new Error(data.message));
        }
      };

      worker.addEventListener("message", onMessage);
      worker.postMessage({ type: "parse", xml } satisfies WorkerReq);
    });
  }, []);

  return { processXml };
}
