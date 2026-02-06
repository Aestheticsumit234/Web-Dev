import { useEffect, useState, useRef, use } from "react";
import {
  Folder,
  FileText,
  ArrowLeft,
  Download,
  ChevronRight,
  HardDrive,
  UploadCloud,
  LayoutGrid,
  List as ListIcon,
  X,
  Maximize,
  Trash,
  PencilLine,
} from "lucide-react";
import FileItem from "./components/FileItem";

export default function App() {
  const [items, setItems] = useState([]);
  const [path, setPath] = useState([]);
  const [view, setView] = useState("grid");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);

  const currentPath = path.join("/");

  async function loadData(folder = "") {
    try {
      const response = await fetch(`http://localhost:3000/${folder}`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Failed to load drive data:", error);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadFolder = (folderName) => {
    const newPath = [...path, folderName];
    setPath(newPath);
    loadData(newPath.join("/"));
  };
  const isFolder = (name) => !name.includes(".");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const XHR = new XMLHttpRequest();
    XHR.open("POST", "http://localhost:3000", true);
    XHR.setRequestHeader("filename", file.name);
    XHR.upload.addEventListener("progress", (e) => {
      setUploadProgress(Math.round((e.loaded / e.total) * 100));
    });
    XHR.addEventListener("load", () => {
      setUploadProgress(null);
      loadData(path.join("/"));
    });
    XHR.send(file);
  };
  async function handleDelete(fileName) {
    const response = await fetch(`http://localhost:3000/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: fileName,
    });

    const data = await response.text();
    console.log(data);
    loadData(path.join("/"));
  }

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-slate-900 font-sans antialiased relative">
      {previewFile && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl h-full rounded-[24px] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <FileText className="text-indigo-600" size={20} />
                <span className="font-bold text-slate-800 truncate max-w-md">
                  {previewFile}
                </span>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-slate-50">
              <iframe
                src={`http://localhost:3000/${currentPath}/${previewFile}?action=open`}
                className="w-full h-full border-none"
                title="File Preview"
              />
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-md shadow-indigo-100">
              <HardDrive size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight">NexusDrive</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-md transition-all ${view === "grid" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-md transition-all ${view === "list" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400"}`}
              >
                <ListIcon size={16} />
              </button>
            </div>
            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            >
              <UploadCloud size={16} />
              <span>Upload</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              className="hidden"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center text-sm font-medium mb-8 bg-white w-fit px-4 py-2 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setPath([]);
                loadData("");
              }}
              className="text-slate-400 hover:text-indigo-600"
            >
              Home
            </button>
            {path.map((p, i) => (
              <div key={i} className="flex items-center">
                <ChevronRight size={14} className="mx-1 text-slate-300" />
                <span
                  className={
                    i === path.length - 1 ? "text-slate-900" : "text-slate-500"
                  }
                >
                  {p}
                </span>
              </div>
            ))}
          </div>

          {uploadProgress !== null && (
            <div className="mb-6 bg-white border border-indigo-100 p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-indigo-600 uppercase">
                  Uploading...
                </span>
                <span className="text-xs font-bold text-indigo-600">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {items.length > 0 ? (
            <div
              className={
                view === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                  : "bg-white border border-slate-200 rounded-xl divide-y divide-slate-100"
              }
            >
              {items.map((item, index) => (
                <FileItem
                  key={index}
                  item={item}
                  view={view}
                  handleDelete={handleDelete}
                  onOpen={() =>
                    isFolder(item.name)
                      ? loadFolder(item.name)
                      : setPreviewFile(item.name)
                  }
                  onPreview={() => setPreviewFile(item.name)}
                  currentPath={currentPath}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-300">
              <Folder size={64} strokeWidth={1} className="mb-2 opacity-20" />
              <p className="font-medium text-slate-400">Directory is empty</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
