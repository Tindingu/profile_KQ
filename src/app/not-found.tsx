import Link from "next/link";
export default function NotFound() {
  return (
    <main className="error-box">
      <small>404</small>
      <h1>Trang chưa có ở đây.</h1>
      <Link href="/vi">Trở về trang chủ →</Link>
    </main>
  );
}
