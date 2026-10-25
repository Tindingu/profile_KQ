"use client";
type Node = Record<string, unknown>;
const names: Record<string, string> = {
  roles: "Nghề nghiệp",
  heroGreeting: "Lời chào Hero",
  aboutHeading: "Tiêu đề giới thiệu",
  aboutBody: "Câu chuyện đầy đủ (HTML)",
  servicesIntro: "Lời dẫn dịch vụ",
  contactIntro: "Lời dẫn liên hệ",
  pdf: "Portfolio PDF URL",
  labels: "Nhãn & tiêu đề website",
  socials: "Mạng xã hội",
  email: "Email liên hệ",
  phone: "Số điện thoại",
  footer: "Nội dung chân trang",
  analyticsId: "Google Analytics Measurement ID",
  vi: "Tiếng Việt",
  en: "English",
  heroEyebrow: "Dòng mở đầu Hero",
  workHeading: "Tiêu đề dự án",
  serviceHeading: "Tiêu đề dịch vụ",
  blogHeading: "Tiêu đề blog",
  pressHeading: "Tiêu đề báo chí",
  partnerHeading: "Tiêu đề đối tác",
  footerHeading: "CTA chân trang",
  demo: "Ghi chú nội dung mẫu",
  brandSubtitle: "Dòng dưới tên thương hiệu",
  strip: "Dòng chữ bên dưới Hero",
  heroLocation: "Địa điểm trên Hero",
  heroPhotoLabel: "Nhãn ảnh Hero",
  heroPhotoNote: "Ghi chú ảnh Hero",
  heroSeal: "Dấu thương hiệu",
  heroSealNote: "Ghi chú dấu thương hiệu",
  storyHeading: "Tiêu đề timeline",
  detailCta: "CTA trang chi tiết",
  detailButton: "Nút CTA trang chi tiết",
  articleRelated: "Tiêu đề nội dung liên quan",
};
export function SettingsFields({
  value,
  onChange,
}: {
  value: Node;
  onChange: (v: Node) => void;
}) {
  return (
    <div className="settings-fields">
      {Object.entries(value).map(([key, v]) =>
        v !== null && typeof v === "object" && !Array.isArray(v) ? (
          <details key={key} open={key !== "labels"} className="settings-group">
            <summary>{names[key] || key}</summary>
            <SettingsFields
              value={v as Node}
              onChange={(child) => onChange({ ...value, [key]: child })}
            />
          </details>
        ) : typeof v === "string" ? (
          <label key={key}>
            {names[key] || key}
            {v.length > 100 ||
            key.includes("Heading") ||
            key === "aboutBody" ? (
              <textarea
                rows={key === "aboutBody" ? 6 : 3}
                value={v}
                onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              />
            ) : (
              <input
                value={v}
                onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              />
            )}
          </label>
        ) : null,
      )}
    </div>
  );
}
