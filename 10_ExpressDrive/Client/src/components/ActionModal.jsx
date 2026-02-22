export const ActionModal = ({
  title,
  value,
  onChange,
  onSave,
  onCancel,
  inputRef,
  btnText,
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-80">
        <h3 className="font-bold mb-4">{title}</h3>
        <input
          ref={inputRef}
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none mb-4"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSave()}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-gray-500 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-3 py-1 bg-blue-600 text-white rounded cursor-pointer"
          >
            {btnText}
          </button>
        </div>
      </div>
    </div>
  );
};
