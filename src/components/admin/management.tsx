"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  saveCategory,
  deleteCategory,
  saveUser,
  updateContact,
  deleteContact,
} from "@/actions/cms";
import { Button } from "@/components/ui/button";
import { Confirm } from "./confirm";
export function Categories({
  rows,
  admin,
}: {
  rows: {
    id: string;
    kind: string;
    slug: string;
    nameVi: string;
    nameEn: string;
    sortOrder: number;
  }[];
  admin: boolean;
}) {
  const [editing, setEditing] = useState<(typeof rows)[number] | null>(null);
  const [busy, start] = useTransition();
  return (
    <>
      <h1>Danh mục nội dung</h1>
      <form
        key={editing?.id || "new"}
        className="panel form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          start(async () => {
            try {
              await saveCategory({
                id: editing?.id,
                kind: f.get("kind"),
                slug: f.get("slug"),
                nameVi: f.get("nameVi"),
                nameEn: f.get("nameEn"),
                sortOrder: Number(f.get("sortOrder")),
              });
              toast.success("Đã lưu danh mục.");
              setEditing(null);
            } catch {
              toast.error("Không lưu được: kiểm tra slug hoặc quyền truy cập.");
            }
          });
        }}
      >
        <label>
          Loại
          <select name="kind" defaultValue={editing?.kind || "POST"}>
            <option value="POST">Blog</option>
            <option value="PROJECT">Portfolio</option>
            <option value="ALBUM">Album</option>
            {admin && <option value="SERVICE">Dịch vụ</option>}
          </select>
        </label>
        <label>
          Tên VI
          <input name="nameVi" required defaultValue={editing?.nameVi} />
        </label>
        <label>
          Tên EN
          <input name="nameEn" defaultValue={editing?.nameEn} />
        </label>
        <label>
          Slug
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            defaultValue={editing?.slug}
          />
        </label>
        <label>
          Thứ tự
          <input
            type="number"
            name="sortOrder"
            min={0}
            defaultValue={editing?.sortOrder || 0}
          />
        </label>
        <div className="flex items-end gap-2">
          <Button disabled={busy}>Lưu danh mục</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing(null)}
          >
            Tạo mới
          </Button>
        </div>
      </form>
      <section className="panel">
        {rows.map((r) => (
          <div key={r.id} className="activity-row">
            <span>
              {r.kind} · {r.nameVi} / {r.nameEn}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(r)}>
                Sửa
              </Button>
              <Confirm
                onConfirm={() => {
                  void deleteCategory(r.id)
                    .then(() => toast.success("Đã xóa."))
                    .catch(() =>
                      toast.error("Danh mục đang sử dụng hoặc không có quyền."),
                    );
                }}
              >
                <Button variant="destructive" size="sm">
                  Xóa
                </Button>
              </Confirm>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
  active: boolean;
};
export function Users({ rows }: { rows: UserRow[] }) {
  const [editing, setEditing] = useState<UserRow | null>(null);
  return (
    <>
      <h1>Tài khoản quản trị</h1>
      <form
        className="panel form-grid"
        key={editing?.id || "new"}
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            await saveUser({
              id: editing?.id,
              name: f.get("name"),
              email: f.get("email"),
              password: f.get("password"),
              role: f.get("role"),
              active: f.has("active"),
            });
            toast.success("Đã lưu tài khoản.");
            setEditing(null);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Không lưu được.");
          }
        }}
      >
        <label>
          Họ tên
          <input name="name" required defaultValue={editing?.name} />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            required
            defaultValue={editing?.email}
          />
        </label>
        <label>
          Mật khẩu {editing ? "(để trống để giữ nguyên)" : "*"}
          <input
            type="password"
            autoComplete="new-password"
            name="password"
            minLength={12}
            required={!editing}
          />
        </label>
        <label>
          Vai trò
          <select name="role" defaultValue={editing?.role || "EDITOR"}>
            <option>EDITOR</option>
            <option>ADMIN</option>
          </select>
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            name="active"
            defaultChecked={editing?.active ?? true}
          />{" "}
          Hoạt động
        </label>
        <div className="flex gap-2 items-end">
          <Button>Lưu tài khoản</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing(null)}
          >
            Tạo mới
          </Button>
        </div>
      </form>
      <section className="panel">
        {rows.map((r) => (
          <div className="activity-row" key={r.id}>
            <span>
              {r.name} · {r.email} · {r.role} ·{" "}
              {r.active ? "Active" : "Disabled"}
            </span>
            <Button size="sm" variant="outline" onClick={() => setEditing(r)}>
              Chỉnh sửa
            </Button>
          </div>
        ))}
      </section>
    </>
  );
}
type ContactRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  eventDate: string | null;
  location: string;
  message: string;
  status: string;
  notes: string;
  createdAt: string;
  notificationStatus: string;
};
export function Contacts({ rows }: { rows: ContactRow[] }) {
  return (
    <>
      {rows.map((r) => (
        <details className="panel" key={r.id}>
          <summary>
            <b>{r.name}</b> · {r.service}{" "}
            <span className="badge">{r.status}</span>
            <small>
              {" "}
              · {new Date(r.createdAt).toLocaleDateString("vi-VN")}
            </small>
          </summary>
          <div className="contact-detail">
            <p>
              {r.email} · {r.phone}
            </p>
            <p>
              {r.company} · {r.location} · {r.eventDate?.slice(0, 10)}
            </p>
            <p className="whitespace-pre-wrap">{r.message}</p>
            <small>Email notification: {r.notificationStatus}</small>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              try {
                await updateContact({
                  id: r.id,
                  status: f.get("status"),
                  notes: f.get("notes"),
                });
                toast.success("Đã cập nhật.");
              } catch {
                toast.error("Không cập nhật được.");
              }
            }}
          >
            <label>
              Trạng thái
              <select
                aria-label="Trạng thái"
                name="status"
                defaultValue={r.status}
              >
                <option value="NEW">Mới</option>
                <option value="PROCESSING">Đang xử lý</option>
                <option value="CONTACTED">Đã liên hệ</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
            </label>
            <label>
              Ghi chú nội bộ
              <textarea name="notes" defaultValue={r.notes} />
            </label>
            <div className="flex gap-2">
              <Button>Lưu thay đổi</Button>
              <Confirm
                onConfirm={() => {
                  void deleteContact(r.id)
                    .then(() => toast.success("Đã xóa."))
                    .catch(() => toast.error("Không xóa được."));
                }}
              >
                <Button type="button" variant="destructive">
                  Xóa
                </Button>
              </Confirm>
            </div>
          </form>
        </details>
      ))}
      {!rows.length && <p className="empty-state">Không có yêu cầu phù hợp.</p>}
    </>
  );
}
