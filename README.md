# Kiều Quy — Personal Portfolio & Admin CMS

Ứng dụng Next.js full-stack chạy trên Node.js và PostgreSQL. Public website VI/EN, CMS có Auth.js, Prisma, Tiptap và Cloudinary. Dữ liệu mẫu chỉ được tạo bằng seed trong database; public không có mock API hay fallback mảng bài viết.

**Dành cho người biên tập và quản trị nội dung:** xem [Hướng dẫn sử dụng trang Admin](docs/HUONG_DAN_ADMIN.md) để đăng bài, quản lý ảnh, cập nhật trang chủ, xử lý booking và cấp tài khoản.

## Chạy local

Yêu cầu Node.js 22.12+ hoặc 24, npm và PostgreSQL. Workspace hiện đã có `.env` riêng được bỏ qua bởi Git và PostgreSQL local đã khởi tạo.

```powershell
npm ci
# Chỉ chạy cho checkout mới, nếu chưa có .env:
node scripts/init-local.mjs
# Terminal 1: PostgreSQL thật với dữ liệu bền vững trong .local/postgres
npm run db:local
# Terminal 2:
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev -- --port 3001
```

Mở http://localhost:3001/vi và http://localhost:3001/admin. Trong checkout này `.env` đã đặt AUTH_URL và NEXT_PUBLIC_SITE_URL dùng port 3001 vì 3000 đang có ứng dụng khác. Script init cho checkout mới mặc định 3000; hãy đặt cả hai URL trùng port thực tế trước khi chạy.

Tài khoản local: xem `ADMIN_EMAIL` và `ADMIN_PASSWORD` trong `.env` bằng trình soạn thảo. Mật khẩu được sinh ngẫu nhiên, không hardcode hoặc đưa vào README. Seed không thay mật khẩu/nội dung đã có; chỉ bổ sung các khóa cấu hình mới còn thiếu. Tạo admin production bằng environment của bạn rồi chạy seed một lần. Tài khoản có thể sửa role, password hoặc vô hiệu trong `/admin/users`; không thể vô hiệu admin cuối cùng.

Helper PostgreSQL chỉ dùng cho development, không cần Docker hay cài service hệ thống. Chạy foreground trong terminal riêng, Ctrl+C dừng sạch; dữ liệu vẫn giữ lại. Production dùng PostgreSQL được quản lý hoặc PostgreSQL có backup, không dùng helper này.

## PostgreSQL riêng / production

Tạo database, tạo user có quyền migration, đặt `DATABASE_URL` trong biến môi trường server. Dùng URL và TLS theo yêu cầu nhà cung cấp; không tắt xác minh TLS. `prisma.config.ts` dùng URL cho CLI; runtime dùng PrismaPg. Triển khai migration bằng `npm run db:migrate`. Không dùng db push ở production. Backup PostgreSQL trước mỗi thay đổi schema.

Các bảng: User, Content, Translation, Category, Media, ContentMedia, ContactSubmission, AuditLog, RateLimit. Content.kind phân biệt Post/Project/Service/Partner/Press/Timeline/Album/Profile/Settings. Các quan hệ cover, category, author và media có foreign key Restrict; bản dịch và bảng nối bị cascade khi xóa nội dung. Slug unique trong từng kind, bản dịch unique theo content/locale. Xem [schema](prisma/schema.prisma) và [phân tích kiến trúc](docs/RESEARCH.md).

## Đăng bài

1. Đăng nhập `/admin/login`, mở Bài viết → Tạo mới.
2. Nhập title VI, slug (bấm Tạo slug từ tiêu đề hoặc nhập riêng), excerpt, danh mục, tags. Chuyển English để thêm bản dịch; title EN trống thì public fallback VI.
3. Dùng Tiptap nhập nội dung, heading, danh sách, quote, ảnh, link, YouTube, bảng. Ảnh được chèn bằng Media Library; caption của media được chèn thành figure/figcaption trong bài. Undo/redo có sẵn.
4. Chọn ảnh đại diện từ thư viện. Lưu ở trạng thái Bản nháp.
5. Sau khi lưu, bấm Xem trước. Preview chỉ hoạt động với session quản trị có quyền; không được index và không công khai bản nháp.
6. Chọn Đã xuất bản, để trống ngày để xuất bản ngay hoặc nhập ngày dự kiến theo giờ Việt Nam (UTC+7). Bấm Lưu nội dung. Bài có URL `/vi/blog/[slug]` và `/en/blog/[slug]`.
7. Chỉnh sửa rồi lưu để cập nhật public. Đổi về Bản nháp hoặc bấm Gỡ đăng để ẩn ngay. Không restart/build lại.

Portfolio và dịch vụ dùng cùng trình biên tập, thêm client, year, location, gallery, audio/video và nội dung liên quan. Gallery cho phép kéo dòng hoặc bấm ↑ để sắp xếp. Featured và sort order quyết định homepage. Album có gallery riêng và trạng thái xuất bản; media được gán vào album bằng picker.

## Homepage, About và SEO

Mở Trang chủ & Giới thiệu: title là tên thương hiệu, excerpt là slogan, body là phần giới thiệu ngắn, cover là hero portrait, gallery là ảnh trang About. Các trường cấu hình có nhãn và input cho VI/EN, câu chuyện đầy đủ, nghề nghiệp và liên kết PDF. Timeline có module riêng, hỗ trợ thứ tự và năm; có thể thêm các mốc giải thưởng bằng cùng module.

Mở Cài đặt & SEO: email/phone, social links, nhãn navigation, tiêu đề section và CTA trong hai ngôn ngữ, footer, thông báo dữ liệu mẫu. Ảnh đại diện của Cài đặt là logo navigation, trường favicon nhận URL ảnh từ thư viện. Google Analytics được nạp khi Measurement ID hợp lệ dạng G-...; để trống để tắt. Hero hỗ trợ chọn thêm ảnh slideshow, có nút đổi ảnh và tôn trọng reduced motion. Mỗi bài và dự án có title/description/OG image/canonical riêng; để trống dùng title/excerpt/cover. Canonical mặc định lấy NEXT_PUBLIC_SITE_URL và locale. Sitemap chỉ chứa nội dung đã xuất bản đến hạn. Public dùng SSR để cập nhật tức thì; revalidation cũng xóa router cache khi nội dung đổi.

## Cloudinary / Media Library

Đặt ba biến server `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Không dùng unsigned preset hoặc đưa secret lên client. Không có credentials thì upload trả 503 và thông báo rõ trên giao diện.

Media Library nhận JPG/PNG/WebP, tối đa 10 MB/file và 20 ảnh/lần, kiểm MIME và magic bytes, rate limit, auth và Origin. Kéo thả hoặc chọn nhiều file, có tiến độ upload, grid/list, preview, search, copy URL, sửa alt/caption. Sau upload, file và metadata được lưu Cloudinary/PostgreSQL rồi dùng lại trong Blog/Portfolio/Album. Không xóa ảnh đang làm cover/gallery, xuất hiện trong body, OG image hoặc cấu hình JSON. Ảnh stock seed được bảo vệ; có thể thay bằng ảnh của bạn.

Nếu một batch upload lỗi giữa chừng, những file đã tải thành công vẫn nằm trong thư viện; giao diện tự tải lại để phản ánh kết quả. Upload không phải transaction xuyên hai nhà cung cấp. Nếu ghi DB lỗi sau upload, server yêu cầu Cloudinary xóa file vừa tạo.

## Booking và email

Public form có validation, honeypot, giới hạn IP/email và lưu PostgreSQL trước khi gửi email. Admin xem/tìm/lọc yêu cầu, thay NEW → PROCESSING → CONTACTED → COMPLETED và ghi chú nội bộ. EDITOR không truy cập được booking hoặc cấu hình.

Email tùy chọn: đặt `RESEND_API_KEY`, `EMAIL_FROM` đã xác thực domain và `ADMIN_NOTIFY_EMAIL`. Trạng thái email được ghi NOT_CONFIGURED/SENT/FAILED, lỗi email không làm mất booking. Hiện chưa có tự động retry; yêu cầu FAILED cần kiểm tra thủ công ở Resend. Reverse proxy production phải ghi đè `X-Forwarded-For` bằng IP đáng tin cậy; không chuyển tiếp header IP tùy ý từ client.

## Phân quyền và bảo mật

ADMIN quản lý toàn bộ. EDITOR được quản lý bài viết, dự án, album, media và các danh mục tương ứng. Server xác minh lại role/active từ DB trong mọi mutation; ẩn menu chỉ phục vụ UX. Auth.js v5 beta.32 được dùng cho API App Router; đây vẫn là bản beta, đã khóa dependency và kiểm thử luồng credentials trong project. Nếu tổ chức yêu cầu thư viện auth stable tuyệt đối, cần đánh giá đổi giải pháp hoặc nâng v5 khi có stable trước khi vận hành.

JWT session tối đa 8 giờ; credentials hash bcrypt cost 12; CSRF theo Auth.js và Next Server Actions, upload kiểm tra Origin riêng. HTML sanitize allowlist, iframe chỉ YouTube, chặn script/event handler/javascript URL. Secrets chỉ ở server. Cấu hình TLS/HTTPS, trusted host, reverse proxy và backup thuộc môi trường deploy. Các mã lỗi server production không tiết lộ stack trace; log server phục vụ chẩn đoán.

Rate limit lưu PostgreSQL nên hoạt động qua nhiều Node instance. Có thể định kỳ dọn các dòng RateLimit đã hết hạn bằng job PostgreSQL; không ảnh hưởng counter đang hoạt động. CMS người dùng chưa có reset password qua email hoặc MFA; admin đổi password từ quản lý tài khoản.

## Kiểm tra

```powershell
npx prisma validate
npm run typecheck
npm run lint
npm test
npx playwright install chromium
# Chạy app và DB trước, tests dùng URL trong .env:
npm run test:e2e
npm run build
```

Test E2E tạo dữ liệu mang prefix e2e và dọn sau chạy. Chỉ chạy trên database development/test, không chạy trên production. Có kiểm thử admin/public permissions, draft preview, publish/edit/unpublish, portfolio, gallery, locale switch, booking, mobile overflow và browser errors. Unit/integration test kiểm sanitize, validation, slug và tính nguyên tử rate limiter trên PostgreSQL.

## Deploy Node.js

1. Cấp PostgreSQL production, Cloudinary và tùy chọn Resend. Đặt các biến trong `.env.example` qua secret manager.
2. Đặt AUTH_SECRET ngẫu nhiên mạnh, AUTH_URL và NEXT_PUBLIC_SITE_URL bằng domain HTTPS chính thức. Không dùng credentials local.
3. `npm ci`, `npm run db:generate`, `npm run db:migrate`; seed một lần khi cần dữ liệu khởi tạo/admin. Nội dung mẫu cần thay bằng thông tin thực trước khi công bố.
4. `npm run build`, `npm start` sau reverse proxy hoặc dùng nền tảng hỗ trợ Next.js Node runtime. Server cần TCP tới PostgreSQL và HTTPS tới Cloudinary/Resend.
5. Xác minh end-to-end upload/email bằng tài khoản dịch vụ thực, quyền EDITOR, metadata, domain và mobile. Backup DB thường xuyên; Cloudinary giữ các asset.

Không deploy lên static hosting hoặc Cloudflare Worker vì yêu cầu Node runtime/PostgreSQL TCP. Chưa tạo hosting account hoặc xuất bản ra Internet trong phiên này.

## Phạm vi / giới hạn nghiệm thu

Xem [VERIFICATION](docs/VERIFICATION.md) để biết chính xác các check đã chạy và giới hạn còn lại. Chưa xác minh upload/delete Cloudinary và gửi email thật khi chưa có credentials. Các asset seed là ảnh stock Unsplash, không phải ảnh chân dung thật của chủ website. Module press có CRUD thật nhưng seed không tạo bài báo giả. Logo/favicon, Google Analytics tùy chọn và slideshow Hero đã có tích hợp; chưa gửi dữ liệu tới một property Analytics thật.
