# Nghiệm thu và giới hạn

Môi trường: Windows, Node.js 24.11, Next.js 16.4.3, React 19.3.1, Prisma 7.10.1. PostgreSQL local chạy bằng binary thật, dữ liệu bền vững trong `.local/postgres`. Không dùng mock database.

## Các kiểm tra kỹ thuật đã chạy

- Prisma validate: thành công.
- Prisma migration: migration khởi tạo đã áp dụng; migrate status báo database up to date.
- Seed: thành công, chạy lặp không ghi đè mật khẩu và nội dung hiện có; các khóa cấu hình mới được bổ sung nếu thiếu.
- TypeScript strict: thành công.
- ESLint: thành công, không warning/error ở lần kiểm tra cuối.
- Unit/integration: 6/6 qua; gồm sanitize HTML, URL/slug, contact validation, content validation, lịch xuất bản theo giờ Việt Nam không phụ thuộc múi giờ server, và cập nhật nguyên tử rate limit qua nhiều request đồng thời trên PostgreSQL.
- Production build: thành công. Đã khởi động bản build bằng `next start` để nghiệm thu riêng với môi trường development.
- npm audit --omit=dev: không ghi nhận vulnerability tại thời điểm kiểm tra. Kết quả này không thay thế việc cập nhật và audit định kỳ.
- HTTP production: `/sitemap.xml`, `/robots.txt`, `/en` trả 200; HTML của `/en` có `lang="en"`.

## Kiểm thử trình duyệt

Chromium qua Playwright, database PostgreSQL thật. Các test nằm trong `tests/e2e`:

1. Anonymous không truy cập được trang admin; API Media Library trả 401.
2. Admin tạo bài có cover và danh mục, lưu nháp, xem private preview, publish, xem public, sửa rồi gỡ đăng. Nội dung nháp không xuất hiện trong response public.
3. Tạo portfolio, chọn nhiều ảnh, publish và kiểm tra ảnh trong trang chi tiết.
4. Gửi booking từ public, kiểm tra dữ liệu DB, đổi trạng thái và ghi chú từ admin.
5. EDITOR bị server chặn khỏi quản lý tài khoản và cài đặt.
6. Chín route public, chuyển locale giữ đường dẫn chi tiết, kiểm tra lang, lightbox ArrowRight/Escape, mobile 390px không tràn ngang, không có pageerror JavaScript trên các trang public được kiểm tra.
7. Sửa slogan và cover Hero trong Admin, kiểm tra public phản ánh dữ liệu mới; khôi phục nội dung sau test.
8. Service, partner, press, timeline và album: tạo, publish, nhân bản, gỡ đăng, xóa qua UI; xác minh PostgreSQL.
9. Media alt text lưu được vào DB; xóa media đang dùng bị chặn và record vẫn còn.

Bộ nghiệm thu đã đạt 9/9 trên bản production (next start). Screenshot desktop/mobile nằm trong `.local/desktop.png` và `.local/mobile.png` (ignored). Chỉ kiểm tra Chromium; chưa kiểm thử Safari, Firefox hoặc thiết bị thật.

Next.js có thể trả HTTP 200 cho not-found được render sau khi response đã streaming. Bản nháp vẫn không được đọc bởi truy vấn public, không trả title/body và có noindex. Test kiểm tra không rò rỉ nội dung thay vì phụ thuộc mã HTTP của streamed response.

## Dịch vụ chưa thể kiểm thử end-to-end

- **Cloudinary:** đã triển khai upload server, MIME/magic-byte validation, giới hạn file, xác thực, origin, metadata, tái sử dụng ảnh và bảo vệ ảnh đang dùng. Chưa có credentials nên chưa upload hoặc xóa asset thật trên Cloudinary. Bộ test dùng các ảnh seed để kiểm tra chọn/tái sử dụng/metadata. Không thay upload bằng file giả hoặc endpoint mock.
- **Resend:** đã có code gửi thông báo và ghi trạng thái email; chưa có API key/domain/from nên chưa gửi email thật. Booking vẫn lưu DB khi email chưa cấu hình hoặc gửi lỗi. Chưa có cơ chế retry tự động.
- **Google Analytics:** chỉ nạp script khi có Measurement ID hợp lệ. Chưa cấu hình property thật để xác minh tracking.
- **Hosting:** chưa deploy ra Internet. Stack này cần Next.js Node runtime và kết nối PostgreSQL, không tương thích static-only hosting hoặc Worker runtime của Sites. README có hướng dẫn deploy Node.js.
- **Auth.js:** dùng v5 beta.32 để tích hợp App Router. Credentials/session/RBAC đã có kiểm thử, nhưng bản thân thư viện này chưa là stable v5.

## Các giới hạn sản phẩm cần biết

Media Library hiện tải tối đa 500 asset; trang nội dung admin/public có pagination server. Với thư viện lớn hơn cần thêm pagination API/picker. Các cấu hình quan hệ nội dung cũng giới hạn 500 lựa chọn. Homepage và các danh sách nhỏ như timeline/album/partner giới hạn 100 record. Đây là giới hạn truy vấn có chủ đích, chưa có UI quản lý archive media quy mô lớn.

Caption Tiptap được lấy từ metadata lúc chèn ảnh; thay caption trong Media Library không tự viết lại caption đã lưu bên trong các bài cũ. PDF được gắn bằng URL trong profile; uploader hiện chỉ nhận hình, chưa nhận PDF/audio/video.

Chưa có version history, autosave, MFA, password reset qua email hoặc workflow phê duyệt nhiều cấp; những mục này không thuộc luồng CMS đã nghiệm thu. Password có thể đổi trong quản lý tài khoản. Public nhận nội dung được lưu khi trạng thái là PUBLISHED; muốn soạn riêng trước khi xuất bản lại thì chuyển bài về DRAFT. Bản dịch fallback VI khi EN chưa có title.

Các font được self-host, có giấy phép SIL OFL trong `public/fonts`. Ảnh, nhân vật, dự án và thương hiệu seed đều là nội dung minh họa và được ghi rõ trên website. Trước khi công bố cần thay bằng thông tin có thật của chủ website.
