import { Link } from "react-router-dom";
import {
  Folder,
  File,
  CheckSquare,
  Square,
  Edit2,
  Trash2,
  ExternalLink,
  Download,
} from "lucide-react";

export const ItemRow = ({
  type,
  id,
  name,
  isSelected,
  onToggleSelect,
  onRename,
  onDelete,
  baseUrl,
}) => {
  const isFolder = type === "dir";

  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-gray-50 transition">
      <div className="col-span-1">
        <button onClick={() => onToggleSelect(id)}>
          {isSelected ? (
            <CheckSquare className="text-blue-500" size={18} />
          ) : (
            <Square className="text-gray-300" size={18} />
          )}
        </button>
      </div>

      <div className="col-span-5 flex items-center gap-3">
        {isFolder ? (
          <>
            <Folder className="text-amber-400 fill-amber-400" size={20} />
            <Link
              to={`/directory/${id}`}
              className="text-sm font-medium hover:text-blue-600 truncate"
            >
              {name}
            </Link>
          </>
        ) : (
          <>
            <File className="text-blue-400" size={20} />
            <span className="text-sm text-gray-700 truncate">{name}</span>
          </>
        )}
      </div>

      <div className="col-span-6 flex justify-end gap-2 items-center">
        {!isFolder && (
          <>
            <a
              href={`${baseUrl}/files/${id}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-gray-400 hover:text-blue-500 transition"
            >
              <ExternalLink size={16} />
            </a>
            <a
              href={`${baseUrl}/files/${id}?action=download`}
              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition"
            >
              <Download size={16} />
            </a>
          </>
        )}
        <button
          onClick={() => onRename(id, name, type)}
          className="p-1.5 text-gray-400 hover:text-blue-600 transition"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(id, type)}
          className="p-1.5 text-gray-400 hover:text-red-600 transition"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
