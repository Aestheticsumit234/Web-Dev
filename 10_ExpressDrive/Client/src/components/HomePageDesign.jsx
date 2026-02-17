import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  File,
  Folder,
  Download,
  ExternalLink,
  Edit2,
  Trash2,
  Save,
  Plus,
  UploadCloud,
  Loader2,
} from "lucide-react";

function DirectoryView() {
  const BASE_URL = "http://localhost:8080";
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newFilename, setNewFilename] = useState("");
  const [newDirname, setNewDirname] = useState("");
  const [editingId, setEditingId] = useState(null); // Track kounsa file rename ho raha hai
  const { dirId } = useParams();

  async function getDirectoryItems() {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`);
      const data = await response.json();
      // Thoda delay feel dene ke liye (Drive experience)
      setTimeout(() => {
        setDirectoriesList(data?.directories || []);
        setFilesList(data?.file || []);
        setIsLoading(false);
      }, 600);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getDirectoryItems();
  }, [dirId]);

  async function uploadFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/files/${dirId || ""}`, true);
    xhr.setRequestHeader("filename", file.name);

    xhr.addEventListener("load", () => {
      setIsUploading(false);
      setProgress(0);
      getDirectoryItems();
    });

    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = (e.loaded / e.total) * 100;
      setProgress(totalProgress.toFixed(0));
    });
    xhr.send(file);
  }

  // --- Baaki Logic Same Rakha Hai (Bina Change Kiye) ---
  async function handleDelete(fileId) {
    await fetch(`${BASE_URL}/files/${fileId}`, { method: "DELETE" });
    getDirectoryItems();
  }

  async function handleDeleteDirectory(dirId) {
    await fetch(`${BASE_URL}/directory/${dirId}`, { method: "DELETE" });
    getDirectoryItems();
  }

  const startRename = (id, name) => {
    setEditingId(id);
    setNewFilename(name);
  };

  async function saveFilename(fileId) {
    await fetch(`${BASE_URL}/files/${fileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newFilename }),
    });
    setEditingId(null);
    setNewFilename("");
    getDirectoryItems();
  }

  async function saveDierectoryName(dirId) {
    await fetch(`${BASE_URL}/directory/${dirId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newFilename }),
    });
    setEditingId(null);
    setNewFilename("");
    getDirectoryItems();
  }

  async function handleCreateDirectory(e) {
    e.preventDefault();
    if (!newDirname) return;
    const url = `${BASE_URL}/directory${dirId ? `/${dirId}` : ""}`;
    await fetch(url, {
      method: "POST",
      headers: { dirname: newDirname },
    });
    setNewDirname("");
    getDirectoryItems();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      {/* Header Section */}
      <header className="mb-6 flex items-center justify-between bg-white p-4 shadow-sm rounded-lg">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Folder className="text-blue-500" /> Cloud Drive
        </h1>

        <div className="flex gap-3">
          <form onSubmit={handleCreateDirectory} className="flex gap-1">
            <input
              type="text"
              placeholder="New Folder..."
              className="border rounded-md px-3 py-1 text-sm focus:outline-blue-500"
              onChange={(e) => setNewDirname(e.target.value)}
              value={newDirname}
            />
            <button className="bg-blue-600 text-white p-1.5 rounded-md hover:bg-blue-700 transition">
              <Plus size={18} />
            </button>
          </form>

          <label className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-1.5 rounded-md cursor-pointer hover:bg-emerald-700 transition text-sm font-medium">
            <UploadCloud size={18} />
            Upload
            <input type="file" className="hidden" onChange={uploadFile} />
          </label>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Head */}
        <div className="grid grid-cols-12 gap-4 border-b bg-gray-100 px-6 py-3 text-xs font-semibold uppercase text-gray-500">
          <div className="col-span-6">Name</div>
          <div className="col-span-6 text-right">Actions</div>
        </div>

        {isLoading ? (
          // Skeleton Loader
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-8 bg-gray-100 animate-pulse rounded-md w-full"
              ></div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Directories Section */}
            {directoriesList.map(({ name, id }) => (
              <div
                key={id}
                className="grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-gray-50 transition"
              >
                <div className="col-span-6 flex items-center gap-3">
                  <Folder className="text-amber-400 fill-amber-400" size={20} />
                  {editingId === id ? (
                    <input
                      className="border-b border-blue-500 outline-none text-sm w-full"
                      value={newFilename}
                      onChange={(e) => setNewFilename(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <Link
                      to={`/directory/${id}`}
                      className="text-sm font-medium hover:text-blue-600 truncate"
                    >
                      {name}
                    </Link>
                  )}
                </div>
                <div className="col-span-6 flex justify-end gap-2">
                  {editingId === id ? (
                    <button
                      onClick={() => saveDierectoryName(id)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Save size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => startRename(id, name)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteDirectory(id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Files Section */}
            {filesList.map(({ filename, id }) => (
              <div
                key={id}
                className="grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-gray-50 transition"
              >
                <div className="col-span-6 flex items-center gap-3">
                  <File className="text-blue-400" size={20} />
                  {editingId === id ? (
                    <input
                      className="border-b border-blue-500 outline-none text-sm w-full"
                      value={newFilename}
                      onChange={(e) => setNewFilename(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm text-gray-700 truncate">
                      {filename}
                    </span>
                  )}
                </div>
                <div className="col-span-6 flex justify-end gap-2 items-center">
                  <a
                    href={`${BASE_URL}/files/${id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <a
                    href={`${BASE_URL}/files/${id}?action=download`}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                  >
                    <Download size={16} />
                  </a>
                  {editingId === id ? (
                    <button
                      onClick={() => saveFilename(id)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Save size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => startRename(id, filename)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {directoriesList.length === 0 && filesList.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-sm">
                This folder is empty
              </div>
            )}
          </div>
        )}
      </div>

      {/* Uploading Progress Toast */}
      {isUploading && (
        <div className="fixed bottom-4 right-4 bg-white shadow-2xl rounded-lg border p-4 w-72 animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Loader2 className="animate-spin text-blue-600" size={16} />
              Uploading...
            </div>
            <span className="text-xs font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectoryView;
