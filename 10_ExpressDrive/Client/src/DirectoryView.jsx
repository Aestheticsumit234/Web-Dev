import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  File,
  Download,
  ExternalLink,
  Edit2,
  Trash2,
  Save,
} from "lucide-react";

function DirectoryView() {
  const BASE_URL = "http://localhost:8080";
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFilename, setNewFilename] = useState("");
  const [newDirname, setNewDirname] = useState("");
  const { dirId } = useParams();

  async function getDirectoryItems() {
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`);
      const data = await response.json();
      setDirectoriesList(data?.directories || []);
      setFilesList(data?.file || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setDirectoriesList([]);
      setFilesList([]);
    }
  }

  useEffect(() => {
    getDirectoryItems();
  }, [dirId]);

  async function uploadFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/files/${dirId || ""}`, true);
    xhr.setRequestHeader("filename", file.name);
    xhr.addEventListener("load", () => {
      console.log(xhr.response);
      getDirectoryItems();
    });
    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = (e.loaded / e.total) * 100;
      setProgress(totalProgress.toFixed(2));
    });
    xhr.send(file);
  }

  async function handleDelete(fileId) {
    const response = await fetch(`${BASE_URL}/files/${fileId}`, {
      method: "DELETE",
    });
    const data = await response.text();
    console.log(data);
    getDirectoryItems();
  }
  async function handleDeleteDirectory(dirId) {
    const response = await fetch(`${BASE_URL}/directory/${dirId}`, {
      method: "DELETE",
    });
    const data = await response.text();
    console.log(data);
    getDirectoryItems();
  }

  async function renameFile(oldFilename) {
    setNewFilename(oldFilename);
  }

  async function saveFilename(fileId) {
    const response = await fetch(`${BASE_URL}/files/${fileId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newFilename }),
    });
    await response.text();
    setNewFilename("");
    getDirectoryItems();
  }

  // Directory ====>
  async function saveDierectoryName(dirId) {
    console.log(dirId);
    const response = await fetch(`${BASE_URL}/directory/${dirId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newFilename }),
    });
    await response.text();
    setNewFilename("");
    getDirectoryItems();
  }

  async function handleCreateDirectory(e) {
    e.preventDefault();
    const url = `${BASE_URL}/directory${dirId ? `/${dirId}` : ""}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        dirname: newDirname,
      },
    });
    await response.json();
    setNewDirname("");
    getDirectoryItems();
  }

  return (
    <div className="ml-3">
      <h1>My Files</h1>
      <input type="file" onChange={uploadFile} />
      <input
        className="border"
        type="text"
        onChange={(e) => setNewFilename(e.target.value)}
        value={newFilename}
      />

      <p>Progress: {progress}%</p>
      <form onSubmit={handleCreateDirectory}>
        <input
          type="text"
          className="border"
          onChange={(e) => setNewDirname(e.target.value)}
          value={newDirname}
        />
        <button>Create Folder</button>
      </form>

      {/* ERROR FIX: ?. use kiya taaki undefined par map crash na ho */}
      {directoriesList?.map(({ name, id }) => (
        <div key={id}>
          {name}{" "}
          <Link to={`/directory/${id}`} className="ml-3 border px-3 py-1">
            Open
          </Link>
          <button
            className="border px-3 py-1 ml-2"
            onClick={() => renameFile(name)}
          >
            Rename
          </button>
          <button
            className="border px-3 py-1 ml-2"
            onClick={() => saveDierectoryName(id)}
          >
            Save
          </button>
          <button
            className="border px-3 py-1 ml-2"
            onClick={() => handleDeleteDirectory(id)}
          >
            Delete
          </button>
          <br />
        </div>
      ))}

      {filesList?.map(({ filename, id }) => (
        <div key={id}>
          {filename}{" "}
          <a className="ml-3 border px-3 py-1" href={`${BASE_URL}/files/${id}`}>
            Open
          </a>
          <a
            className="ml-3 border px-3 py-1"
            href={`${BASE_URL}/files/${id}?action=download`}
          >
            Download
          </a>
          <button
            className="border px-3 py-1 ml-2"
            onClick={() => renameFile(filename)}
          >
            Rename
          </button>
          <button
            className="border px-3 py-1 ml-2"
            onClick={() => saveFilename(id)}
          >
            Save
          </button>
          <button
            className="border px-3 py-1 ml-2"
            onClick={() => handleDelete(id)}
          >
            Delete
          </button>
          <br />
        </div>
      ))}
    </div>
  );
}

export default DirectoryView;
