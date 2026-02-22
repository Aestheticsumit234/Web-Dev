import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext";
import { Lock } from "lucide-react";

import { Header } from "./components/Header";
import { ActionModal } from "./components/ActionModal";
import { ItemRow } from "./components/ItemRow";
import { UploadStatus } from "./components/UploadStatus";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";

function DirectoryView() {
  const BASE_URL = "http://localhost:8080";
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [accessError, setAccessError] = useState(false);

  const [showFolderPopup, setShowFolderPopup] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showRenamePopup, setShowRenamePopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteData, setDeleteData] = useState({
    id: null,
    type: "",
    isBulk: false,
  });
  const [newDirname, setNewDirname] = useState("");
  const [renameData, setRenameData] = useState({
    id: null,
    name: "",
    type: "",
  });
  const [selectedItems, setSelectedItems] = useState([]);

  const { dirId } = useParams();
  const navigate = useNavigate();

  const { logout, user, isAuthenticated, getProfile } = useAuth();

  const folderInputRef = useRef(null);
  const renameInputRef = useRef(null);
  const xhrRef = useRef(null);

  useEffect(() => {
    const fetchFullProfile = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await fetch(`${BASE_URL}/auth/getme`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          getProfile(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch full user profile:", error);
      }
    };

    fetchFullProfile();
  }, [isAuthenticated]);

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

  async function getDirectoryItems() {
    setIsLoading(true);
    setAccessError(false);
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        setAccessError(true);
        setDirectoriesList([]);
        setFilesList([]);
        return;
      }

      const data = await response.json();
      setDirectoriesList(data?.directories || []);
      setFilesList(data?.file || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setAccessError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getDirectoryItems();
  }, [dirId]);

  async function handleCreateDirectory() {
    if (!newDirname.trim()) return;
    try {
      await fetch(`${BASE_URL}/directory${dirId ? `/${dirId}` : ""}`, {
        method: "POST",
        headers: { dirname: newDirname },
        credentials: "include",
      });
      toast.success("Folder created!");
      setShowFolderPopup(false);
      getDirectoryItems();
    } catch (err) {
      toast.error("Error creating folder");
    }
  }

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
        credentials: "include",
        body: JSON.stringify({ newFilename: renameData.name }),
      });
      toast.success("Renamed!");
      setShowRenamePopup(false);
      getDirectoryItems();
    } catch (err) {
      toast.error("Rename failed");
    }
  }

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
          xhr.withCredentials = true;
          xhr.setRequestHeader("filename", file.name);

          xhr.addEventListener("load", () => {
            setIsUploading(false);
            setProgress(0);
            getDirectoryItems();
          });

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

  function confirmDelete(id, type) {
    setDeleteData({ id: id, type: type, isBulk: false });
    setShowDeletePopup(true);
  }

  function confirmBulkDelete() {
    if (selectedItems.length === 0) return;
    setDeleteData({ id: null, type: "", isBulk: true });
    setShowDeletePopup(true);
  }

  async function executeDelete() {
    setShowDeletePopup(false);

    if (deleteData.isBulk) {
      const deleteToast = toast.loading("Deleting items...");
      try {
        const deletePromises = selectedItems.map(async (id) => {
          await fetch(`${BASE_URL}/files/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
          await fetch(`${BASE_URL}/directory/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
        });
        await Promise.allSettled(deletePromises);
        toast.success("Deleted", { id: deleteToast });
        setSelectedItems([]);
        getDirectoryItems();
      } catch (err) {
        toast.error("Failed", { id: deleteToast });
      }
    } else {
      const endpoint = deleteData.type === "dir" ? "directory" : "files";
      try {
        await fetch(`${BASE_URL}/${endpoint}/${deleteData.id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        toast.success("Deleted");
        getDirectoryItems();
      } catch (e) {
        toast.error("Error deleting");
      }
    }
  }

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleGetProfile = async () => {
    console.log("Click on profile");
    console.log(user);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      <Toaster position="top-center" />

      <Header
        disableActions={accessError}
        selectedCount={selectedItems.length}
        onBulkDelete={confirmBulkDelete}
        onNewFolderClick={() => {
          setNewDirname("New Folder");
          setShowFolderPopup(true);
        }}
        onUpload={uploadFile}
        isAuthenticated={isAuthenticated}
        onLogout={logout}
        handleGetProfile={() => {
          handleGetProfile();
          setShowProfilePopup(true);
        }}
      />

      <DeleteConfirmModal
        isOpen={showDeletePopup}
        onCancel={() => setShowDeletePopup(false)}
        onConfirm={executeDelete}
        isBulk={deleteData.isBulk}
        count={selectedItems.length}
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
        ) : accessError ? (
          <div className="p-16 flex flex-col items-center justify-center text-gray-400">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Lock className="w-8 h-8 text-gray-500" />
            </div>
            <div className="text-lg font-bold text-gray-700 mb-1">
              Access Denied
            </div>
            <p className="text-sm mb-6 max-w-sm text-center">
              This directory doesn't exist or belongs to another user. You don't
              have permission to view or modify it.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              Go to My Drive
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {directoriesList.length === 0 && filesList.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-gray-400">
                <div className="text-lg font-medium text-gray-600 mb-1">
                  This folder is empty
                </div>
                <p className="text-sm">
                  Drag and drop files here or click New Folder
                </p>
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
                    onDelete={confirmDelete}
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
                    onDelete={confirmDelete}
                    baseUrl={BASE_URL}
                  />
                ))}
              </div>
            )}
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
