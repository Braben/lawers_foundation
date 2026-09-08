"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function MediaLibrary({
  onSelect,
  selected,
}: {
  onSelect: (url: string) => void;
  selected?: string;
}) {
  const { token } = useAuth();
  const [items, setItems] = useState<any[]>([]);
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
    if (!f || !token) return;
    setUploading(true);
    try {
      const url = await api.uploadThumbnail(f, token);
      onSelect(url);
      load();
    } catch (err: any) {
      alert(err.message);
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
            accept="image/*"
            className="hidden"
            onChange={onUpload}
            disabled={uploading}
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
            <img
              src={it.thumbnail || it.url}
              alt={it.title}
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
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
        Videos are link-only. Upload only thumbnails here (Firebase Storage).
      </div>
    </div>
  );
}
