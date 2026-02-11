import path from "path";

export function safePath(base, userPath = "") {
  const resolved = path.resolve(base, userPath);

  if (!resolved.startsWith(base)) {
    throw new Error("Path Traversal Attempt Blocked");
  }

  if (userPath.includes("..")) {
    throw new Error("Invalid Path");
  }

  return resolved;
}
