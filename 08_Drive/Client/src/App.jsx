import { useEffect, useState } from "react";
import {
  Folder,
  FileText,
  ArrowLeft,
  ExternalLink,
  Download,
  ChevronRight,
  HardDrive,
} from "lucide-react";

export default function App() {
  const [items, setItems] = useState([]);
  const [path, setPath] = useState([]);

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

  const goBack = () => {
    const newPath = path.slice(0, -1);
    setPath(newPath);
    loadData(newPath.join("/"));
  };

  const isFolder = (name) => !name.includes(".");

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-800 font-sans">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <HardDrive className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              My Drive
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {/* Breadcrumbs & Navigation */}
        <div className="flex items-center gap-4 mb-8">
          {path.length > 0 ? (
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
          ) : null}

          <div className="flex items-center text-sm font-medium text-slate-500 overflow-hidden">
            <span
              className="hover:text-blue-600 cursor-pointer"
              onClick={() => {
                setPath([]);
                loadData("");
              }}
            >
              Root
            </span>
            {path.map((p, i) => (
              <div key={i} className="flex items-center">
                <ChevronRight className="w-4 h-4 mx-1 text-slate-300" />
                <span className="text-slate-900 truncate max-w-[150px]">
                  {p}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Display */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => isFolder(item.name) && loadFolder(item.name)}
              className="group bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative"
            >
              {/* Icon Container */}
              <div className="aspect-square flex items-center justify-center mb-4 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                {isFolder(item.name) ? (
                  <Folder className="w-12 h-12 text-blue-500 fill-blue-500/10" />
                ) : (
                  <FileText className="w-12 h-12 text-slate-400" />
                )}
              </div>

              {/* Name */}
              <p
                className="font-semibold text-sm text-slate-700 truncate w-full mb-4"
                title={item.name}
              >
                {item.name}
              </p>

              {/* Actions */}
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {isFolder(item.name) ? (
                  <button
                    onClick={() => loadFolder(item.name)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                  >
                    Open
                  </button>
                ) : (
                  <>
                    <a
                      href={`http://localhost:3000/${currentPath}/${item.name}?action=open`}
                      className="flex-1 flex items-center justify-center p-2 bg-slate-50 hover:bg-blue-600 text-slate-500 hover:text-white rounded-lg transition-all"
                      title="Open"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href={`http://localhost:3000/${currentPath}/${item.name}?action=download`}
                      className="flex-1 flex items-center justify-center p-2 bg-slate-50 hover:bg-emerald-600 text-slate-500 hover:text-white rounded-lg transition-all"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="text-center py-20">
            <Folder className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-slate-500 font-medium">This folder is empty</h3>
          </div>
        )}
      </main>
    </div>
  );
}
