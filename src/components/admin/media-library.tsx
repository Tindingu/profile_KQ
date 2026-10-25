"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateMedia, deleteMedia } from "@/actions/media";
import { Confirm } from "./confirm";
export type MediaItem = {
  id: string;
  url: string;
  alt: string;
  caption: string;
  name: string;
  width: number;
  height: number;
  bytes: number;
  createdAt?: string | Date;
};
export function MediaPicker({
  selected,
  onChange,
  multiple = true,
  label = "Chọn từ thư viện",
}: {
  selected: string[];
  onChange: (items: MediaItem[]) => void;
  multiple?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      {open && (
        <div className="dialog-overlay picker-overlay">
          <section
            className="picker-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Media Library"
          >
            <div className="flex justify-between items-center mb-4">
              <h2>Thư viện hình ảnh</h2>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Đóng
              </Button>
            </div>
            <MediaLibrary
              selectable
              selected={selected}
              multiple={multiple}
              onSelect={(items) => {
                onChange(items);
                setOpen(false);
              }}
            />
          </section>
        </div>
      )}
    </>
  );
}
export function MediaLibrary({
  initial,
  selectable = false,
  selected = [],
  multiple = true,
  onSelect,
}: {
  initial?: MediaItem[];
  selectable?: boolean;
  selected?: string[];
  multiple?: boolean;
  onSelect?: (items: MediaItem[]) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>(initial || []);
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<string[]>(selected);
  const [progress, setProgress] = useState<number | null>(null);
  const [list, setList] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  async function reload() {
    const r = await fetch("/api/media/library");
    if (r.ok) setItems(await r.json());
    else toast.error("Không tải được thư viện.");
  }
  useEffect(() => {
    if (!initial)
      void fetch("/api/media/library").then(async (r) => {
        if (r.ok) setItems(await r.json());
      });
  }, [initial]);
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("files", f));
    setProgress(0);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setProgress(null);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status !== 200) toast.error(data.error);
        else toast.success("Đã tải hình ảnh.");
      } catch {
        toast.error("Upload thất bại.");
      }
      void reload();
    };
    xhr.onerror = () => {
      setProgress(null);
      toast.error("Lỗi kết nối.");
    };
    xhr.send(form);
  }
  return (
    <div>
      <div
        className="upload-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void upload(e.dataTransfer.files);
        }}
      >
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => void upload(e.target.files)}
        />
        <p>Kéo thả hình ảnh vào đây</p>
        <small>JPG, PNG, WebP · tối đa 10 MB / ảnh · 20 ảnh / lần</small>
        <Button
          type="button"
          disabled={progress !== null}
          onClick={() => input.current?.click()}
        >
          {progress === null
            ? "Tải ảnh lên Cloudinary"
            : `Đang tải ${progress}%`}
        </Button>
      </div>
      <div className="filter-bar">
        <input
          aria-label="Tìm ảnh"
          placeholder="Tìm ảnh…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="button" variant="outline" onClick={() => setList(!list)}>
          {list ? "Dạng lưới" : "Dạng danh sách"}
        </Button>
        {selectable && (
          <Button
            type="button"
            onClick={() =>
              onSelect?.(items.filter((m) => chosen.includes(m.id)))
            }
          >
            Chọn {chosen.length} ảnh
          </Button>
        )}
      </div>
      <div className={list ? "media-list" : "media-grid"}>
        {items
          .filter((m) =>
            `${m.name} ${m.alt}`.toLowerCase().includes(query.toLowerCase()),
          )
          .map((m) => (
            <article
              key={m.id}
              className={`media-tile ${chosen.includes(m.id) ? "selected" : ""}`}
            >
              <button
                type="button"
                className="image-button"
                onClick={() => {
                  if (selectable)
                    setChosen(
                      multiple
                        ? chosen.includes(m.id)
                          ? chosen.filter((id) => id !== m.id)
                          : [...chosen, m.id]
                        : [m.id],
                    );
                  else window.open(m.url, "_blank", "noopener");
                }}
              >
                <Image
                  src={m.url}
                  alt={m.alt}
                  width={320}
                  height={220}
                  unoptimized
                />
              </button>
              <div className="p-3">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <small>
                  {m.width} × {m.height} · {Math.round(m.bytes / 1024)} KB
                </small>
                {!selectable && (
                  <>
                    <label>
                      Alt text
                      <input
                        defaultValue={m.alt}
                        onBlur={async (e) => {
                          try {
                            const alt = e.target.value;
                            await updateMedia({
                              id: m.id,
                              alt,
                              caption: m.caption,
                            });
                            setItems((prev) =>
                              prev.map((item) =>
                                item.id === m.id ? { ...item, alt } : item,
                              ),
                            );
                            toast.success("Đã lưu alt text.");
                          } catch {
                            toast.error("Không lưu được.");
                          }
                        }}
                      />
                    </label>
                    <label>
                      Caption
                      <input
                        defaultValue={m.caption}
                        onBlur={async (e) => {
                          try {
                            await updateMedia({
                              id: m.id,
                              alt: m.alt,
                              caption: e.target.value,
                            });
                            await reload();
                            toast.success("Đã lưu caption.");
                          } catch {
                            toast.error("Không lưu được.");
                          }
                        }}
                      />
                    </label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          void navigator.clipboard
                            .writeText(m.url)
                            .then(() => toast.success("Đã sao chép URL."));
                        }}
                      >
                        Copy URL
                      </Button>
                      <Confirm
                        onConfirm={() => {
                          void deleteMedia(m.id)
                            .then((result) => {
                              if (!result.ok) {
                                toast.error(result.error);
                                return;
                              }
                              toast.success("Đã xóa.");
                              void reload();
                            })
                            .catch((e) => toast.error(e.message));
                        }}
                      >
                        <Button type="button" size="sm" variant="destructive">
                          Xóa
                        </Button>
                      </Confirm>
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}
      </div>
      {!items.length && (
        <p className="empty-state">Chưa có ảnh trong thư viện.</p>
      )}
    </div>
  );
}
