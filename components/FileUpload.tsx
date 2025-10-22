
import React, { useRef, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  id: string;
  onFileChange: (files: FileList | null) => void;
  multiple?: boolean;
  accept?: string;
  label: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id,
  onFileChange,
  multiple = false,
  accept,
  label
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files);
      // To show file names if needed
      if(fileInputRef.current) fileInputRef.current.files = e.dataTransfer.files;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e.target.files);
  };

  return (
    <div>
      <input
        type="file"
        id={id}
        ref={fileInputRef}
        onChange={handleChange}
        multiple={multiple}
        accept={accept}
        className="hidden"
      />
      <div
        onClick={handleFileSelect}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
          ${isDragging ? 'border-cyan-400 bg-slate-700/50' : 'border-slate-600 bg-slate-800 hover:bg-slate-700/80 hover:border-slate-500'}`}
      >
        <UploadIcon className="w-10 h-10 mb-3 text-slate-500"/>
        <p className="text-sm font-semibold text-cyan-400">Arrastra archivos o haz clic para subir</p>
        <p className="text-xs text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
};
