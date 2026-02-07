import React, { useRef, useState } from 'react';
import { Upload, X, File as FileIcon, Image as ImageIcon } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  label?: string;
  maxSize?: number; // in bytes
}

export default function FileUploader({ 
  onFileSelect, 
  accept = ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.zip",
  label = "Attach a file",
  maxSize = 5 * 1024 * 1024 
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      if (file.size > maxSize) {
        setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit.`);
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = selectedFile?.type.startsWith('image/');

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
      
      {!selectedFile ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-all bg-gray-50"
        >
          <Upload className="text-gray-400" size={24} />
          <span className="text-sm text-gray-500 font-medium">Click to upload or drag and drop</span>
          <span className="text-xs text-gray-400">Max size 5MB</span>
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl relative group">
          <div className="w-10 h-10 bg-indigo-100 rounded flex items-center justify-center text-indigo-600">
            {isImage ? <ImageIcon size={20} /> : <FileIcon size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-indigo-900 truncate">{selectedFile.name}</p>
            <p className="text-xs text-indigo-600">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <button 
            type="button"
            onClick={removeFile}
            className="p-1.5 bg-white text-gray-400 hover:text-red-600 rounded-full shadow-sm border border-gray-100 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
      
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
