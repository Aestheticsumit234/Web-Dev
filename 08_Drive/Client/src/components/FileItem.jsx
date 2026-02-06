import {
  Download,
  FileText,
  Folder,
  Maximize,
  PencilLine,
  Trash,
} from "lucide-react";
import React from "react";

function FileItem({
  item,
  view,
  onOpen,
  onPreview,
  currentPath,
  handleDelete,
}) {
  const isFolder = !item.name.includes(".");

  if (view === "list") {
    return (
      <div
        onClick={onOpen}
        className="flex items-center px-6 py-4 hover:bg-slate-50 cursor-pointer group transition-colors"
      >
        <div
          className={`w-10 h-10 flex items-center justify-center rounded-lg mr-4 ${isFolder ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400 group-hover:bg-white transition-colors"}`}
        >
          {isFolder ? <Folder size={20} /> : <FileText size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-700 truncate">
            {item.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
              title="Preview"
            >
              <Maximize size={18} />
            </button>
          )}
          <a
            href={`http://localhost:3000/${currentPath}/${item.name}?action=download`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
            title="Download"
          >
            <Download size={18} />
          </a>
          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all">
            <Trash size={16} />
          </button>
          <button className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-white rounded-lg transition-all">
            <PencilLine size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onOpen}
      className="group bg-white border border-slate-200 p-5 rounded-2xl hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="aspect-square flex items-center justify-center mb-4 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
        {isFolder ? (
          <Folder size={40} className="text-indigo-500 fill-indigo-500/5" />
        ) : (
          <FileText size={40} className="text-slate-300" />
        )}
      </div>
      <p className="text-sm font-bold text-slate-700 truncate mb-4">
        {item.name}
      </p>

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {isFolder ? (
          <button
            onClick={onOpen}
            className="w-full py-2 text-xs font-bold bg-slate-50 text-slate-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
          >
            Open Folder
          </button>
        ) : (
          <>
            <button
              onClick={onPreview}
              className="flex-1 flex items-center justify-center py-2 bg-slate-50 text-slate-500 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"
              title="Preview"
            >
              <Maximize size={16} />
            </button>
            <a
              href={`http://localhost:3000/${currentPath}/${item.name}?action=download`}
              className="flex-1 flex items-center justify-center py-2 bg-slate-50 text-slate-500 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
              title="Download"
            >
              <Download size={16} />
            </a>
            <button
              onClick={() => handleDelete(item.name)}
              className="flex-1 flex items-center justify-center py-2 bg-slate-50 text-slate-500 hover:bg-red-600 hover:text-white rounded-lg transition-all"
            >
              <Trash size={16} />
            </button>
            <button className="flex-1 flex items-center justify-center py-2 bg-slate-50 text-slate-500 hover:bg-yellow-600 hover:text-white rounded-lg transition-all">
              <PencilLine size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default FileItem;
