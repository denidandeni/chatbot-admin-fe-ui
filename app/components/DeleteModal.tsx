"use client";

interface DeleteModalProps {
  isOpen: boolean;
  isLoading: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteModal({
  isOpen,
  isLoading,
  title,
  message,
  onConfirm,
  onCancel,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Semi transparent with highlight effect */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
        onClick={onCancel}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 overflow-y-auto overflow-x-hidden z-50 flex justify-center items-center w-full h-full p-4">
        {/* Modal */}
        <div className="relative w-full max-w-sm bg-white rounded-lg shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>

          <h3 className="text-lg font-bold font-inter text-gray-900 text-center mb-2">
            {title}
          </h3>
          <p className="text-sm font-inter text-gray-600 text-center mb-6">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 font-inter font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-inter font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
