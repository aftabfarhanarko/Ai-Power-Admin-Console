import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Copy, Crop, Eye, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

/**
 * Single media item for list view
 */
export default function MediaListItem({ image, onView, onCopyUrl, onEditUpload, onDelete }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="group bg-white dark:bg-[#1a1f26] rounded-[20px] p-2 pr-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:shadow-indigo-500/5 transition-all flex items-center gap-4 cursor-pointer"
      onClick={() => onView(image)}
    >
      <div className="w-16 h-16 rounded-[14px] overflow-hidden bg-gray-100 dark:bg-white/5 shrink-0 relative">
        <img src={image.url} className="w-full h-full object-cover" alt={image.title} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
          {image.title}
        </h3>
        <p className="text-sm text-gray-400">
          {image.date} • {image.size}
        </p>
      </div>

      <span className="hidden sm:inline-block text-xs font-bold text-gray-500 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-md uppercase border border-gray-100 dark:border-gray-800">
        {image.type}
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex text-gray-400 hover:text-indigo-600 rounded-full"
        >
          <Eye className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
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
    </motion.div>
  );
}
