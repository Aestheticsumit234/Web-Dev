import { useEffect, useState, useRef, useCallback } from "react";
import {
  PencilIcon,
  Trash,
  File,
  Folder,
  UploadCloud,
  Check,
  X,
  Search,
  LayoutGrid,
  DownloadIcon,
  FolderPlus,
  Menu,
  Eye,
  Image as ImageIcon,
  FileText,
  Video,
  Edit3,
  Loader2,
  Maximize2,
  Download,
  AlertCircle,
} from "lucide-react";
import TrashView from "./components/TrashView";
import { Link, useParams } from "react-router-dom";

function DirectoryView() {
  const URL = "http://localhost:8080/";
  const [directoryItems, setDirectoryItems] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFilename, setNewFilename] = useState("");
  const [trashData, setTrashData] = useState([]);
  const [view, setView] = useState("files");
  const [editingFile, setEditingFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { "*": dirPath } = useParams();
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  const cleanDirPath = dirPath ? dirPath.replace(/\/+$/, "") : "";

  async function getDirectoryItems() {
    try {
      const response = await fetch(`${URL}directory/${cleanDirPath}`);
      if (!response.ok) throw new Error("Failed to load");
      const data = await response.json();
      setDirectoryItems(data);
    } catch (err) {
      console.error("Directory error:", err);
      setDirectoryItems([]);
    }
  }

  async function getTrashData() {
    try {
      const response = await fetch(`${URL}trash`);
      const data = await response.json();
      setTrashData(data);
    } catch (err) {
      console.error("Trash error:", err);
    }
  }

  useEffect(() => {
    getDirectoryItems();
    getTrashData();
  }, [cleanDirPath]);

  const openPreview = useCallback(
    async (item) => {
      const filePath = cleanDirPath ? `${cleanDirPath}/${item}` : item;
      setPreviewLoading(true);
      setPreviewFile(item);
      setPreviewUrl(`${URL}files/${filePath}?action=download`);

      const img = new Image();
      img.onload = () => setPreviewLoading(false);
      img.onerror = () => setPreviewLoading(false);
      img.src = `${URL}files/${filePath}?action=download`;
    },
    [cleanDirPath],
  );

  const closePreview = useCallback(() => {
    setPreviewFile(null);
    setPreviewUrl("");
    setPreviewLoading(false);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && previewFile) {
        closePreview();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [previewFile, closePreview]);

  useEffect(() => {
    if (previewFile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [previewFile]);

  const getFileType = (filename) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext))
      return "image";
    if (["mp4", "avi", "mov", "webm"].includes(ext)) return "video";
    if (["pdf"].includes(ext)) return "pdf";
    return "document";
  };

  const getFileIcon = (filename) => {
    const type = getFileType(filename);
    if (type === "image") return ImageIcon;
    if (type === "video") return Video;
    return FileText;
  };

  async function uploadFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const cleanName = file.name.replace(/[^\w\-. ]/g, "").substring(0, 100);
    const uploadPath = cleanDirPath
      ? `${cleanDirPath}/${cleanName}`
      : cleanName;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${URL}files/${uploadPath}`, true);

    xhr.onload = () => {
      if (xhr.status === 200) {
        getDirectoryItems();
        getTrashData();
      }
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(((e.loaded / e.total) * 100).toFixed(0));
      }
    };

    xhr.send(file);
  }

  async function handleDelete(filename) {
    const cleanFilename = decodeURIComponent(filename).replace(
      /[^\w\-. ]/g,
      "",
    );
    const filePath = cleanDirPath
      ? `${cleanDirPath}/${cleanFilename}`
      : cleanFilename;

    try {
      await fetch(`${URL}files/${filePath}`, { method: "DELETE" });
      getDirectoryItems();
      getTrashData();
      if (previewFile === filename) closePreview();
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  async function handleCreateFolder() {
    if (!folderName.trim()) return;
    const folderPath = cleanDirPath
      ? `${cleanDirPath}/${folderName.trim()}`
      : folderName.trim();

    try {
      const response = await fetch(`${URL}directory/${folderPath}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Folder failed");

      setFolderName("");
      setShowModal(false);
      getDirectoryItems();
    } catch (err) {
      console.error("Folder error:", err);
    }
  }

  async function startEdit(filename) {
    setEditingFile(filename);
    setNewFilename(filename);
  }

  async function saveFilename() {
    if (!editingFile || !newFilename.trim()) return;

    const cleanOld = decodeURIComponent(editingFile).replace(/[^\w\-. ]/g, "");
    const oldPath = cleanDirPath ? `${cleanDirPath}/${cleanOld}` : cleanOld;
    const newPath = cleanDirPath
      ? `${cleanDirPath}/${newFilename.trim()}`
      : newFilename.trim();

    try {
      const response = await fetch(`${URL}files/${oldPath}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newFilename: newPath }),
      });

      if (response.ok) {
        setEditingFile(null);
        setNewFilename("");
        getDirectoryItems();
      }
    } catch (err) {
      console.error("Rename error:", err);
    }
  }

  async function handleRestore(item) {
    await fetch(`${URL}trash/${item}`, { method: "POST" });
    getDirectoryItems();
    getTrashData();
  }

  async function handleDeletePermanently(item) {
    await fetch(`${URL}trash/${item}`, { method: "DELETE" });
    getTrashData();
  }

  const filteredItems = directoryItems.filter(({ item }) =>
    item.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
        {/* Sidebar & Header - same as before */}
        <div
          className={`fixed inset-0 bg-slate-900/50 z-40 transition-opacity lg:hidden ${
            isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />

        <aside
          className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:static`}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-10 px-2">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Folder size={20} />
              </div>
              <span className="text-xl font-bold">SkyDrive</span>
            </div>
            <nav className="space-y-1 flex-1">
              <button
                onClick={() => {
                  setView("files");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                  view === "files"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <LayoutGrid size={18} /> All Files
              </button>
              <button
                onClick={() => {
                  setView("trash");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                  view === "trash"
                    ? "bg-red-50 text-red-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Trash size={18} /> Trash Bin
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between gap-4 shadow-sm">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full bg-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-9 w-9 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
              JD
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {view === "files" ? "My Files" : "Trash"}
                  </h1>
                  <p className="text-slate-500 mt-1">
                    {filteredItems.length} items
                  </p>
                </div>

                {view === "files" && (
                  <div className="flex gap-3 flex-wrap">
                    <label className="group bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-2xl cursor-pointer flex items-center gap-2 text-sm font-bold shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-[1.02]">
                      <UploadCloud size={20} />
                      Upload
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={uploadFile}
                      />
                    </label>
                    <button
                      onClick={() => setShowModal(true)}
                      className="bg-white border-2 border-dashed border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold hover:border-indigo-300 hover:shadow-lg transition-all"
                    >
                      <FolderPlus size={20} className="text-indigo-600" />
                      New Folder
                    </button>
                  </div>
                )}
              </div>

              {progress > 0 && progress < 100 && (
                <div className="mb-6 bg-slate-200 h-2 rounded-2xl overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl shadow-lg transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl overflow-hidden">
                {view === "files" ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/50">
                        <tr className="">
                          <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">
                            Name
                          </th>
                          <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase text-right tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/50">
                        {filteredItems.length === 0 ? (
                          <tr>
                            <td colSpan="2" className="p-24 text-center">
                              <div className="text-slate-400">
                                <Folder
                                  size={64}
                                  className="mx-auto mb-4 opacity-25"
                                />
                                <p className="text-lg font-medium">
                                  No files found
                                </p>
                                <p className="text-sm mt-1">
                                  Get started by creating a new folder or
                                  uploading files
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredItems.map(({ item, isDirectory }, i) => (
                            <tr
                              key={i}
                              className="group hover:bg-slate-50/50 transition-all duration-200 border-b border-slate-100/50 last:border-b-0"
                            >
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`p-3 rounded-2xl shadow-sm transition-all group-hover:scale-105 ${
                                      isDirectory
                                        ? "bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 border-2 border-indigo-200/50"
                                        : "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border-2 border-blue-200/50"
                                    }`}
                                  >
                                    {isDirectory ? (
                                      <Folder size={24} />
                                    ) : (
                                      <File size={24} />
                                    )}
                                  </div>

                                  {editingFile === item ? (
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <input
                                        type="text"
                                        className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                                        value={newFilename}
                                        onChange={(e) =>
                                          setNewFilename(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") saveFilename();
                                          if (e.key === "Escape") {
                                            setEditingFile(null);
                                            setNewFilename("");
                                          }
                                        }}
                                        autoFocus
                                      />
                                      <button
                                        onClick={saveFilename}
                                        className="p-2.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl shadow-sm transition-all"
                                        title="Save (Enter)"
                                      >
                                        <Check size={18} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingFile(null);
                                          setNewFilename("");
                                        }}
                                        className="p-2.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl shadow-sm transition-all"
                                        title="Cancel (Escape)"
                                      >
                                        <X size={18} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-3 flex-1">
                                      <span
                                        className="font-semibold text-slate-800 truncate cursor-pointer hover:text-indigo-600 max-w-[300px] py-1 px-2 rounded-lg group-hover:bg-indigo-50 transition-all"
                                        onClick={() => startEdit(item)}
                                        title={`Rename ${item}`}
                                      >
                                        {item}
                                      </span>
                                      {!isDirectory && (
                                        <button
                                          onClick={() => openPreview(item)}
                                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all group-hover:scale-110"
                                          title="Preview"
                                        >
                                          <Eye size={18} />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {isDirectory ? (
                                    <Link
                                      to={`./${item}`}
                                      className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                                      title="Open folder"
                                    >
                                      Open
                                    </Link>
                                  ) : (
                                    <a
                                      href={`${URL}files/${cleanDirPath ? cleanDirPath + "/" + item : item}?action=download`}
                                      className="p-3 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl shadow-sm hover:shadow-md transition-all"
                                      title="Download"
                                    >
                                      <DownloadIcon size={20} />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => handleDelete(item)}
                                    className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl shadow-sm hover:shadow-md transition-all group-hover:scale-110"
                                  >
                                    <Trash size={20} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <TrashView
                    trashData={trashData}
                    handleRestore={handleRestore}
                    handleDeletePermanently={handleDeletePermanently}
                  />
                )}
              </div>
            </div>
          </div>
        </main>

        {/* CREATE FOLDER MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-200/50 animate-in zoom-in-95 duration-300">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6">
                New Folder
              </h2>
              <input
                type="text"
                className="w-full border-2 border-slate-200 p-4 rounded-2xl text-lg font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 shadow-sm transition-all"
                placeholder="Enter folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
              <div className="flex gap-3 justify-end mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ PROFESSIONAL FULL-SCREEN PREVIEW OVERLAY */}
      {previewFile && (
        <div
          ref={previewRef}
          className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-2 animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.target === e.currentTarget && closePreview()}
        >
          <div className="w-full h-full flex flex-col bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200/30 overflow-hidden animate-in slide-in-from-right duration-500">
            {/* Preview Header */}
            <div className="px-2 py-1 border-b border-slate-200/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className=" bg-gradient-to-br from-indigo-100 to-indigo-200 p-2 rounded-2xl">
                  <File size={24} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 truncate max-w-sm">
                    {previewFile}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {getFileType(previewFile).toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-2xl font-semibold hover:bg-green-700 shadow-lg transition-all"
                  download={previewFile}
                >
                  <Download size={18} />
                  Download
                </a>
                <button
                  onClick={() => handleDelete(previewFile)}
                  className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-2xl transition-all"
                >
                  <Trash size={20} />
                </button>
                <button
                  onClick={closePreview}
                  className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto p-1">
              {previewLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                    <p className="text-slate-600 font-medium">
                      Loading preview...
                    </p>
                  </div>
                </div>
              ) : previewUrl ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-full h-96 lg:h-[658px] flex items-center justify-center bg-slate-800 rounded-xl border-2 border-dashed border-slate-200/50">
                    {getFileType(previewFile) === "image" ? (
                      <img
                        src={previewUrl}
                        alt={previewFile}
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                      />
                    ) : getFileType(previewFile) === "video" ? (
                      <video
                        src={previewUrl}
                        controls
                        className="max-w-full max-h-full rounded-xl shadow-2xl"
                      >
                        Your browser doesn't support video preview.
                      </video>
                    ) : (
                      <div className="flex flex-col items-center gap-4 p-12 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center">
                          <File size={32} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-700">
                            Preview not available
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            {getFileType(previewFile) === "pdf"
                              ? "PDF preview requires download"
                              : "Use download button"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 text-slate-500">
                  <AlertCircle size={48} />
                  <span className="ml-3 font-medium">
                    Failed to load preview
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900/80 text-white px-6 py-3 rounded-2xl text-sm backdrop-blur-sm border border-slate-700/50">
            Press{" "}
            <kbd className="bg-white/20 px-2 py-1 rounded font-mono text-xs mx-1">
              ESC
            </kbd>{" "}
            to close
          </div>
        </div>
      )}
    </>
  );
}

export default DirectoryView;
