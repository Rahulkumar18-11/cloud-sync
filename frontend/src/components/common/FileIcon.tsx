import React from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  Archive, 
  File, 
  Folder
} from 'lucide-react';
import { FileType } from '../../types/file';

interface FileIconProps {
  type?: FileType | 'folder';
  isFolder?: boolean;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ type, isFolder = false, className = 'w-6 h-6' }) => {
  if (isFolder || type === 'folder') {
    return <Folder className={`${className} text-amber-500 fill-amber-500/20`} />;
  }

  switch (type) {
    case 'pdf':
      return <FileText className={`${className} text-red-500`} />;
    case 'doc':
      return <FileText className={`${className} text-blue-600`} />;
    case 'spreadsheet':
      return <FileSpreadsheet className={`${className} text-emerald-600`} />;
    case 'presentation':
      return <FileText className={`${className} text-orange-500`} />;
    case 'code':
      return <FileCode className={`${className} text-indigo-500`} />;
    case 'image':
      return <FileImage className={`${className} text-purple-500`} />;
    case 'video':
      return <FileVideo className={`${className} text-rose-500`} />;
    case 'audio':
      return <FileAudio className={`${className} text-cyan-500`} />;
    case 'archive':
      return <Archive className={`${className} text-yellow-600`} />;
    default:
      return <File className={`${className} text-gray-400`} />;
  }
};
