import { LoginForm } from "@/components/admin/login-form";
import Link from "next/link";
export const metadata = {
  title: "Đăng nhập quản trị",
  robots: { index: false, follow: false },
};
export default function Login() {
  return (
    <main className="login-page">
      <div className="login-brand">
        <p className="eyebrow">Kiều Quy / CONTENT STUDIO</p>
        <h1>
          Câu chuyện hay
          <br />
          bắt đầu từ đây.
        </h1>
        <p>Không gian quản lý nội dung, dự án và những kết nối mới.</p>
        <Link href="/vi">← Xem website</Link>
      </div>
      <div className="login-card">
        <p className="eyebrow">WELCOME BACK</p>
        <h2>Chào mừng trở lại.</h2>
        <p className="muted">Đăng nhập để quản lý website của bạn.</p>
        <LoginForm />
      </div>
    </main>
  );
}
