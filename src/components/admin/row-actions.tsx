"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { contentAction } from "@/actions/cms";
import { Button } from "@/components/ui/button";
import { Confirm } from "./confirm";
export function RowActions({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const [pending, start] = useTransition();
  function run(action: "delete" | "duplicate" | "publish" | "unpublish") {
    start(async () => {
      try {
        await contentAction(id, action);
        toast.success("Đã cập nhật.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Thao tác thất bại.");
      }
    });
  }
  return (
    <div className="row-actions">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run(published ? "unpublish" : "publish")}
      >
        {published ? "Gỡ đăng" : "Đăng"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run("duplicate")}
      >
        Nhân bản
      </Button>
      <Confirm onConfirm={() => run("delete")}>
        <Button size="sm" variant="destructive" disabled={pending}>
          Xóa
        </Button>
      </Confirm>
    </div>
  );
}
