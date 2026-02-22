import { useState, useRef, useEffect } from "react";
import {
  Folder,
  Trash2,
  Plus,
  UploadCloud,
  LogOut,
  User,
  CircleUserRound,
} from "lucide-react";
import { ProfileModal } from "./ProfileModal";
import { useAuth } from "../contexts/AuthContext";

export const Header = ({
  selectedCount,
  onBulkDelete,
  onNewFolderClick,
  onUpload,
  isAuthenticated,
  onLogout,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 shadow-sm rounded-lg border gap-4">
        <h1 className="text-xl font-bold flex items-center gap-2 shrink-0">
          <Folder className="text-blue-500" />
          <span>Cloud Drive</span>
        </h1>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {selectedCount > 0 && (
            <button
              onClick={onBulkDelete}
              className="bg-red-100 cursor-pointer text-red-600 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-red-200 transition"
            >
              <Trash2 size={16} />
              <span className="hidden xs:inline cursor-pointer">
                Delete ({selectedCount})
              </span>
              <span className="xs:hidden">{selectedCount}</span>
            </button>
          )}

          <button
            onClick={onNewFolderClick}
            className="flex-1 sm:flex-none cursor-pointer justify-center bg-blue-600 text-white px-3 sm:px-4 py-1.5 rounded-md flex items-center gap-2 hover:bg-blue-700 transition text-sm"
          >
            <Plus size={18} />
            <span className="hidden md:inline cursor-pointer">New Folder</span>
            <span className="md:hidden cursor-pointer">New</span>
          </button>

          <label className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-emerald-600 text-white px-3 sm:px-4 py-1.5 rounded-md cursor-pointer hover:bg-emerald-700 transition text-sm font-medium">
            <UploadCloud size={18} />
            <span className="hidden md:inline">Upload</span>
            <input
              type="file"
              className="hidden"
              multiple
              onChange={onUpload}
            />
          </label>

          {isAuthenticated && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="bg-gray-100 text-gray-700 hover:text-white p-2 sm:px-3 sm:py-1.5 rounded-full sm:rounded-md hover:bg-red-500 transition text-sm font-medium flex items-center justify-center gap-2"
                title="My Account"
              >
                <CircleUserRound size={18} className="group-hover:text-white" />
                <span className="hidden lg:inline cursor-pointer">Profile</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition"
                  >
                    <User size={16} /> Profile
                  </button>
                  <div className="h-px bg-gray-100 my-1 w-full"></div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />
    </>
  );
};
