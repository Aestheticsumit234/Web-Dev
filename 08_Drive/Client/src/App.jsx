import { useEffect, useState, useRef } from "react";
import {
  Folder,
  UploadCloud,
  LayoutGrid,
  List as ListIcon,
  X,
  FileText,
} from "lucide-react";
import FileItem from "./components/FileItem";
import HardDrive from "../public/nexusD.png";

export default function App() {
  const [items, setItems] = useState([]);
  const [path, setPath] = useState([]);
  const [view, setView] = useState("grid");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [renamingFileName, setRenamingFileName] = useState("");
  const fileInputRef = useRef(null);

  const currentPath = path.join("/");

  async function loadData(folder = "") {
    try {
      const response = await fetch(`http://localhost:3000/${folder}`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Load error:", error);
    }
  }

  useEffect(() => {
    loadData(currentPath);
  }, [currentPath]);

  const loadFolder = (folderName) => setPath([...path, folderName]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const XHR = new XMLHttpRequest();
    XHR.open("POST", `http://localhost:3000/${currentPath}`, true);
    XHR.setRequestHeader("filename", file.name);
    XHR.upload.addEventListener("progress", (e) => {
      setUploadProgress(Math.round((e.loaded / e.total) * 100));
    });
    XHR.addEventListener("load", () => {
      setUploadProgress(null);
      loadData(currentPath);
    });
    XHR.send(file);
  };

  const handleDelete = async (fileName) => {
    const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
    const response = await fetch("http://localhost:3000/", {
      method: "DELETE",
      body: JSON.stringify({ filePath: fullPath }),
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) loadData(currentPath);
  };

  const handleRenameInput = (name) => setRenamingFileName(name);

  const handleSaveFileInput = async (oldName) => {
    const oldFullPath = currentPath ? `${currentPath}/${oldName}` : oldName;
    const newFullPath = currentPath
      ? `${currentPath}/${renamingFileName}`
      : renamingFileName;

    try {
      const response = await fetch(`http://localhost:3000/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName: oldFullPath, newName: newFullPath }),
      });
      if (response.ok) {
        setRenamingFileName("");
        loadData(currentPath);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-slate-900 font-sans relative">
      {previewFile && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-full rounded-[24px] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileText className="text-indigo-600" size={20} />
                <span className="font-bold">{previewFile}</span>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X />
              </button>
            </div>
            <iframe
              src={`http://localhost:3000/${currentPath}/${previewFile}?action=open`}
              className="flex-1 w-full border-none"
            />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <img
              src={HardDrive}
              className="w-10 bg-indigo-600 p-1 rounded cursor-pointer"
              alt="logo"
            />
            <span className="font-bold text-lg">NexusDrive</span>
          </div>
          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <UploadCloud size={16} /> Upload
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
          />
        </header>

        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setPath([])}
              className="text-slate-400 hover:text-indigo-600"
            >
              Home {path.length > 0 && ` / ${path.join(" / ")}`}
            </button>
            <div className="flex bg-slate-100 p-1 rounded-lg gap-2">
              <input
                type="text"
                className="px-2 py-1 text-sm border rounded outline-none"
                placeholder="Rename to..."
                value={renamingFileName}
                onChange={(e) => setRenamingFileName(e.target.value)}
              />
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded ${view === "grid" ? "bg-white text-indigo-600" : "text-slate-400"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded ${view === "list" ? "bg-white text-indigo-600" : "text-slate-400"}`}
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>

          {uploadProgress && (
            <div className="mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
              <div className="flex justify-between text-xs font-bold text-indigo-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div
            className={
              view === "grid"
                ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
                : "bg-white border rounded-xl divide-y"
            }
          >
            {items.map((item, idx) => (
              <FileItem
                key={idx}
                item={item}
                view={view}
                currentPath={currentPath}
                handleDelete={handleDelete}
                handleRenameInput={handleRenameInput}
                handleSaveFileInput={handleSaveFileInput}
                onOpen={() =>
                  item.isDir ? loadFolder(item.name) : setPreviewFile(item.name)
                }
                onPreview={() => setPreviewFile(item.name)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
