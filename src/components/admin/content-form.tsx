"use client";
import { useState, useTransition, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { contentSchema, slugify } from "@/lib/validation";
import { saveContent } from "@/actions/cms";
import { SettingsFields } from "./settings-fields";
import { RichEditor } from "./editor";
import { MediaPicker, type MediaItem } from "./media-library";
import { Button } from "@/components/ui/button";
type Values = z.infer<typeof contentSchema>;
const emptyTranslation = (locale: "vi" | "en") => ({
  locale,
  title: "",
  excerpt: "",
  body: "",
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  canonical: "",
});
export function ContentForm({
  initial,
  kind,
  section,
  categories,
  media,
  related,
}: {
  initial?: Values;
  kind: Values["kind"];
  section: string;
  categories: { id: string; nameVi: string }[];
  media: MediaItem[];
  related: { id: string; title: string }[];
}) {
  const [locale, setLocale] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, start] = useTransition();
  const router = useRouter();
  const [available, setAvailable] = useState(media);
  const [extra, setExtra] = useState<Record<string, unknown>>(
    initial?.data || {},
  );
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(contentSchema),
    defaultValues: initial || {
      kind,
      slug:
        kind === "PROFILE" ? "profile" : kind === "SETTINGS" ? "settings" : "",
      status: "DRAFT",
      featured: false,
      sortOrder: 0,
      publishedAt: "",
      categoryId: "",
      coverId: "",
      galleryIds: [],
      tags: [],
      client: "",
      year: null,
      location: "",
      externalUrl: "",
      videoUrl: "",
      audioUrl: "",
      relatedIds: [],
      data: {},
      translations: [emptyTranslation("vi"), emptyTranslation("en")],
    },
  });
  useEffect(() => setReady(true), []);
  const coverId = watch("coverId");
  const galleryIds = watch("galleryIds");
  function choose(items: MediaItem[], cover = false) {
    setAvailable((prev) => [
      ...prev.filter((m) => !items.some((i) => i.id === m.id)),
      ...items,
    ]);
    setValue(
      cover ? "coverId" : "galleryIds",
      cover ? items[0]?.id || "" : items.map((m) => m.id),
    );
  }
  function submit(values: Values) {
    start(async () => {
      try {
        values.data = extra;
        const result = await saveContent(values);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Đã lưu nội dung.");
        router.push(`/admin/${section}/${result.id}/edit`);
        router.refresh();
      } catch {
        toast.error("Không lưu được. Vui lòng kiểm tra kết nối và thử lại.");
      }
    });
  }
  return (
    <form
      data-ready={ready}
      onSubmit={handleSubmit(submit, () =>
        toast.error(
          "Vui lòng kiểm tra tiêu đề, slug, đường dẫn và các trường bắt buộc.",
        ),
      )}
    >
      <fieldset disabled={!ready || busy} className="contents">
        <div className="page-heading">
          <div>
            <p className="eyebrow">CONTENT STUDIO / {kind}</p>
            <h1>{initial ? "Chỉnh sửa nội dung" : "Tạo nội dung mới"}</h1>
          </div>
          <div className="flex gap-2">
            {initial?.id && (
              <Button asChild variant="outline">
                <Link href={`/admin/preview/${initial.id}`} target="_blank">
                  Xem trước
                </Link>
              </Button>
            )}
            <Button type="submit" disabled={busy}>
              {busy ? "Đang lưu…" : "Lưu nội dung"}
            </Button>
          </div>
        </div>
        {Object.keys(errors).length > 0 && (
          <p className="form-error">
            Vui lòng kiểm tra các trường bắt buộc và định dạng URL, năm, ngày
            xuất bản.
          </p>
        )}
        <div className="editor-layout">
          <div>
            <section className="panel">
              <div className="locale-tabs">
                {["Tiếng Việt", "English"].map((l, i) => (
                  <button
                    type="button"
                    key={l}
                    className={locale === i ? "active" : ""}
                    onClick={() => setLocale(i)}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {[0, 1].map((i) => (
                <div key={i} hidden={locale !== i}>
                  <label>
                    Tiêu đề {i === 0 ? "VI *" : "EN"}
                    <input
                      {...register(`translations.${i}.title`)}
                      placeholder="Một câu chuyện mới bắt đầu…"
                    />
                  </label>
                  <label>
                    Mô tả ngắn
                    <textarea
                      {...register(`translations.${i}.excerpt`)}
                      rows={3}
                    />
                  </label>
                  <label>Nội dung</label>
                  <Controller
                    name={`translations.${i}.body`}
                    control={control}
                    render={({ field }) => (
                      <RichEditor
                        key={`${initial?.id || "new"}-${i}`}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <details className="mt-5">
                    <summary>SEO · {i === 0 ? "VI" : "EN"}</summary>
                    <label>
                      Meta title
                      <input {...register(`translations.${i}.metaTitle`)} />
                    </label>
                    <label>
                      Meta description
                      <textarea
                        {...register(`translations.${i}.metaDescription`)}
                      />
                    </label>
                    <label>
                      OG image URL
                      <input {...register(`translations.${i}.ogImage`)} />
                    </label>
                    <label>
                      Canonical URL
                      <input {...register(`translations.${i}.canonical`)} />
                    </label>
                  </details>
                </div>
              ))}
            </section>
            <section className="panel">
              <h2>Chi tiết & liên kết</h2>
              <div className="form-grid">
                <label>
                  Khách hàng / Nhà xuất bản
                  <input {...register("client")} />
                </label>
                <label>
                  Năm
                  <input
                    type="number"
                    {...register("year", {
                      setValueAs: (v) =>
                        v == null || v === "" ? null : Number(v),
                    })}
                  />
                </label>
                <label>
                  Địa điểm
                  <input {...register("location")} />
                </label>
                <label>
                  Link website / bài gốc
                  <input {...register("externalUrl")} />
                </label>
                <label>
                  YouTube URL
                  <input {...register("videoUrl")} />
                </label>
                <label>
                  Audio sample URL
                  <input {...register("audioUrl")} />
                </label>
                <label>
                  Tags (phân cách bằng dấu phẩy)
                  <Controller
                    control={control}
                    name="tags"
                    render={({ field }) => (
                      <input
                        value={field.value.join(",")}
                        onChange={(e) =>
                          field.onChange(e.target.value.split(","))
                        }
                      />
                    )}
                  />
                </label>
                <label>
                  Nội dung liên quan
                  <Controller
                    control={control}
                    name="relatedIds"
                    render={({ field }) => (
                      <select
                        multiple
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(
                            Array.from(e.target.selectedOptions).map(
                              (o) => o.value,
                            ),
                          )
                        }
                      >
                        {related
                          .filter((r) => r.id !== initial?.id)
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.title}
                            </option>
                          ))}
                      </select>
                    )}
                  />
                </label>
              </div>
            </section>
            <section className="panel">
              <h2>Gallery · {galleryIds.length} ảnh</h2>
              <p className="muted">Kéo ảnh để đổi thứ tự, hoặc dùng mũi tên.</p>
              <MediaPicker
                selected={galleryIds}
                onChange={(items) => choose(items)}
              />
              <div className="gallery-editor">
                {galleryIds.map((id, index) => {
                  const m = available.find((m) => m.id === id);
                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/plain", String(index))
                      }
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const from = Number(
                          e.dataTransfer.getData("text/plain"),
                        );
                        if (
                          Number.isInteger(from) &&
                          from >= 0 &&
                          from < galleryIds.length
                        ) {
                          const next = [...galleryIds];
                          const [moved] = next.splice(from, 1);
                          next.splice(index, 0, moved);
                          setValue("galleryIds", next);
                        }
                      }}
                    >
                      <p className="truncate">
                        {index + 1}. {m?.name || id}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={index === 0}
                        onClick={() => {
                          const next = [...galleryIds];
                          [next[index - 1], next[index]] = [
                            next[index],
                            next[index - 1],
                          ];
                          setValue("galleryIds", next);
                        }}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setValue(
                            "galleryIds",
                            galleryIds.filter((x) => x !== id),
                          )
                        }
                      >
                        Gỡ
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>
            {["PROFILE", "SETTINGS"].includes(kind) && (
              <section className="panel">
                <h2>Cấu hình website</h2>
                <p className="muted">
                  Chỉnh sửa tên, slogan và giới thiệu trong nội dung VI / EN
                  phía trên. Các liên kết và nhãn giao diện có thể cập nhật trực
                  tiếp bên dưới.
                </p>
                <SettingsFields value={extra} onChange={setExtra} />
                {kind === "PROFILE" && (
                  <div className="mt-5">
                    <label>Slideshow Hero (ngoài ảnh đại diện)</label>
                    <MediaPicker
                      selected={
                        Array.isArray(extra.heroImageIds)
                          ? (extra.heroImageIds as string[])
                          : []
                      }
                      onChange={(items) =>
                        setExtra({
                          ...extra,
                          heroImageIds: items.map((m) => m.id),
                        })
                      }
                    />
                    <small className="block mt-2">
                      {Array.isArray(extra.heroImageIds)
                        ? extra.heroImageIds.length
                        : 0}{" "}
                      ảnh bổ sung. Chọn rỗng để tắt slideshow.
                    </small>
                  </div>
                )}
              </section>
            )}
          </div>
          <aside>
            <section className="panel">
              <h2>Xuất bản</h2>
              <label>
                Trạng thái
                <select aria-label="Trạng thái" {...register("status")}>
                  <option value="DRAFT">Bản nháp</option>
                  <option value="PUBLISHED">Đã xuất bản</option>
                  <option value="ARCHIVED">Lưu trữ</option>
                </select>
              </label>
              <label>
                Ngày xuất bản (giờ Việt Nam, UTC+7)
                <input type="datetime-local" {...register("publishedAt")} />
              </label>
              <label>
                Slug *
                <input
                  aria-label="Slug *"
                  {...register("slug")}
                  readOnly={["PROFILE", "SETTINGS"].includes(kind)}
                />
                {!["PROFILE", "SETTINGS"].includes(kind) && (
                  <button
                    type="button"
                    className="text-link"
                    onClick={() =>
                      setValue("slug", slugify(watch("translations.0.title")))
                    }
                  >
                    Tạo slug từ tiêu đề
                  </button>
                )}
              </label>
              <label>
                Danh mục
                <select aria-label="Danh mục" {...register("categoryId")}>
                  <option value="">Chưa chọn</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameVi}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Thứ tự
                <input
                  type="number"
                  {...register("sortOrder", { valueAsNumber: true })}
                />
              </label>
              <label className="checkbox">
                <input type="checkbox" {...register("featured")} /> Nổi bật trên
                trang chủ
              </label>
              <p className="muted">
                Bản nháp chỉ hiển thị trong preview đã đăng nhập. Ngày xuất bản
                trong tương lai chưa xuất hiện công khai.
              </p>
            </section>
            <section className="panel">
              <h2>Ảnh đại diện</h2>
              {available.find((m) => m.id === coverId) && (
                <Image
                  className="mb-4 rounded-md w-full h-auto"
                  src={available.find((m) => m.id === coverId)!.url}
                  alt={available.find((m) => m.id === coverId)!.alt}
                  width={300}
                  height={200}
                  unoptimized
                />
              )}
              {coverId && (
                <p className="muted break-all">
                  {available.find((m) => m.id === coverId)?.name || coverId}
                </p>
              )}
              <MediaPicker
                selected={coverId ? [coverId] : []}
                multiple={false}
                onChange={(items) => choose(items, true)}
              />
              {coverId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setValue("coverId", "")}
                >
                  Gỡ ảnh
                </Button>
              )}
            </section>
          </aside>
        </div>
      </fieldset>
    </form>
  );
}
