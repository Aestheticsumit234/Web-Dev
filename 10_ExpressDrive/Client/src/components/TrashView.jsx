import { File, RefreshCw, Trash2, ShieldAlert } from "lucide-react";

function TrashView({ trashData, handleRestore, handleDeletePermanently }) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 bg-amber-50 border-b border-amber-100 flex gap-3">
        <ShieldAlert size={18} className="text-amber-600 shrink-0" />
        <p className="text-[11px] sm:text-xs text-amber-700 font-semibold leading-snug">
          Items here are deleted permanently after 30 days.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {trashData.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <Trash2 size={40} className="text-slate-200" />
            </div>
            <p className="text-slate-500 font-bold">Trash is empty</p>
          </div>
        ) : (
          trashData.map((item, i) => (
            <div
              key={i}
              className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-slate-100 p-2.5 rounded-xl text-slate-400 shrink-0">
                  <File size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate">
                    {item}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">
                    Deleted recently
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRestore(item)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <RefreshCw size={14} /> <span>Restore</span>
                </button>
                <button
                  onClick={() => handleDeletePermanently(item)}
                  className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TrashView;
