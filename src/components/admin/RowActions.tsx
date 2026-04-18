import React, { useState } from 'react';
import { Edit2, Trash2, Loader2, AlertCircle, X } from 'lucide-react';

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => Promise<void>;
  itemsName?: string;
}

export function RowActions({ onEdit, onDelete, itemsName = 'item' }: RowActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2 relative">
      <button 
        onClick={onEdit} 
        disabled={isDeleting || showConfirm}
        className="p-1.5 hover:bg-[#00ff9d]/10 rounded-lg text-white/50 hover:text-[#00ff9d] transition-colors disabled:opacity-50"
      >
        <Edit2 className="h-4 w-4" />
      </button>
      
      {!showConfirm ? (
        <button 
          onClick={() => setShowConfirm(true)} 
          disabled={isDeleting}
          className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/50 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-[#0a0a0a] border border-red-500/30 p-1 rounded-lg z-10 shadow-lg shadow-black/50 pr-2 whitespace-nowrap">
          <span className="text-xs font-bold text-red-400 px-2 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Confirm?
          </span>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-bold transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
          </button>
          <button 
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
