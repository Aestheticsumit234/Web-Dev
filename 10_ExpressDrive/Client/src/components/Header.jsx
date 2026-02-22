import { useState, useRef, useEffect } from "react";
import {
  Folder,
  Trash2,
  Plus,
  UploadCloud,
  LogOut,
  User,
  CircleUserRound,
  Menu,
  X,
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <header className="mb-6 bg-white p-4 shadow-sm rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between transition-all">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <h1 className="text-xl font-bold flex items-center gap-2 shrink-0">
            <Folder className="text-blue-500" />
            <span>Cloud Drive</span>
          </h1>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md transition"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div
          className={`${
            isMobileMenuOpen
              ? "flex mt-4 pt-4 border-t border-gray-100"
              : "hidden"
          } sm:flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto transition-all`}
        >
          {selectedCount > 0 && (
            <button
              onClick={onBulkDelete}
              className="bg-red-100 cursor-pointer text-red-600 px-3 py-2 sm:py-1.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-200 transition"
            >
              <Trash2 size={16} />
              <span>Delete ({selectedCount})</span>
            </button>
          )}

          <button
            onClick={onNewFolderClick}
            className="cursor-pointer justify-center bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-1.5 rounded-md flex items-center gap-2 hover:bg-blue-700 transition text-sm"
          >
            <Plus size={18} />
            <span>New Folder</span>
          </button>

          <label className="justify-center flex items-center gap-2 bg-emerald-600 text-white px-3 sm:px-4 py-2 sm:py-1.5 rounded-md cursor-pointer hover:bg-emerald-700 transition text-sm font-medium">
            <UploadCloud size={18} />
            <span>Upload</span>
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
                className="w-full sm:w-auto bg-gray-100 text-gray-700 p-2 sm:px-3 sm:py-1.5 rounded-md hover:bg-red-500 hover:text-white transition text-sm font-medium flex items-center justify-center gap-2 group"
                title="My Account"
              >
                <CircleUserRound size={18} className="group-hover:text-white" />
                <span>Profile</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 sm:right-0 mt-2 w-full sm:w-48 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setShowProfileModal(true);
                      setIsMobileMenuOpen(false);
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
