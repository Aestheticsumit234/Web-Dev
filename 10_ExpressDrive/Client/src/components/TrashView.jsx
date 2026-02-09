import { File, ArrowLeft, RefreshCw, Trash2, ShieldAlert } from "lucide-react";

function TrashView({ trashData, setView, handleRestore }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
        <ShieldAlert size={18} className="text-amber-600" />
        <p className="text-xs text-amber-700 font-medium">
          These items are in the trash and will be permanently deleted after 30
          days.
        </p>
      </div>

      <div className="divide-y divide-slate-50">
        {trashData.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 p-2 rounded-lg text-slate-400">
                <File size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">{item}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                  Deleted recently
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleRestore(item)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 bg-white border border-slate-200 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
              >
                <RefreshCw size={14} /> RESTORE
              </button>
              <button
                className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                title="Delete Forever"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {trashData.length === 0 && (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <Trash2 size={48} className="text-slate-200" />
            </div>
            <h3 className="text-slate-800 font-bold">Trash is Empty</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-xs">
              Items you delete will show up here before they are gone forever.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrashView;
