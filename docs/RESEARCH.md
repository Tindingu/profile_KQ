# Nghiên cứu website tham chiếu

Ngày khảo sát: 25/10/2026 (Asia/Saigon). Nguồn: https://ngotronghien.com/.

Web reader không truy cập được nguồn, nhưng HTTP trực tiếp từ môi trường phát triển trả về 200. Đã đọc HTML trang chủ, `/gioi-thieu/`, `/kinh-nghiem/`, `/dich-vu/`, `/blog/`, `/bao-chi/`, `/en/`, hai trang dịch vụ lồng tiếng/KOL, một bài blog và một dự án. Đây là khảo sát HTML và liên kết; chưa thao tác trực tiếp trên website tham chiếu bằng trình duyệt và không khẳng định đã khảo sát mọi bài viết hoặc mọi hiệu ứng.

## Cấu trúc quan sát được

Navigation gồm giới thiệu, kinh nghiệm, dịch vụ, hình ảnh (anchor gallery của trang giới thiệu), blog, truyền thông và VI/EN. Footer có social links và CTA liên hệ Zalo. Homepage tuần tự gồm hero/giới thiệu, câu chuyện cá nhân, dự án nổi bật, ba nhóm dịch vụ, đối tác, bài viết và báo chí. Liên hệ chủ yếu hướng sang kênh social; form booking là phần bổ sung theo đặc tả của dự án mới.

About có câu chuyện dài, timeline và gallery. Portfolio có trang danh sách, phân loại và chi tiết từng sự kiện. Chi tiết ghi khách hàng/năm, ảnh và các chương trình cùng nhóm. Dịch vụ gồm MC, voice talent và hợp tác thương hiệu, có các trang riêng. Blog có featured/latest articles, danh mục, thời gian đọc, bài chi tiết gồm heading và bài liên quan. Press liên kết ra các nguồn xuất bản bên ngoài. English có nội dung dịch tương ứng.

CSS và markup cho thấy typography serif kết hợp sans, khoảng trắng lớn, ảnh nổi bật và các thành phần reveal/hover/navigation. Khảo sát HTML không chứng minh độ mượt hay hành vi bàn phím của hiệu ứng gốc.

## Chuyển thành CMS

Các content type cần quản lý: profile, site settings, project, post, service, partner, press, timeline và album; mỗi nội dung có bản dịch. Category là bảng riêng, media tái sử dụng bằng foreign key và bảng nối có thứ tự. Booking, user, audit log và rate limit có bảng riêng. Cấu trúc này dùng lại cùng cơ chế publish và validation, tránh chín hệ CRUD trùng lặp.

## Hướng thiết kế mới

Nhận diện demo Kiều Quy, nền giấy sáng, xanh rêu, typography editorial, ảnh stock Unsplash và khoảng trắng lớn. Nhân vật và dự án đều ghi rõ là minh họa. Không dùng ảnh, logo, văn bản tiểu sử hoặc danh tính của website tham chiếu. Không seed báo chí giả hay lời chứng thực gắn cho đơn vị thật.

## Kiến trúc

Next.js App Router / Node.js → Server Components và Server Actions → Prisma 7 + pg adapter → PostgreSQL. Nội dung có translation VI/EN, status, publication date và index. Public SSR luôn truy vấn dữ liệu đã xuất bản đến hạn. Admin save/publish gọi revalidatePath; không cần build lại. Bản nháp được xem qua route admin có xác thực, không tạo public preview token có thể chia sẻ ngoài ý muốn.

Auth.js Credentials dùng bcrypt và JWT cookie, nhưng quyền được đọc lại từ User trong DB ở mỗi thao tác. Vô hiệu tài khoản hoặc đổi role có tác dụng ngay, không đợi JWT hết hạn. Rate limiter lưu PostgreSQL, cập nhật nguyên tử. Rich text được sanitize phía server khi ghi và khi render.

Route công khai: `/vi` và `/en`; cả hai dùng segment `gioi-thieu`, `kinh-nghiem`, `dich-vu`, `hinh-anh`, `blog`, `bao-chi`, `lien-he`. Slug giữ nguyên giữa hai locale để chuyển ngôn ngữ bảo toàn trang. Khi title EN trống, fallback toàn bộ bản VI có kiểm soát. Metadata, canonical, hreflang, OG, Twitter, sitemap và JSON-LD được tạo từ DB.

CMS gộp các module bằng `/admin/[section]/[[...path]]`, vẫn có URL đầy đủ `/admin/posts/new`, `/admin/posts/[id]/edit`, `/admin/portfolio`, v.v. Các cấu hình và nhãn website có form chỉnh sửa cây giá trị; nội dung bài viết dùng Tiptap.
