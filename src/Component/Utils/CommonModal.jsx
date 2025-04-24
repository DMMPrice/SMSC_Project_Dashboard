// src/Components/Modals/CommonModal.jsx
import React from "react";

const CommonModal = ({isOpen, onClose, title, message, onConfirm, confirmText = "OK", cancelText = "Cancel"}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
                <p className="mb-6 text-gray-600">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
                        {cancelText}
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommonModal;