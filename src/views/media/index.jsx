import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import {
  useGetMediaQuery,
  useDeleteMediaMutation,
} from "@/features/media/mediaApiSlice";
import MediaUploadModal from "./components/MediaUploadModal";
import CopyToast from "./components/CopyToast";
import MediaHeader from "./components/MediaHeader";
import MediaEmptyState from "./components/MediaEmptyState";
import MediaCard from "./components/MediaCard";
import MediaListItem from "./components/MediaListItem";
import MediaPagination from "./components/MediaPagination";
import MediaImageViewModal from "./components/MediaImageViewModal";

/**
 * Media Library Page
 * Premium Album/Collection View with Upload & Crop
 */
export default function MediaPage() {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const companyId = authUser?.companyId;

  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const { data: mediaData, isLoading: isMediaLoading } = useGetMediaQuery(
    {
      companyId,
      search: searchQuery || undefined,
      sortBy,
      page,
      limit: 24,
    },
    { skip: !companyId },
  );
  const [deleteMedia] = useDeleteMediaMutation();

  const images = mediaData?.data ?? [];
  const total = mediaData?.total ?? 0;
  const totalPages = mediaData?.totalPages ?? 1;

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewImage, setViewImage] = useState(null);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const handleDelete = async (image, e) => {
    e?.stopPropagation?.();
    if (!companyId) return;
    try {
      const result = await deleteMedia({ id: image.id, companyId });
      if (result?.data) {
        toast.success(t("media.mediaDeleted"));
        if (viewImage?.id === image.id) setViewImage(null);
      } else {
        toast.error(result?.error?.data || t("media.deleteFailed"));
      }
    } catch (err) {
      toast.error(err?.message || t("media.deleteFailed"));
    }
  };

  const handleCopyUrl = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    }
  };

  const renderContent = () => {
    if (isMediaLoading) {
      return (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        </div>
      );
    }
    if (images.length === 0) {
      return <MediaEmptyState onUploadClick={() => setIsUploadOpen(true)} />;
    }
    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {images.map((image) => (
            <MediaCard
              key={image.id}
              image={image}
              onView={setViewImage}
              onCopyUrl={handleCopyUrl}
              onEditUpload={() => setIsUploadOpen(true)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-3">
        {images.map((image) => (
          <MediaListItem
            key={image.id}
            image={image}
            onView={setViewImage}
            onCopyUrl={handleCopyUrl}
            onEditUpload={() => setIsUploadOpen(true)}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen  bg-[#F8F9FC] dark:bg-[#0b0f14] font-sans">
      <CopyToast show={showCopyToast} />

      <MediaHeader
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        imagesCount={images.length}
        total={total}
        onUploadClick={() => setIsUploadOpen(true)}
      />

      <main className="p-6 lg:p-10 max-w-[1920px] mx-auto">
        {renderContent()}
        <MediaPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </main>

      <MediaImageViewModal
        image={viewImage}
        open={!!viewImage}
        onClose={() => setViewImage(null)}
        onCopyUrl={handleCopyUrl}
        onEditUpload={() => setIsUploadOpen(true)}
        onDelete={handleDelete}
        onNext={() => {
          const currentIndex = images.findIndex(
            (img) => img.id === viewImage?.id,
          );
          if (currentIndex < images.length - 1) {
            setViewImage(images[currentIndex + 1]);
          }
        }}
        onPrev={() => {
          const currentIndex = images.findIndex(
            (img) => img.id === viewImage?.id,
          );
          if (currentIndex > 0) {
            setViewImage(images[currentIndex - 1]);
          }
        }}
        hasNext={
          viewImage &&
          images.findIndex((img) => img.id === viewImage.id) < images.length - 1
        }
        hasPrev={
          viewImage && images.findIndex((img) => img.id === viewImage.id) > 0
        }
      />

      <MediaUploadModal
        open={isUploadOpen}
        onOpenChange={(open) => !open && setIsUploadOpen(false)}
        companyId={companyId}
      />
    </div>
  );
}
