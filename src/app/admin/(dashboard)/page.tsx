import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/access";
export default async function Dashboard() {
  const user = await requireUser();
  const [posts, projects, media, contacts, drafts, published, recent, logs] =
    await Promise.all([
      db.content.count({ where: { kind: "POST" } }),
      db.content.count({ where: { kind: "PROJECT" } }),
      db.media.count(),
      user.role === "ADMIN"
        ? db.contactSubmission.count()
        : Promise.resolve(null),
      db.content.count({ where: { kind: "POST", status: "DRAFT" } }),
      db.content.count({ where: { kind: "POST", status: "PUBLISHED" } }),
      db.content.findMany({
        where: { kind: "POST" },
        include: { translations: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      db.auditLog.findMany({
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);
  const newContacts =
    user.role === "ADMIN"
      ? await db.contactSubmission.findMany({
          where: { status: "NEW" },
          take: 5,
          orderBy: { createdAt: "desc" },
        })
      : [];
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR CREATIVE WORKSPACE</p>
          <h1>Chào {user.name.split(" ").at(-1)},</h1>
          <p className="muted">Mỗi câu chuyện đều xứng đáng được kể.</p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">+ Viết bài mới</Link>
        </Button>
      </div>
      <div className="stats-grid">
        {[
          ["Bài viết", posts],
          ["Dự án", projects],
          ["Hình ảnh", media],
          ...(contacts === null ? [] : [["Yêu cầu liên hệ", contacts]]),
        ].map(([label, n]) => (
          <div className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{n}</strong>
            <small>Trong thư viện của bạn</small>
          </div>
        ))}
      </div>
      <div className="quick-actions">
        <Button asChild variant="outline">
          <Link href="/admin/portfolio/new">+ Thêm dự án</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/media">↑ Upload hình ảnh</Link>
        </Button>
        {contacts !== null && (
          <Button asChild variant="outline">
            <Link href="/admin/contacts">Xem booking →</Link>
          </Button>
        )}
        <span className="muted">
          {drafts} bản nháp · {published} bài đã xuất bản
        </span>
      </div>
      <div className="dashboard-columns">
        <section className="panel">
          <h2>Bài viết gần đây</h2>
          {recent.map((r) => (
            <Link
              className="activity-row"
              key={r.id}
              href={`/admin/posts/${r.id}/edit`}
            >
              <div>
                <b>{r.translations.find((t) => t.locale === "vi")?.title}</b>
                <small>{r.updatedAt.toLocaleDateString("vi-VN")}</small>
              </div>
              <span className={`badge ${r.status.toLowerCase()}`}>
                {r.status}
              </span>
            </Link>
          ))}
          {!recent.length && (
            <p className="empty-state">
              Chưa có bài viết. Hãy kể câu chuyện đầu tiên.
            </p>
          )}
        </section>
        <section className="panel">
          <h2>Hoạt động gần đây</h2>
          {logs.map((l) => (
            <div className="activity-row" key={l.id}>
              <div>
                <p>{l.action}</p>
                <small>
                  {l.user.name} ·{" "}
                  {l.createdAt.toLocaleString("vi-VN", {
                    timeZone: "Asia/Ho_Chi_Minh",
                  })}
                </small>
              </div>
            </div>
          ))}
        </section>
      </div>
      {contacts !== null && (
        <section className="panel">
          <h2>Yêu cầu mới</h2>
          {newContacts.map((c) => (
            <Link className="activity-row" key={c.id} href="/admin/contacts">
              <b>{c.name}</b>
              <span>
                {c.service} · {c.email}
              </span>
            </Link>
          ))}
          {!newContacts.length && <p className="muted">Chưa có yêu cầu mới.</p>}
        </section>
      )}
    </>
  );
}
