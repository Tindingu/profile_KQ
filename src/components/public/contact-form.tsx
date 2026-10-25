"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { contactSchema } from "@/lib/validation";
import { submitContact } from "@/actions/contact";
export function ContactForm({
  locale,
  services,
}: {
  locale: string;
  services: string[];
}) {
  const en = locale === "en";
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, start] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      service: "",
      eventDate: "",
      location: "",
      message: "",
      website: "",
    },
  });
  return (
    <form
      className="booking-form"
      onSubmit={handleSubmit((v) => {
        setError("");
        start(async () => {
          const r = await submitContact(v);
          if (r.ok) {
            setSent(true);
            reset();
          } else setError(r.error || "Error");
        });
      })}
    >
      {sent && (
        <p className="success-message" role="status">
          {en
            ? "Thank you. Your request has been received."
            : "Cảm ơn bạn. Yêu cầu đã được gửi thành công."}
        </p>
      )}
      <div className="form-grid">
        {[
          ["name", en ? "Your name *" : "Họ và tên *", "text"],
          ["email", "Email *", "email"],
          ["phone", en ? "Phone *" : "Số điện thoại *", "tel"],
          ["company", en ? "Company" : "Công ty / tổ chức", "text"],
        ].map(([name, label, type]) => (
          <label key={name}>
            {label}
            <input type={type} {...register(name as "name")} />
          </label>
        ))}
        <label>
          {en ? "Service *" : "Dịch vụ *"}
          <select
            aria-label={en ? "Service *" : "Dịch vụ *"}
            {...register("service")}
          >
            <option value="">{en ? "Select a service" : "Chọn dịch vụ"}</option>
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          {en ? "Event date" : "Ngày dự kiến"}
          <input type="date" {...register("eventDate")} />
        </label>
      </div>
      <label>
        {en ? "Location" : "Địa điểm"}
        <input {...register("location")} />
      </label>
      <label>
        {en ? "Tell me about your project *" : "Chia sẻ về dự án của bạn *"}
        <textarea rows={5} {...register("message")} />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="form-error">
          {en
            ? "Please complete required fields. Message must contain at least 15 characters."
            : "Vui lòng nhập đủ các trường bắt buộc. Nội dung cần ít nhất 15 ký tự."}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="primary-link" disabled={busy}>
        {busy
          ? en
            ? "Sending…"
            : "Đang gửi…"
          : en
            ? "Send booking request ↗"
            : "Gửi lời mời hợp tác ↗"}
      </button>
    </form>
  );
}
