"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const f = new FormData(e.currentTarget);
        try {
          const r = await signIn("credentials", {
            email: f.get("email"),
            password: f.get("password"),
            redirect: false,
          });
          if (r?.error)
            setError(
              "Email hoặc mật khẩu không đúng, hoặc tạm thời bị giới hạn.",
            );
          else {
            router.push("/admin");
            router.refresh();
          }
        } catch {
          setError("Không thể kết nối. Hãy thử lại.");
        }
        setBusy(false);
      }}
    >
      <label>
        Email
        <input type="email" name="email" required autoComplete="username" />
      </label>
      <label>
        Mật khẩu
        <input
          type="password"
          name="password"
          required
          maxLength={128}
          autoComplete="current-password"
        />
      </label>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy} className="w-full mt-5">
        {busy ? "Đang đăng nhập…" : "Đăng nhập →"}
      </Button>
    </form>
  );
}
