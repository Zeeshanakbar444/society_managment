import React from 'react';
import { Trash2, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title = "Delete", message = "Are you sure you would like to do this?", confirmText = "Confirm", cancelText = "Cancel" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <Trash2 size={32} className="text-red-500" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>

                    {/* Message */}
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all active:scale-95"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
