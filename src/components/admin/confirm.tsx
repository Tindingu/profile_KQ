"use client";
import * as Dialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";
export function Confirm({
  children,
  onConfirm,
  title = "Xóa nội dung này?",
}: {
  children: React.ReactNode;
  onConfirm: () => void;
  title?: string;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>
            Thao tác này không thể hoàn tác. Nội dung liên quan sẽ được kiểm tra
            trước khi xóa.
          </Dialog.Description>
          <div className="flex justify-end gap-2 mt-5">
            <Dialog.Cancel asChild>
              <Button variant="outline">Hủy</Button>
            </Dialog.Cancel>
            <Dialog.Action asChild>
              <Button variant="destructive" onClick={onConfirm}>
                Xác nhận xóa
              </Button>
            </Dialog.Action>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
