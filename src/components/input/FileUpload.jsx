import React, { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const FileUpload = ({
  placeholder = "Choose a file",
  label,
  className,
  register,
  name,
  accept = "image/*",
  onChange,
  value,
  previewContainerClassName,
  imageClassName,
}) => {
  const [preview, setPreview] = useState(value || null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  // Update preview when value prop changes (for editing)
  useEffect(() => {
    if (value && typeof value === "string") {
      setPreview(value);
    } else if (!value) {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      // Call onChange if provided
      if (onChange) {
        onChange(file);
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
          {label}
        </label>
      )}
      
      <div className="space-y-3">
        {/* File Input */}
        <div className="relative group">
          <input
            type="file"
            accept={accept}
            ref={fileInputRef}
            {...(register ? register(name) : {})}
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${name}`}
          />
          <label
            htmlFor={`file-upload-${name}`}
            className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 dark:border-gray-700 py-4 px-5 bg-gray-50/50 dark:bg-black/20 w-full rounded-xl outline-none group-focus-within:border-indigo-500 group-focus-within:ring-4 group-focus-within:ring-indigo-500/10 dark:text-white hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all duration-200"
          >
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500">
              <Upload className="h-5 w-5" />
            </div>
            <span className="text-gray-600 dark:text-gray-300 font-medium text-sm flex-1">
              {fileName || placeholder}
            </span>
          </label>
        </div>

        {/* Preview */}
        {preview && (
          <div className="relative border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm group w-fit">
            <div
              className={`relative bg-gray-100 dark:bg-black/40 ${
                previewContainerClassName || "aspect-video w-full"
              }`}
            >
              <img
                src={preview}
                alt="Preview"
                className={imageClassName || "w-full h-full object-contain"}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="absolute top-3 right-3 bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 h-8 w-8 rounded-lg shadow-sm backdrop-blur-sm transition-all duration-200"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {fileName && (
              <div className="p-3 bg-gray-50/50 dark:bg-white/5 text-xs font-medium text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800">
                {fileName}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

