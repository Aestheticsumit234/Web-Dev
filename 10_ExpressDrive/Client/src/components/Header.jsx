import { Folder, Trash2, Plus, UploadCloud, LogOut } from "lucide-react";

export const Header = ({
  selectedCount,
  onBulkDelete,
  onNewFolderClick,
  onUpload,
  isAuthenticated,
  onLogout,
}) => {
  return (
    <header className="mb-6 flex items-center justify-between bg-white p-4 shadow-sm rounded-lg border">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Folder className="text-blue-500" /> Cloud Drive
      </h1>
      <div className="flex items-center gap-3">
        {selectedCount > 0 && (
          <button
            onClick={onBulkDelete}
            className="bg-red-100 text-red-600 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-red-200 transition"
          >
            <Trash2 size={16} /> Bulk Delete ({selectedCount})
          </button>
        )}

        <button
          onClick={onNewFolderClick}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-md flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} /> New Folder
        </button>

        <label className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-1.5 rounded-md cursor-pointer hover:bg-emerald-700 transition text-sm font-medium">
          <UploadCloud size={18} /> Upload
          <input type="file" className="hidden" multiple onChange={onUpload} />
        </label>

        {isAuthenticated && (
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700 text-sm font-medium flex items-center gap-2"
          >
            <LogOut size={18} /> Logout
          </button>
        )}
      </div>
    </header>
  );
};
