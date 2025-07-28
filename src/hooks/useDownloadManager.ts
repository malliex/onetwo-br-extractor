import { useCallback, useState } from "react";

export function useDownloadManager() {
  const [downloadUrl, setDownloadUrl] = useState<string>("");

  const updateDownloadUrl = useCallback((blobUrl: string) => {
    setDownloadUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return blobUrl;
    });
  }, []);

  const resetDownload = useCallback(() => {
    setDownloadUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return "";
    });
  }, []);

  return { downloadUrl, updateDownloadUrl, resetDownload };
}
