import React from "react";
import {
  Folder,
  FileText,
  Maximize,
  Download,
  Trash,
  PencilLine,
  CheckCheck,
} from "lucide-react";

function FileItem({
  item,
  view,
  onOpen,
  onPreview,
  currentPath,
  handleDelete,
  handleRenameInput,
  handleSaveFileInput,
}) {
  const [isRenaming, setIsRenaming] = React.useState(false);
  const isFolder = item.isDir; // TRUST THE BACKEND

  const handleAction = (e, callback) => {
    e.stopPropagation();
    callback();
  };

  const saveRename = () => {
    handleSaveFileInput(item.name);
    setIsRenaming(false);
  };

  const startRename = () => {
    setIsRenaming(true);
    handleRenameInput(item.name);
  };

  if (view === "list") {
    return (
      <div
        onClick={onOpen}
        className="flex items-center px-6 py-3 hover:bg-slate-50 cursor-pointer group"
      >
        <div
          className={`w-10 h-10 flex items-center justify-center rounded-lg mr-4 ${isFolder ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400"}`}
        >
          {isFolder ? <Folder size={20} /> : <FileText size={20} />}
        </div>
        <div className="flex-1 font-bold text-sm text-slate-700">
          {item.name}
        </div>
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={isRenaming ? saveRename : startRename}
            className="p-2 text-slate-400 hover:text-yellow-600"
          >
            {isRenaming ? <CheckCheck size={18} /> : <PencilLine size={18} />}
          </button>
          <button
            onClick={() => handleDelete(item.name)}
            className="p-2 text-slate-400 hover:text-red-600"
          >
            <Trash size={18} />
          </button>
          {!isFolder && (
            <a
              href={`http://localhost:3000/${currentPath}/${item.name}?action=download`}
              className="p-2 text-slate-400 hover:text-indigo-600"
            >
              <Download size={18} />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onOpen}
      className="group bg-white border border-slate-200 p-5 rounded-2xl hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="aspect-square flex items-center justify-center mb-4 bg-slate-50 rounded-xl group-hover:bg-indigo-50">
        {isFolder ? (
          <Folder size={40} className="text-indigo-500" />
        ) : (
          <FileText size={40} className="text-slate-300" />
        )}
      </div>
      <p className="text-sm font-bold text-slate-700 truncate mb-4">
        {item.name}
      </p>
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={isRenaming ? saveRename : startRename}
          className="flex-1 py-2 bg-slate-50 rounded-lg hover:bg-yellow-500 hover:text-white flex justify-center"
        >
          {isRenaming ? <CheckCheck size={16} /> : <PencilLine size={16} />}
        </button>
        <button
          onClick={() => handleDelete(item.name)}
          className="flex-1 py-2 bg-slate-50 rounded-lg hover:bg-red-600 hover:text-white flex justify-center"
        >
          <Trash size={16} />
        </button>
      </div>
    </div>
  );
}
export default FileItem;
