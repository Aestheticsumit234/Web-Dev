import { useState, useRef, useEffect } from "react";
import { X, User, Mail, ShieldCheck, Pencil, Lock, Check } from "lucide-react";

export const ProfileModal = ({ isOpen, onClose, user, onSaveProfile }) => {
  const [editModalConfig, setEditModalConfig] = useState({
    isOpen: false,
    field: "",
    value: "",
    title: "",
  });

  const editInputRef = useRef(null);

  useEffect(() => {
    if (editModalConfig.isOpen && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editModalConfig.isOpen]);

  if (!isOpen || !user) return null;

  const handleEditClick = (field) => {
    let initialValue = "";
    let title = "";

    if (field === "username") {
      initialValue = user.username;
      title = "Edit Username";
    } else if (field === "email") {
      initialValue = user.email;
      title = "Edit Email";
    } else if (field === "password") {
      initialValue = "";
      title = "Change Password";
    }

    setEditModalConfig({ isOpen: true, field, value: initialValue, title });
  };

  const closeEditModal = () => {
    setEditModalConfig({ isOpen: false, field: "", value: "", title: "" });
  };

  const handleSave = () => {
    if (onSaveProfile && editModalConfig.value.trim() !== "") {
      onSaveProfile(editModalConfig.field, editModalConfig.value);
    } else {
      console.log(`Saving ${editModalConfig.field}:`, editModalConfig.value);
      // TODO: iske code likhung baaaaaad me
    }
    closeEditModal();
  };

  return (
    <>
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-gray-500/20 backdrop-blur-md p-4 transition-all">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full h-full overflow-hidden animate-in fade-in duration-200 flex flex-col">
          <div className="h-24 bg-linear-to-r from-blue-600 to-blue-400 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center flex-1">
            <div className="w-20 h-20 bg-white rounded-full p-1.5 -mt-10 shadow-md mb-3 relative shrink-0">
              <div className="w-full h-full bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold uppercase">
                {user.username ? user.username.charAt(0) : "U"}
              </div>
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 capitalize mb-1">
              {user.username}
            </h3>
            <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium mb-4 flex items-center gap-1">
              <ShieldCheck size={14} /> Account Active
            </span>

            <div className="w-full bg-gray-50 rounded-xl p-4 space-y-3 text-left border border-gray-100 mb-4">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">
                      Username
                    </p>
                    <p className="text-gray-800 font-medium capitalize">
                      {user.username}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick("username")}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                  title="Edit Username"
                >
                  <Pencil size={14} />
                </button>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3 text-sm overflow-hidden pr-2">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500 shrink-0">
                    <Mail size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500 font-medium uppercase">
                      Email
                    </p>
                    <p className="text-gray-800 font-medium truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick("email")}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition shrink-0 cursor-pointer"
                  title="Edit Email"
                >
                  <Pencil size={14} />
                </button>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3 text-sm overflow-hidden pr-2">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500 shrink-0">
                    <Lock size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500 font-medium uppercase">
                      Password
                    </p>
                    <p className="text-gray-800 font-medium truncate">
                      ••••••••
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick("password")}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition shrink-0 cursor-pointer"
                  title="Change Password"
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-auto w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {editModalConfig.isOpen && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-gray-900/40 p-4 transition-all animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h4 className="font-semibold text-gray-800">
                {editModalConfig.title}
              </h4>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <input
                ref={editInputRef}
                type={
                  editModalConfig.field === "password" ? "password" : "text"
                }
                value={editModalConfig.value}
                onChange={(e) =>
                  setEditModalConfig({
                    ...editModalConfig,
                    value: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder={`Enter new ${editModalConfig.field}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") closeEditModal();
                }}
              />

              <div className="flex gap-2 mt-4">
                <button
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check size={16} /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
