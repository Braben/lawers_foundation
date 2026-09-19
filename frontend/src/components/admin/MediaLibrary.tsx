"use client";
import { errorMessage } from '@/lib/api';
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { usePermission } from '@/components/admin/AdminLayout';
import type { GalleryItem } from "@/types";
import { LazyImage } from "@/components/ui";

export function MediaLibrary({
  onSelect,
  selected,
}: {
  onSelect: (url: string) => void;
  selected?: string;
}) {
  const canUpload=usePermission('gallery.manage');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const load = () =>
    api
      .getGallery("all")
      .then(setItems)
      .catch(() => {});
  useEffect(() => {
    load();
  }, []);
  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const item = await api.uploadImage(f, { title: f.name.replace(/\.[^.]+$/, ""), description: "", category: "community" });
      onSelect(item.url);
      load();
    } catch (err: unknown) {
      alert(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">Media Library</div>
        <label className="text-xs px-3 py-1.5 rounded-lg bg-[#2C5F2D] text-white cursor-pointer">
          {uploading ? "Uploading..." : "Upload Thumbnail"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onUpload}
            disabled={uploading || !canUpload}
          />
        </label>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[220px] overflow-auto">
        {items.slice(0, 24).map((it) => (
          <button
            key={it.id}
            onClick={() => onSelect(it.thumbnail || it.url)}
            className={`aspect-square rounded-lg overflow-hidden border-2 ${selected === (it.thumbnail || it.url) ? "border-[#2C5F2D]" : "border-transparent"} bg-[#EDF4F2]`}
          >
            <LazyImage
              src={it.thumbnail || it.url}
              alt={it.title}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
        {!items.length && (
          <div className="col-span-4 text-center text-sm text-gray-400 py-8">
            No media yet — upload one
          </div>
        )}
      </div>
      <div className="text-xs text-gray-400 mt-2">
        JPEG, PNG or WebP, up to 5 MB. Uploaded images appear in the gallery.
      </div>
    </div>
  );
}
