import Link from "next/link";
import { requireUser } from "@/lib/access";
import { signOut } from "@/auth";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Image as ImageIcon,
  Settings,
  Users,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import { sections } from "@/lib/content";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Content Studio",
  robots: { index: false, follow: false },
};
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const allowed = Object.entries(sections).filter(
    ([, s]) =>
      user.role === "ADMIN" || ["POST", "PROJECT", "ALBUM"].includes(s.kind),
  );
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-logo">
          kq<span>CONTENT STUDIO</span>
        </Link>
        <p className="sidebar-label">WORKSPACE</p>
        <nav>
          <Link href="/admin">
            <LayoutDashboard size={17} />
            Tổng quan
          </Link>
          {allowed.map(([key, s]) => (
            <Link key={key} href={`/admin/${key}`}>
              {key === "posts" ? (
                <FileText size={17} />
              ) : key === "portfolio" ? (
                <Briefcase size={17} />
              ) : (
                <Settings size={17} />
              )}{" "}
              {s.label}
            </Link>
          ))}
          <Link href="/admin/categories">
            <FileText size={17} />
            Danh mục nội dung
          </Link>
          <Link href="/admin/media">
            <ImageIcon size={17} />
            Media Library
          </Link>
          {user.role === "ADMIN" && (
            <>
              <Link href="/admin/contacts">
                <Mail size={17} />
                Liên hệ / Booking
              </Link>
              <Link href="/admin/users">
                <Users size={17} />
                Tài khoản quản trị
              </Link>
            </>
          )}
        </nav>
        <Link href="/vi" target="_blank" className="view-site">
          Xem website <ArrowUpRight size={16} />
        </Link>
        <div className="admin-user">
          <b>{user.name}</b>
          <small>{user.role}</small>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button>Đăng xuất</button>
          </form>
        </div>
      </aside>
      <div className="admin-body">
        <header className="admin-topbar">
          <span>
            Workspace <span className="muted">/ Content management</span>
          </span>
          <span className="live-dot">Website connected</span>
        </header>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
