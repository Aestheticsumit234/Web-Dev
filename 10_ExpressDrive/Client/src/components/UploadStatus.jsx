import { Loader2, X } from "lucide-react";

export const UploadStatus = ({ progress, onAbort }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-2xl rounded-lg border p-4 w-72">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
          <Loader2 className="animate-spin" size={16} /> Uploading...
        </div>
        <button onClick={onAbort} className="text-gray-400 hover:text-red-500">
          <X size={16} />
        </button>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
