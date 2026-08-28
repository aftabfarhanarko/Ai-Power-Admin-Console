import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Upload,
  Image as ImageIcon,
  Crop,
  Check,
  Copy,
  Loader2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { useUploadMediaMutation } from "@/features/media/mediaApiSlice";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";

/**
 * Media Upload Modal - Select, Crop & Upload flow
 */
export default function MediaUploadModal({ open, onOpenChange, companyId }) {
  const { t } = useTranslation();
  const [uploadStep, setUploadStep] = useState("select");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cropBox, setCropBox] = useState({
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const constraintsRef = useRef(null);
  const cropBoxRef = useRef(null);

  const [uploadMedia] = useUploadMediaMutation();

  const handleCloseModal = () => {
    onOpenChange?.(false);
    setTimeout(() => {
      setUploadStep("select");
      setSelectedFile(null);
      setPreviewUrl(null);
      setGeneratedUrl(null);
      setIsProcessing(false);
      setProgress(0);
      setCropBox({ x: 25, y: 25, width: 50, height: 50 });
    }, 300);
  };

  const handleResizeStart = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startBox = { ...cropBox };
    const container = constraintsRef.current.getBoundingClientRect();

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const deltaXPct = (deltaX / container.width) * 100;
      const deltaYPct = (deltaY / container.height) * 100;

      let newBox = { ...startBox };

      if (direction.includes("e")) {
        newBox.width = Math.max(
          10,
          Math.min(startBox.width + deltaXPct, 100 - startBox.x),
        );
      }
      if (direction.includes("s")) {
        newBox.height = Math.max(
          10,
          Math.min(startBox.height + deltaYPct, 100 - startBox.y),
        );
      }
      if (direction.includes("w")) {
        const constrainedDeltaX = Math.max(deltaXPct, -startBox.x);
        const finalDeltaX = Math.min(constrainedDeltaX, startBox.width - 10);
        newBox.x = startBox.x + finalDeltaX;
        newBox.width = startBox.width - finalDeltaX;
      }
      if (direction.includes("n")) {
        const constrainedDeltaY = Math.max(deltaYPct, -startBox.y);
        const finalDeltaY = Math.min(constrainedDeltaY, startBox.height - 10);
        newBox.y = startBox.y + finalDeltaY;
        newBox.height = startBox.height - finalDeltaY;
      }

      setCropBox(newBox);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setUploadStep("crop");
    }
  };

  const handleCropAndGenerate = async () => {
    if (!companyId) {
      toast.error(t("media.companyContextRequired"));
      return;
    }
    setIsProcessing(true);
    setProgress(10);

    let fileToUpload = selectedFile;

    if (imageRef.current && canvasRef.current && selectedFile) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;

      const sWidth = img.naturalWidth;
      const sHeight = img.naturalHeight;

      const sx = (cropBox.x / 100) * sWidth;
      const sy = (cropBox.y / 100) * sHeight;
      const sRegionWidth = (cropBox.width / 100) * sWidth;
      const sRegionHeight = (cropBox.height / 100) * sHeight;

      canvas.width = sRegionWidth;
      canvas.height = sRegionHeight;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sRegionWidth, sRegionHeight);
      ctx.drawImage(
        img,
        sx,
        sy,
        sRegionWidth,
        sRegionHeight,
        0,
        0,
        sRegionWidth,
        sRegionHeight,
      );

      try {
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", 0.9),
        );
        if (blob) {
          fileToUpload = new File(
            [blob],
            selectedFile.name.replace(/\.[^.]+$/, ".jpg"),
            { type: "image/jpeg" },
          );
        }
      } catch (e) {
        console.warn("Canvas to blob failed, using original file", e);
      }
    }

    setProgress(30);
    try {
      const result = await uploadMedia({
        file: fileToUpload || selectedFile,
        companyId,
      });
      setProgress(100);
      if (result?.data?.url || result?.data?.data?.url) {
        const url = result.data.url || result.data.data.url;
        setGeneratedUrl(url);
        setUploadStep("result");
        toast.success(t("media.uploadSuccess"));
      } else {
        throw new Error(result?.error?.data || t("media.uploadFailed"));
      }
    } catch (err) {
      toast.error(err?.message || t("media.uploadFailed"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyUrl = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      toast.success(t("media.copied"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="w-[calc(100%-10px)] sm:w-full sm:max-w-[650px] p-0 overflow-hidden bg-white dark:bg-[#1a1f26] border-gray-100 dark:border-gray-800 rounded-[32px] shadow-2xl">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2.5 text-gray-900 dark:text-white">
              {uploadStep === "select" && (
                <>
                  <Upload className="w-5 h-5 text-indigo-600" />{" "}
                  {t("media.uploadMediaTitle")}
                </>
              )}
              {uploadStep === "crop" && (
                <>
                  <Crop className="w-5 h-5 text-indigo-600" />{" "}
                  {t("media.editCrop")}
                </>
              )}
              {uploadStep === "result" && (
                <>
                  <Sparkles className="w-5 h-5 text-indigo-600" />{" "}
                  {t("media.processedSuccessfully")}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 mt-1">
              {uploadStep === "select" && t("media.addNewImages")}
              {uploadStep === "crop" && t("media.adjustImage")}
              {uploadStep === "result" && t("media.mediaReady")}
            </DialogDescription>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Select File */}
            {uploadStep === "select" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative"
              >
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-[24px] h-64 bg-gray-50 dark:bg-black/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-md transition-all">
                      <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {t("media.clickOrDrag")}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("media.supportsFormats")}
                    </p>
                  </div>
                </label>
              </motion.div>
            )}

            {/* Step 2: Crop & Edit */}
            {uploadStep === "crop" && previewUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Crop Area */}
                <div className="relative w-full aspect-[4/3] bg-black/5 dark:bg-black/50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100 dark:border-gray-800 select-none">
                  <div
                    className="absolute inset-0 pointer-events-none z-0 opacity-20"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, #888 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />

                  <div
                    ref={constraintsRef}
                    className="relative w-full h-full flex items-center justify-center p-4"
                  >
                    <img
                      ref={imageRef}
                      src={previewUrl}
                      alt="Crop Preview"
                      className="max-w-full max-h-full object-contain pointer-events-none select-none"
                    />

                    <div className="absolute inset-0 z-10 pointer-events-none">
                      <motion.div
                        ref={cropBoxRef}
                        className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move pointer-events-auto"
                        style={{
                          left: `${cropBox.x}%`,
                          top: `${cropBox.y}%`,
                          width: `${cropBox.width}%`,
                          height: `${cropBox.height}%`,
                        }}
                        drag
                        dragMomentum={false}
                        dragConstraints={constraintsRef}
                        dragElastic={0}
                        onDragEnd={() => {
                          if (!constraintsRef.current || !cropBoxRef.current)
                            return;
                          const containerRect =
                            constraintsRef.current.getBoundingClientRect();
                          const boxRect =
                            cropBoxRef.current.getBoundingClientRect();

                          const newX =
                            ((boxRect.left - containerRect.left) /
                              containerRect.width) *
                            100;
                          const newY =
                            ((boxRect.top - containerRect.top) /
                              containerRect.height) *
                            100;

                          setCropBox((prev) => ({
                            ...prev,
                            x: Math.max(0, Math.min(newX, 100 - prev.width)),
                            y: Math.max(0, Math.min(newY, 100 - prev.height)),
                          }));
                        }}
                      >
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                          {[...Array(9)].map((_, i) => (
                            <div
                              key={i}
                              className="border border-white/30"
                            ></div>
                          ))}
                        </div>

                        {/* Resize Handles */}
                        {/* Corners */}
                        <div
                          className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nw-resize z-50 hover:scale-110 transition-transform"
                          onMouseDown={(e) => handleResizeStart(e, "nw")}
                        />
                        <div
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-ne-resize z-50 hover:scale-110 transition-transform"
                          onMouseDown={(e) => handleResizeStart(e, "ne")}
                        />
                        <div
                          className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-sw-resize z-50 hover:scale-110 transition-transform"
                          onMouseDown={(e) => handleResizeStart(e, "sw")}
                        />
                        <div
                          className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-se-resize z-50 hover:scale-110 transition-transform"
                          onMouseDown={(e) => handleResizeStart(e, "se")}
                        />

                        {/* Sides */}
                        <div
                          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-4 cursor-n-resize z-40 flex items-center justify-center group"
                          onMouseDown={(e) => handleResizeStart(e, "n")}
                        >
                          <div className="w-4 h-1 bg-white/50 rounded-full group-hover:bg-indigo-500 transition-colors" />
                        </div>
                        <div
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-4 cursor-s-resize z-40 flex items-center justify-center group"
                          onMouseDown={(e) => handleResizeStart(e, "s")}
                        >
                          <div className="w-4 h-1 bg-white/50 rounded-full group-hover:bg-indigo-500 transition-colors" />
                        </div>
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-8 cursor-w-resize z-40 flex items-center justify-center group"
                          onMouseDown={(e) => handleResizeStart(e, "w")}
                        >
                          <div className="h-4 w-1 bg-white/50 rounded-full group-hover:bg-indigo-500 transition-colors" />
                        </div>
                        <div
                          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-8 cursor-e-resize z-40 flex items-center justify-center group"
                          onMouseDown={(e) => handleResizeStart(e, "e")}
                        >
                          <div className="h-4 w-1 bg-white/50 rounded-full group-hover:bg-indigo-500 transition-colors" />
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Controls */}
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      {t("media.freeTransform")}
                    </span>
                    <span className="text-xs text-indigo-600 font-medium bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">
                      {t("media.dragBoxToCrop")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("media.adjustSelectionFrame")}
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setUploadStep("select")}
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {t("media.cancel")}
                  </Button>
                  <Button
                    onClick={handleCropAndGenerate}
                    disabled={isProcessing}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-lg shadow-indigo-500/20"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {t("media.runningAI")}
                      </>
                    ) : (
                      <>
                        <Crop className="w-4 h-4 mr-2" />
                        {t("media.cropAndSave")}
                      </>
                    )}
                  </Button>
                </div>

                {/* Processing Progress Bar */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/90 dark:bg-[#1a1f26]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[32px]">
                    <div className="w-64 space-y-4">
                      <div className="flex justify-between text-sm font-medium">
                        <span>{t("media.optimizing")}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-indigo-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Result */}
            {uploadStep === "result" && generatedUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center space-y-8 py-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center shadow-lg relative z-10">
                    <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {t("media.uploadComplete")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                    {t("media.imageOptimized")}{" "}
                    <span className="font-semibold text-gray-900 dark:text-gray-300">
                      {t("media.global")}
                    </span>{" "}
                    {t("media.collection")}
                  </p>
                </div>

                <div className="w-full bg-gray-50 dark:bg-black/30 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 sm:gap-4">
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">
                      {t("media.cdnAccessUrl")}
                    </p>
                    <p className="text-xs sm:text-sm font-mono font-medium text-indigo-600 dark:text-indigo-400 break-all whitespace-normal">
                      {generatedUrl}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyUrl}
                    className="shrink-0 h-10 w-10 rounded-xl"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-transform"
                  onClick={handleCloseModal}
                >
                  {t("media.returnToLibrary")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
