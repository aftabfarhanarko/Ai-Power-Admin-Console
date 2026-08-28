import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Copy, Crop, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

/**
 * Single media card for grid view
 */
export default function MediaCard({ image, onView, onCopyUrl, onEditUpload, onDelete }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      className="group relative"
      onClick={() => onView(image)}
    >
      <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-2 shadow-sm border border-gray-100 dark:border-gray-800 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 transition-all duration-500 h-full flex flex-col cursor-pointer">
        <div className="relative aspect-square rounded-[20px] overflow-hidden bg-gray-100 dark:bg-white/5">
          <div className="absolute inset-0 z-20 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

          <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-8 w-8 bg-white/90 backdrop-blur-sm dark:bg-black/60 rounded-full flex items-center justify-center text-gray-700 dark:text-white shadow-lg hover:scale-105 transition-transform"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyUrl(image.url);
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {t("media.copyUrl")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditUpload();
                  }}
                >
                  <Crop className="w-4 h-4 mr-2" />
                  {t("media.editReupload")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                  onClick={(e) => onDelete(image, e)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("media.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <img
            src={image.url}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={image.title}
          />
        </div>

        <div className="p-3">
          <div className="flex justify-between items-start mb-1">
            <h3
              className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1"
              title={image.title}
            >
              {image.title}
            </h3>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{image.size}</p>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 px-1.5 py-0.5 rounded uppercase border border-gray-100 dark:border-gray-800">
              {image.type}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
