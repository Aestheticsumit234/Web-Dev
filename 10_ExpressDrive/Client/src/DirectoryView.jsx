import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext";

// Naye components import karein
import { Header } from "./components/Header";
import { ActionModal } from "./components/ActionModal";
import { ItemRow } from "./components/ItemRow";
import { UploadStatus } from "./components/UploadStatus";

function DirectoryView() {
  const BASE_URL = "http://localhost:8080";
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [showFolderPopup, setShowFolderPopup] = useState(false);
  const [showRenamePopup, setShowRenamePopup] = useState(false);
  const [newDirname, setNewDirname] = useState("");
  const [renameData, setRenameData] = useState({
    id: null,
    name: "",
    type: "",
  });
  const [selectedItems, setSelectedItems] = useState([]);

  const { dirId } = useParams();
  const { logout, isAuthenticated } = useAuth();

  const folderInputRef = useRef(null);
  const renameInputRef = useRef(null);
  const xhrRef = useRef(null);

  // --- Logic Functions (Same as before) ---
  useEffect(() => {
    if (showFolderPopup && folderInputRef.current) {
      folderInputRef.current.focus();
      folderInputRef.current.select();
    }
  }, [showFolderPopup]);

  useEffect(() => {
    if (showRenamePopup && renameInputRef.current) {
      const input = renameInputRef.current;
      const lastDotIndex = input.value.lastIndexOf(".");
      const selectionEnd =
        renameData.type === "file" && lastDotIndex > 0
          ? lastDotIndex
          : input.value.length;
      input.focus();
      input.setSelectionRange(0, selectionEnd);
    }
  }, [showRenamePopup, renameData.id]);

  // Getting All Directory Items
  async function getDirectoryItems() {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`);
      const data = await response.json();
      setDirectoriesList(data?.directories || []);
      setFilesList(data?.file || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getDirectoryItems();
  }, [dirId]);

  // Handling create Directory
  async function handleCreateDirectory() {
    if (!newDirname.trim()) return;
    try {
      await fetch(`${BASE_URL}/directory${dirId ? `/${dirId}` : ""}`, {
        method: "POST",
        headers: { dirname: newDirname },
      });
      toast.success("Folder created!");
      setShowFolderPopup(false);
      getDirectoryItems();
    } catch (err) {
      toast.error("Error creating folder");
    }
  }

  // Handling Rename or update file or directory
  const startRename = (id, name, type) => {
    setRenameData({ id, name, type });
    setShowRenamePopup(true);
  };
  async function handleRenameSave() {
    if (!renameData.name.trim()) return;
    const endpoint = renameData.type === "dir" ? "directory" : "files";
    try {
      await fetch(`${BASE_URL}/${endpoint}/${renameData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newFilename: renameData.name }),
      });
      toast.success("Renamed!");
      setShowRenamePopup(false);
      getDirectoryItems();
    } catch (err) {
      toast.error("Rename failed");
    }
  }

  // Handling Upload file
  async function uploadFile(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setIsUploading(true);
    const uploadToast = toast.loading(`Uploading ${files.length} file(s)...`);
    try {
      for (const file of files) {
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;
          xhr.open("POST", `${BASE_URL}/files/${dirId || ""}`, true);
          xhr.setRequestHeader("filename", file.name);
          xhr.upload.addEventListener("progress", (e) => {
            setProgress(((e.loaded / e.total) * 100).toFixed(0));
          });
          xhr.onload = () => resolve();
          xhr.onerror = () => reject();
          xhr.send(file);
        });
      }
      toast.success("Upload complete!", { id: uploadToast });
    } catch (err) {
      toast.error("Upload failed", { id: uploadToast });
    }
  }

  // Handling Single file or directory Delete
  async function handleDelete(id, type) {
    if (!window.confirm("Delete?")) return;
    const endpoint = type === "dir" ? "directory" : "files";
    try {
      await fetch(`${BASE_URL}/${endpoint}/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      getDirectoryItems();
    } catch (e) {
      toast.error("Error deleting");
    }
  }

  // Handling Bulk delete
  async function handleBulkDelete() {
    if (!window.confirm(`Delete ${selectedItems.length} items?`)) return;
    const deleteToast = toast.loading("Deleting...");
    try {
      const deletePromises = selectedItems.map(async (id) => {
        await fetch(`${BASE_URL}/files/${id}`, { method: "DELETE" });
        await fetch(`${BASE_URL}/directory/${id}`, { method: "DELETE" });
      });
      await Promise.allSettled(deletePromises);
      toast.success("Deleted", { id: deleteToast });
      setSelectedItems([]);
      getDirectoryItems();
    } catch (err) {
      toast.error("Failed", { id: deleteToast });
    }
  }

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      <Toaster position="top-center" />

      <Header
        selectedCount={selectedItems.length}
        onBulkDelete={handleBulkDelete}
        onNewFolderClick={() => {
          setNewDirname("New Folder");
          setShowFolderPopup(true);
        }}
        onUpload={uploadFile}
        isAuthenticated={isAuthenticated}
        onLogout={logout}
      />

      {showFolderPopup && (
        <ActionModal
          title="Create Folder"
          value={newDirname}
          onChange={setNewDirname}
          onSave={handleCreateDirectory}
          onCancel={() => setShowFolderPopup(false)}
          inputRef={folderInputRef}
          btnText="Create"
        />
      )}

      {showRenamePopup && (
        <ActionModal
          title="Rename"
          value={renameData.name}
          onChange={(val) => setRenameData({ ...renameData, name: val })}
          onSave={handleRenameSave}
          onCancel={() => setShowRenamePopup(false)}
          inputRef={renameInputRef}
          btnText="Save"
        />
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="grid grid-cols-12 gap-4 border-b bg-gray-50 px-6 py-3 text-xs font-semibold uppercase text-gray-500">
          <div className="col-span-1">Select</div>
          <div className="col-span-5">Name</div>
          <div className="col-span-6 text-right px-4">Actions</div>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-gray-400">
            Loading drive items...
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {directoriesList.map((dir) => (
              <ItemRow
                key={dir.id}
                type="dir"
                id={dir.id}
                name={dir.name}
                isSelected={selectedItems.includes(dir.id)}
                onToggleSelect={toggleSelect}
                onRename={startRename}
                onDelete={handleDelete}
                baseUrl={BASE_URL}
              />
            ))}
            {filesList.map((file) => (
              <ItemRow
                key={file.id}
                type="file"
                id={file.id}
                name={file.filename}
                isSelected={selectedItems.includes(file.id)}
                onToggleSelect={toggleSelect}
                onRename={startRename}
                onDelete={handleDelete}
                baseUrl={BASE_URL}
              />
            ))}
          </div>
        )}
      </div>

      {isUploading && (
        <UploadStatus
          progress={progress}
          onAbort={() => xhrRef.current?.abort()}
        />
      )}
    </div>
  );
}

export default DirectoryView;
