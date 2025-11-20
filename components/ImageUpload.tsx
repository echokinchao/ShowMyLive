import React, { useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { UploadedImage } from '../types';

interface ImageUploadProps {
  label: string;
  description: string;
  image: UploadedImage | null;
  onImageChange: (image: UploadedImage | null) => void;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  description,
  image,
  onImageChange,
  disabled = false,
}) => {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onImageChange({
          file,
          previewUrl: URL.createObjectURL(file),
          base64,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    },
    [onImageChange]
  );

  const handleRemove = useCallback(() => {
    onImageChange(null);
  }, [onImageChange]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      
      {!image ? (
        <div className={`relative border-2 border-dashed border-slate-600 rounded-xl p-8 transition-all duration-200 
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500 hover:bg-slate-800/50 group cursor-pointer'}`}>
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            disabled={disabled}
          />
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 bg-slate-800 rounded-full group-hover:bg-slate-700 transition-colors">
              <Upload className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-200">
                点击上传
              </p>
              <p className="text-xs text-slate-400">
                {description}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group rounded-xl overflow-hidden border border-slate-600 bg-slate-900 aspect-[3/4] flex items-center justify-center">
          <img
            src={image.previewUrl}
            alt="预览"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             {!disabled && (
               <button
                onClick={handleRemove}
                className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full transform hover:scale-110 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
             )}
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
            {image.mimeType.split('/')[1].toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
};