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
    <header className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 shadow-sm rounded-lg border gap-4">
      <h1 className="text-xl font-bold flex items-center gap-2 shrink-0">
        <Folder className="text-blue-500" />
        <span>Cloud Drive</span>
      </h1>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {selectedCount > 0 && (
          <button
            onClick={onBulkDelete}
            className="bg-red-100 cursor-pointer text-red-600 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-red-200 transition"
          >
            <Trash2 size={16} />
            <span className="hidden xs:inline cursor-pointer">
              Delete ({selectedCount})
            </span>
            <span className="xs:hidden">{selectedCount}</span>
          </button>
        )}

        <button
          onClick={onNewFolderClick}
          className="flex-1 sm:flex-none  cursor-pointerjustify-center bg-blue-600 text-white px-3 sm:px-4 py-1.5 rounded-md flex items-center gap-2 hover:bg-blue-700 transition text-sm"
        >
          <Plus size={18} />
          <span className="hidden md:inline cursor-pointer">New Folder</span>
          <span className="md:hidden cursor-pointer">New</span>
        </button>

        <label className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-emerald-600 text-white px-3 sm:px-4 py-1.5 rounded-md cursor-pointer hover:bg-emerald-700 transition text-sm font-medium">
          <UploadCloud size={18} />
          <span className="hidden md:inline">Upload</span>
          <input type="file" className="hidden" multiple onChange={onUpload} />
        </label>

        {isAuthenticated && (
          <button
            onClick={onLogout}
            className="bg-gray-100 text-gray-600 p-2 sm:px-4 sm:py-1.5 rounded-md hover:bg-gray-200 transition text-sm font-medium flex items-center gap-2"
            title="Logout"
          >
            <LogOut size={18} />
            <span className="hidden lg:inline cursor-pointer">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
