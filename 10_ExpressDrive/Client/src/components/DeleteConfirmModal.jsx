import { AlertTriangle } from "lucide-react";

export const DeleteConfirmModal = ({
  isOpen,
  onCancel,
  onConfirm,
  isBulk,
  count,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/10 backdrop-blur-md p-4 transition-all">
      {/* Modal Box */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-50 p-3 rounded-full mb-4">
            <AlertTriangle className="text-red-500" size={28} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Confirm Deletion
          </h3>

          <p className="text-sm text-gray-500 mb-6">
            Are you sure you want to delete{" "}
            {isBulk ? <b>{count} selected items</b> : <b>this item</b>}?
            <br />
            This action cannot be undone.
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 cursor-pointer bg-gray-50 text-gray-700 border border-gray-200 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition shadow-sm shadow-red-200 cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
