import { X, User, Mail, ShieldCheck } from "lucide-react";

export const ProfileModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
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

            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500">
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
  );
};
