import { useEffect, useState } from "react";
import {
  PencilIcon,
  Trash,
  File,
  Folder,
  UploadCloud,
  Check,
  X,
  Search,
  Bell,
  LayoutGrid,
} from "lucide-react";
import TrashView from "./components/TrashView";

function App() {
  const URL = "http://localhost:8080/";
  const [directoryItems, setDirectoryItems] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFilename, setNewFilename] = useState("");
  const [trashData, setTrashData] = useState([]);
  const [view, setView] = useState("files");
  const [editingFile, setEditingFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function getDirectoryItems() {
    const response = await fetch(URL);
    const data = await response.json();
    setDirectoryItems(data);
  }

  async function getTrashData() {
    const response = await fetch(`${URL}trash`);
    const data = await response.json();
    setTrashData(data);
  }

  useEffect(() => {
    getDirectoryItems();
    getTrashData();
  }, []);

  async function uploadFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${URL}${file.name}`, true);
    xhr.addEventListener("load", () => {
      getDirectoryItems();
      getTrashData();
      setProgress(0);
    });
    xhr.upload.addEventListener("progress", (e) => {
      setProgress(((e.loaded / e.total) * 100).toFixed(0));
    });
    xhr.send(file);
  }

  async function handleDelete(filename) {
    await fetch(`${URL}${filename}`, { method: "DELETE" });
    getDirectoryItems();
    getTrashData();
  }

  async function handleRestore(filename) {
    await fetch(`${URL}trash/${filename}`, { method: "POST" });
    getDirectoryItems();
    getTrashData();
  }

  async function saveFilename(oldFilename) {
    const response = await fetch(`${URL}${oldFilename}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newFilename }),
    });
    if (response.ok) {
      setEditingFile(null);
      setNewFilename("");
      getDirectoryItems();
    }
  }
  const filteredItems = directoryItems.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 px-2 mb-8 cursor-pointer">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
              <Folder size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 ">
              SkyDrive
            </span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setView("files")}
              className={`w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${view === "files" ? "bg-slate-100 text-indigo-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <LayoutGrid size={18} /> All Files
            </button>
            <button
              onClick={() => setView("trash")}
              className={`w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${view === "trash" ? "bg-slate-100 text-red-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Trash size={18} /> Trash Bin
            </button>
          </nav>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="relative w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search files..."
              className="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
            </button>
            <div className="h-8 w-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs border border-indigo-200">
              JD
            </div>
          </div>
        </header>
        <section className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {view === "files" ? "Resources" : "Trash Bin"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {view === "files"
                    ? `${filteredItems.length} items in this folder`
                    : "Items are permanently deleted after 30 days"}
                </p>
              </div>

              {view === "files" && (
                <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg cursor-pointer flex items-center gap-2 font-semibold text-sm transition-all shadow-md shadow-indigo-100 active:scale-95">
                  <UploadCloud size={18} /> Upload New
                  <input type="file" className="hidden" onChange={uploadFile} />
                </label>
              )}
            </div>
            {progress > 0 && progress < 100 && (
              <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-indigo-600">
                  {progress}%
                </span>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {view === "files" ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredItems.map((item, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
                              <File size={20} />
                            </div>
                            {editingFile === item ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  autoFocus
                                  className="border-2 border-indigo-500 p-1 rounded-md w-full text-sm outline-none shadow-sm"
                                  value={newFilename}
                                  onChange={(e) =>
                                    setNewFilename(e.target.value)
                                  }
                                />
                                <button
                                  onClick={() => saveFilename(item)}
                                  className="text-green-600 p-1 hover:bg-green-50 rounded cursor-pointer"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => setEditingFile(null)}
                                  className="text-slate-400 p-1 hover:bg-slate-100 rounded cursor-pointer"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm font-semibold text-slate-700">
                                {item}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a
                              href={`${URL}${item}?action=open`}
                              target="_blank"
                              className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg text-xs font-bold"
                            >
                              VIEW
                            </a>
                            <button
                              onClick={() => {
                                setEditingFile(item);
                                setNewFilename(item);
                              }}
                              className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 cursor-pointer"
                            >
                              <PencilIcon size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <TrashView
                  trashData={trashData}
                  setView={setView}
                  handleRestore={handleRestore}
                  URL={URL}
                />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
