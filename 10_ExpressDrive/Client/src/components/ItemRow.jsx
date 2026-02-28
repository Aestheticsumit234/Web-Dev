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
  Image as ImageIcon,
  FileText,
  FileCode,
} from "lucide-react";

const getFileIcon = (filename) => {
  if (!filename.includes("."))
    return <File className="text-blue-400" size={20} />;

  const ext = filename.split(".").pop().toLowerCase();

  switch (ext) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
      return <ImageIcon className="text-purple-500" size={20} />;
    case "pdf":
      return <FileText className="text-red-500" size={20} />;
    case "doc":
    case "docx":
    case "txt":
      return <FileText className="text-blue-600" size={20} />;
    case "md":
    case "markdown":
      return <FileCode className="text-gray-700" size={20} />;
    default:
      return <File className="text-blue-400" size={20} />;
  }
};

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
            <CheckSquare className="text-blue-500 cursor-pointer" size={18} />
          ) : (
            <Square className="text-gray-300 cursor-pointer" size={18} />
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
            {getFileIcon(name)}
            <span className="text-sm text-gray-700 truncate">{name}</span>
          </>
        )}
      </div>

      <div className="col-span-6 flex justify-end gap-2 items-center">
        {!isFolder && (
          <>
            <a
              href={`${baseUrl}/files/${id}`}
              rel="noreferrer"
              className="p-1.5 text-gray-400 hover:text-blue-500 transition cursor-pointer"
            >
              <ExternalLink size={16} />
            </a>
            <a
              href={`${baseUrl}/files/${id}?action=download`}
              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition cursor-pointer"
            >
              <Download size={16} />
            </a>
          </>
        )}
        <button
          onClick={() => onRename(id, name, type)}
          className="p-1.5 text-gray-400 hover:text-blue-600 transition cursor-pointer"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(id, type)}
          className="p-1.5 text-gray-400 hover:text-red-600 transition cursor-pointer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
