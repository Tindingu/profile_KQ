"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="error-box">
      <h1>Không thể tải nội dung</h1>
      <p>Vui lòng kiểm tra kết nối và cấu hình database.</p>
      <button onClick={reset}>Thử lại</button>
    </main>
  );
}
