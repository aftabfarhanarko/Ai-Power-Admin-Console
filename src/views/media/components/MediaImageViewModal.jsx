import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Copy,
  Crop,
  MoreVertical,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

/**
 * Fullscreen image view modal with metadata and actions
 */
export default function MediaImageViewModal({
  image,
  open,
  onClose,
  onCopyUrl,
  onEditUpload,
  onDelete,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, hasNext, hasPrev, onNext, onPrev]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-[80vw] h-[50vh] md:h-[90vh] p-0 overflow-hidden md:mr-40 md:ml-40 bg-black/95 border-none shadow-2xl flex flex-col [&>button]:hidden">
        <DialogTitle className="sr-only">
          {image?.title || t("media.imageView")}
        </DialogTitle>
        {/* Top Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-50 absolute top-0 left-0 right-0">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-bold text-lg truncate max-w-[200px] md:max-w-md drop-shadow-md">
              {image?.title}
            </h2>
            <span className="hidden md:inline-flex px-2 py-0.5 rounded text-xs font-bold bg-white/20 text-white border border-white/10 uppercase drop-shadow-sm">
              {image?.type}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 rounded-full h-10 w-10"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-gray-900 border-gray-800 text-gray-200"
              >
                <DropdownMenuItem
                  onClick={() => onCopyUrl(image?.url)}
                  className="focus:bg-gray-800 focus:text-white cursor-pointer"
                >
                  <Copy className="w-4 h-4 mr-2" /> {t("media.copyUrl")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    onClose();
                    onEditUpload();
                  }}
                  className="focus:bg-gray-800 focus:text-white cursor-pointer"
                >
                  <Crop className="w-4 h-4 mr-2" /> {t("media.editReupload")}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem
                  className="text-red-400 focus:text-red-400 focus:bg-red-900/20 cursor-pointer"
                  onClick={() => image && onDelete(image)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> {t("media.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-6 bg-white/20 mx-2" />

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-300 hover:text-white rounded-full hover:bg-white/10 h-10 w-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-x"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Main Image Area */}
        <div className="flex-1 relative flex items-center justify-center bg-[#050505] p-4 md:p-10 pt-20 pb-20 group">
          {hasPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-50"
              aria-label={t("media.prevImage")}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {image?.url ? (
            <img
              key={image.url}
              src={image.url}
              alt={image.title}
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
          ) : (
            <div className="text-gray-500">{t("media.noImage")}</div>
          )}

          {hasNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-50"
              aria-label={t("media.nextImage")}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>

        {/* Bottom Metadata Bar */}
        <div className="absolute bottom-0 left-0 right-0 px-8 py-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-wrap gap-8 items-center justify-center md:justify-start z-50">
          <div className="flex flex-col text-left">
            <span className="uppercase tracking-widest text-[10px] font-bold text-gray-500 mb-0.5">
              {t("media.titleLabel")}
            </span>
            <span className="text-white text-sm font-medium">
              {image?.title}
            </span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <div className="flex flex-col text-left">
            <span className="uppercase tracking-widest text-[10px] font-bold text-gray-500 mb-0.5">
              {t("media.fileSize")}
            </span>
            <span className="text-white text-sm font-medium">
              {image?.size}
            </span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <div className="flex flex-col text-left">
            <span className="uppercase tracking-widest text-[10px] font-bold text-gray-500 mb-0.5">
              {t("media.dateAdded")}
            </span>
            <span className="text-white text-sm font-medium">
              {image?.date}
            </span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <div className="flex flex-col text-left">
            <span className="uppercase tracking-widest text-[10px] font-bold text-gray-500 mb-0.5">
              {t("media.format")}
            </span>
            <span className="text-white text-sm font-medium">
              {image?.type}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
