# Hướng dẫn sử dụng trang Admin

Tài liệu dành cho người quản trị và biên tập nội dung website Personal Profile / Portfolio. Các tên menu, nút và thao tác bên dưới được đối chiếu với phiên bản hiện có trong dự án.

## Mục lục

1. [Đăng nhập và đăng xuất](#1-đăng-nhập-và-đăng-xuất)
2. [Các menu và quyền truy cập](#2-các-menu-và-quyền-truy-cập)
3. [Quy tắc lưu và xuất bản](#3-quy-tắc-lưu-và-xuất-bản)
4. [Viết và quản lý bài blog](#4-viết-và-quản-lý-bài-blog)
5. [Soạn thảo nội dung và quản lý bản dịch](#5-soạn-thảo-nội-dung-và-quản-lý-bản-dịch)
6. [Quản lý hình ảnh](#6-quản-lý-hình-ảnh)
7. [Quản lý Portfolio](#7-quản-lý-portfolio)
8. [Quản lý dịch vụ, đối tác và báo chí](#8-quản-lý-dịch-vụ-đối-tác-và-báo-chí)
9. [Quản lý album và danh mục](#9-quản-lý-album-và-danh-mục)
10. [Thay nội dung trang chủ và giới thiệu](#10-thay-nội-dung-trang-chủ-và-giới-thiệu)
11. [Cài đặt website và SEO](#11-cài-đặt-website-và-seo)
12. [Xử lý liên hệ và booking](#12-xử-lý-liên-hệ-và-booking)
13. [Quản lý tài khoản](#13-quản-lý-tài-khoản)
14. [Các lỗi thường gặp](#14-các-lỗi-thường-gặp)
15. [Checklist trước khi xuất bản](#15-checklist-trước-khi-xuất-bản)

## 1. Đăng nhập và đăng xuất

### Đăng nhập

1. Truy cập trang đăng nhập. Với môi trường local của dự án: [http://localhost:3001/admin/login](http://localhost:3001/admin/login).
2. Nhập **Email** và **Mật khẩu** được cấp.
3. Bấm **Đăng nhập →**. Khi thành công, hệ thống mở trang **Tổng quan**.

Khi website có tên miền riêng, thay `http://localhost:3001` bằng tên miền đó; đường dẫn đăng nhập vẫn là `/admin/login`.

Tài khoản local ban đầu được tạo từ `ADMIN_EMAIL` và `ADMIN_PASSWORD` trong tệp `.env`. Người vận hành có thể xem tệp này trên máy chủ hoặc trong IDE. Không đưa mật khẩu hoặc nội dung `.env` vào tài liệu chia sẻ. Các tài khoản tạo thêm được quản lý trong menu **Tài khoản quản trị**.

Nếu không mở được trang local, cần khởi động database và website theo phần [Chạy local trong README](../README.md#chạy-local).

### Đăng xuất

Bấm **Đăng xuất** trong khối tài khoản ở cuối sidebar trên giao diện desktop. Nên dùng Admin trên desktop hoặc tablet để thao tác đầy đủ; một số thành phần sidebar được thu gọn hoặc ẩn ở màn hình điện thoại.

Phiên đăng nhập có thời hạn tối đa 8 giờ. Khi phiên hết hạn, đăng nhập lại để tiếp tục.

## 2. Các menu và quyền truy cập

**Tổng quan** hiển thị số lượng nội dung, bài viết gần đây, hoạt động quản lý và các thao tác nhanh. ADMIN còn thấy số lượng và danh sách yêu cầu liên hệ mới.

| Menu | Dùng để làm gì | ADMIN | EDITOR |
| --- | --- | :---: | :---: |
| Tổng quan | Theo dõi nội dung, mở thao tác nhanh | Có | Có |
| Bài viết | Viết, sửa, xuất bản blog | Có | Có |
| Portfolio | Quản lý dự án / sự kiện | Có | Có |
| Dịch vụ | Quản lý các dịch vụ cung cấp | Có | Không |
| Đối tác | Quản lý tên, logo và liên kết đối tác | Có | Không |
| Báo chí | Quản lý bài báo và đường dẫn nguồn | Có | Không |
| Timeline & thành tích | Quản lý các mốc nghề nghiệp | Có | Không |
| Album ảnh | Tạo và sắp xếp ảnh trong album | Có | Có |
| Trang chủ & Giới thiệu | Đổi tên, slogan, Hero, nội dung giới thiệu | Có | Không |
| Cài đặt & SEO | Thông tin liên hệ, logo, nhãn website, SEO mặc định | Có | Không |
| Danh mục nội dung | Phân loại blog, portfolio, album, dịch vụ | Có | Blog, Portfolio, Album |
| Media Library | Tải ảnh, sửa mô tả và tái sử dụng ảnh | Có | Có |
| Liên hệ / Booking | Xử lý yêu cầu khách hàng | Có | Không |
| Tài khoản quản trị | Cấp tài khoản, đổi mật khẩu và vai trò | Có | Không |

EDITOR không thể mở các chức năng dành riêng cho ADMIN bằng cách nhập URL trực tiếp. Nếu thiếu menu hoặc bị từ chối truy cập, liên hệ người quản trị để kiểm tra vai trò.

## 3. Quy tắc lưu và xuất bản

### Khi nào thay đổi được lưu?

Trong các màn hình biên tập nội dung, bấm **Lưu nội dung** và chờ thông báo **Đã lưu nội dung.** trước khi rời trang. Chuyển tab **Tiếng Việt / English** trong cùng biểu mẫu không cần lưu riêng; nút lưu sẽ lưu cả hai bản dịch.

Hệ thống chưa có tự động lưu hoặc lịch sử phiên bản để khôi phục. Thay đổi chưa lưu có thể mất khi đóng tab hoặc tải lại trang.

Riêng **Alt text** và **Caption** trong Media Library được lưu khi bạn rời ô nhập; xem mục 6.

### Các trạng thái nội dung

| Trạng thái trong biểu mẫu | Mã ở bảng / bộ lọc | Kết quả trên website |
| --- | --- | --- |
| Bản nháp | `DRAFT` | Không công khai; có thể xem trước sau khi đăng nhập |
| Đã xuất bản | `PUBLISHED` | Công khai khi đã đến ngày, giờ xuất bản |
| Lưu trữ | `ARCHIVED` | Giữ nội dung trong Admin nhưng không công khai |

Khi sửa một nội dung đang **Đã xuất bản** và bấm lưu, thay đổi có thể xuất hiện công khai ngay. Nếu cần soạn riêng, chuyển về **Bản nháp** rồi lưu trước khi tiếp tục; cách này cũng làm phiên bản hiện tại ngừng hiển thị công khai. Chưa có cơ chế giữ một bản public cũ và một bản nháp mới riêng biệt.

### Xuất bản ngay và hẹn giờ

- **Xuất bản ngay từ biểu mẫu:** chọn **Đã xuất bản**, xóa giá trị ô **Ngày xuất bản** nếu muốn lấy thời điểm hiện tại, rồi bấm **Lưu nội dung**.
- **Hẹn giờ:** chọn **Đã xuất bản**, nhập thời điểm tương lai vào **Ngày xuất bản (giờ Việt Nam, UTC+7)** rồi lưu. Ví dụ `30/10/2026 09:00` nghĩa là 09:00 sáng tại Việt Nam. Cách trình bày ngày trong ô phụ thuộc trình duyệt.
- **Gỡ công khai:** chọn **Bản nháp** và lưu, hoặc bấm **Gỡ đăng** ở bảng danh sách.

Nút **Đăng** ở bảng danh sách xuất bản ngay và đặt lại ngày đăng bằng thời điểm bấm nút. Để hẹn giờ, hãy dùng biểu mẫu chỉnh sửa thay vì nút này.

Nội dung hẹn giờ xuất hiện khi khách truy cập hoặc tải lại trang sau thời điểm đã chọn, miễn là website và database đang hoạt động. Không cần khởi động lại server hay build lại ứng dụng.

### Slug và thứ tự

**Slug** là đoạn cuối đường dẫn, ví dụ `truoc-khi-den-sang` trong `/vi/blog/truoc-khi-den-sang`.

- Dùng chữ thường không dấu, số và dấu gạch ngang: `su-kien-thuong-hieu-2026`.
- Bấm **Tạo slug từ tiêu đề** để tạo nhanh, hoặc nhập riêng.
- Slug phải khác các nội dung cùng loại. Sau khi bài đã được chia sẻ, nên giữ nguyên slug; hệ thống chưa tự tạo chuyển hướng từ địa chỉ cũ khi đổi slug.
- **Thứ tự** dùng số nguyên từ 0; số nhỏ hơn được ưu tiên ở các khu vực có sắp xếp theo thứ tự. Thứ tự bảng quản lý còn phụ thuộc lựa chọn **Mới cập nhật / Cũ nhất**.

## 4. Viết và quản lý bài blog

### Tạo bài đầu tiên

1. Mở **Bài viết** → **+ Tạo mới**.
2. Trong tab **Tiếng Việt**, nhập **Tiêu đề VI ***, **Mô tả ngắn** và **Nội dung**.
3. Nhập **Slug *** hoặc bấm **Tạo slug từ tiêu đề**.
4. Chọn **Danh mục**. Nếu chưa có danh mục phù hợp, tạo ở **Danh mục nội dung**, sau đó trở lại biểu mẫu.
5. Nhập **Tags**, phân cách bằng dấu phẩy, ví dụ `nghe-mc, storytelling, su-kien`.
6. Trong khối **Ảnh đại diện**, bấm **Chọn từ thư viện**, chọn một ảnh rồi bấm **Chọn 1 ảnh**. Có thể tải ảnh mới ngay trong cửa sổ thư viện nếu dịch vụ lưu ảnh đã được cấu hình.
7. Chuyển sang **English** để nhập bản dịch nếu có.
8. Giữ **Bản nháp**, bấm **Lưu nội dung** và chờ thông báo thành công.
9. Bấm **Xem trước** để kiểm tra nội dung đã lưu.
10. Trở lại biểu mẫu, chọn **Đã xuất bản**, đặt ngày đăng phù hợp và bấm **Lưu nội dung**.
11. Mở `/vi/blog/[slug]` trên website để kiểm tra kết quả công khai.

Tiêu đề tiếng Việt và slug là các trường bắt buộc của nội dung. Những khối chi tiết dùng chung như **Năm**, **Địa điểm**, **Khách hàng / Nhà xuất bản** có thể bỏ trống nếu không phù hợp với bài blog. Tác giả được gán từ tài khoản tạo bài, không có ô chọn tác giả trong biểu mẫu.

### Xem trước bản nháp

Nút **Xem trước** có sau lần lưu đầu tiên. Bảng danh sách cũng có liên kết **Preview ↗**.

Preview hiển thị dữ liệu đã lưu, không bao gồm thay đổi bạn đang nhập nhưng chưa bấm lưu. Đây là trang riêng tư: người mở cần đăng nhập và có quyền xem nội dung. Không gửi URL preview cho khách hàng với kỳ vọng họ có thể xem khi chưa có tài khoản.

Preview mặc định dùng tiếng Việt. Khi cần kiểm tra bản tiếng Anh, có thể thêm `?locale=en` vào địa chỉ preview đang mở. Hãy kiểm tra thêm trang public sau khi xuất bản, vì preview nội dung không mô phỏng mọi bố cục của trang chủ, album hoặc đối tác.

### Tìm, sửa, nhân bản và xóa

Ở bảng **Bài viết**, nhập từ khóa, chọn trạng thái, danh mục và cách sắp xếp, sau đó bấm **Lọc**. Dùng **Trước / Tiếp** khi có nhiều trang.

| Thao tác | Cách dùng |
| --- | --- |
| Sửa | Bấm tiêu đề hoặc **Sửa**, chỉnh nội dung rồi bấm **Lưu nội dung** |
| Nhân bản | Bấm **Nhân bản**; bản sao có tiêu đề thêm `(copy)`, slug mới, trạng thái nháp và không được đánh dấu nổi bật |
| Đăng | Xuất bản ngay nội dung đã lưu; không áp dụng giờ hẹn cũ |
| Gỡ đăng | Chuyển nội dung về bản nháp và ngừng công khai |
| Xóa | Bấm **Xóa**, kiểm tra hộp xác nhận rồi bấm **Xác nhận xóa** |

Xóa không có thùng rác để khôi phục. Nếu chỉ muốn ẩn nội dung, dùng **Bản nháp** hoặc **Lưu trữ**.

## 5. Soạn thảo nội dung và quản lý bản dịch

### Các nút trên trình soạn thảo

Đặt con trỏ tại vị trí cần chèn, hoặc bôi đen đoạn văn bản cần định dạng, rồi dùng thanh công cụ:

| Nút | Chức năng |
| --- | --- |
| **B** / **I** | In đậm / in nghiêng |
| **H2** / **H3** | Đặt tiêu đề mục / tiêu đề mục nhỏ |
| **• List** / **1. List** | Danh sách chấm đầu dòng / đánh số |
| **❞ Quote** | Định dạng đoạn trích dẫn |
| **Link** | Nhập URL để gắn liên kết cho đoạn được chọn |
| **+ Ảnh** | Chọn ảnh từ thư viện và chèn vào nội dung |
| **Video** | Nhập URL YouTube để chèn video |
| **Table** | Chèn bảng ban đầu 3 hàng × 3 cột |
| **↶** / **↷** | Hoàn tác / làm lại thao tác soạn thảo |

Tiêu đề bài đã là tiêu đề chính của trang, nên dùng H2/H3 để chia các mục bên trong bài. Mục lục của trang chi tiết được tạo từ các heading H2/H3 trong nội dung.

Caption của ảnh trong bài được lấy từ Media Library tại thời điểm chèn. Nếu sửa caption trong thư viện sau đó, caption đã chèn trong bài cũ không tự đổi; chỉnh trong nội dung bài hoặc chèn lại ảnh để dùng caption mới.

### Tiếng Việt và tiếng Anh

Các trường tiêu đề, mô tả, nội dung và SEO có bản riêng ở hai tab. Ảnh đại diện, gallery, slug, tags, trạng thái và lịch xuất bản dùng chung.

Nếu **Tiêu đề EN** để trống, trang tiếng Anh dùng bản tiếng Việt của nội dung đó. Nếu đã nhập tiêu đề EN nhưng để trống phần nội dung EN, hệ thống vẫn chọn bản EN và có thể hiển thị phần thân trống. Vì vậy, chỉ nhập tiêu đề EN khi đã chuẩn bị các phần dịch cần thiết.

Không có chức năng tự động dịch. Sau khi dịch xong, bấm **Lưu nội dung** một lần để lưu cả hai ngôn ngữ.

## 6. Quản lý hình ảnh

Mở **Media Library** tại `/admin/media`.

### Tải ảnh lên

1. Kéo ảnh vào vùng **Kéo thả hình ảnh vào đây**, hoặc bấm **Tải ảnh lên Cloudinary**.
2. Chọn một hoặc nhiều file.
3. Chờ chỉ báo tiến độ và thông báo kết quả. Ảnh tải thành công xuất hiện trong thư viện.

Chấp nhận **JPG, PNG, WebP**, tối đa **10 MB mỗi ảnh** và **20 ảnh mỗi lần tải**. Uploader hiện không nhận PDF, audio hoặc video.

Upload cần người vận hành cấu hình Cloudinary trên server. Nếu có thông báo **Chưa cấu hình Cloudinary trên server.**, nhờ người vận hành cấu hình theo [README](../README.md#cloudinary--media-library); không nhập API secret vào nội dung hoặc các ô cài đặt website.

Nếu một lần tải nhiều ảnh bị lỗi giữa chừng, một số ảnh có thể đã tải thành công. Kiểm tra thư viện trước khi tải lại toàn bộ để tránh tạo ảnh trùng.

### Tìm ảnh và sửa thông tin

- Ô **Tìm ảnh…** tìm theo tên file và alt text trong tập ảnh đang được tải vào thư viện.
- **Dạng danh sách / Dạng lưới** đổi cách trình bày.
- Bấm ảnh trong trang Media Library để mở ảnh lớn ở tab mới.
- **Copy URL** sao chép địa chỉ ảnh, có thể dùng cho favicon hoặc OG image.
- **Alt text** mô tả nội dung ảnh cho người dùng trình đọc màn hình và khi ảnh không tải được, ví dụ: “MC dẫn chương trình tại hội nghị khách hàng”.
- **Caption** là chú thích ảnh, có thể hiển thị ở gallery hoặc khi chèn ảnh vào bài.

Sau khi sửa **Alt text** hoặc **Caption**, bấm ra ngoài ô nhập và chờ thông báo lưu thành công. Không cần tìm nút **Lưu nội dung** ở trang Media Library.

### Chọn ảnh cho nội dung

Trong biểu mẫu, bấm **Chọn từ thư viện** hoặc **+ Ảnh**. Bấm các ảnh muốn chọn, rồi bấm **Chọn N ảnh** để xác nhận. Ảnh đại diện chỉ chọn một ảnh; gallery có thể chọn nhiều ảnh.

Khi mở lại bộ chọn, thao tác xác nhận sẽ lưu bộ ảnh đang được chọn. Muốn thêm ảnh cho gallery, giữ chọn các ảnh cũ mà bạn vẫn cần.

### Gỡ ảnh và xóa file

**Gỡ ảnh / Gỡ** trong biểu mẫu chỉ bỏ ảnh khỏi nội dung đang sửa. Cần bấm **Lưu nội dung** để áp dụng; file vẫn còn trong Media Library để tái sử dụng.

**Xóa** trong Media Library yêu cầu xác nhận và có thể xóa cả file trên Cloudinary. Hệ thống chặn xóa ảnh đang được nội dung tham chiếu. Hãy gỡ ảnh khỏi các nội dung liên quan, lưu lại rồi mới xóa file. Ảnh mẫu dùng chung của seed được bảo vệ; bạn có thể thay chúng bằng ảnh khác trong nội dung.

## 7. Quản lý Portfolio

1. Mở **Portfolio** → **+ Tạo mới**.
2. Nhập tiêu đề VI/EN, slug, mô tả và nội dung dự án.
3. Chọn danh mục, ví dụ **Doanh nghiệp**, **Talkshow** hoặc **Truyền hình**.
4. Điền **Khách hàng / Nhà xuất bản**, **Năm** và **Địa điểm** nếu có.
5. Chọn **Ảnh đại diện** và các ảnh trong **Gallery**.
6. Nếu có, nhập **YouTube URL** và chọn **Nội dung liên quan**.
7. Tích **Nổi bật trên trang chủ** nếu muốn giới thiệu dự án ở homepage; nhập **Thứ tự** phù hợp.
8. Lưu nháp, kiểm tra preview rồi xuất bản.

Trang chi tiết public có dạng `/vi/kinh-nghiem/[slug]` và `/en/kinh-nghiem/[slug]`.

Trong gallery của biểu mẫu, kéo dòng ảnh đến vị trí mới hoặc dùng nút **↑** để đưa lên một vị trí. Bấm **Gỡ** để bỏ ảnh khỏi dự án, sau đó lưu. Thứ tự xác nhận trong bộ chọn ảnh không thay thế thao tác sắp xếp này.

Ô **Nội dung liên quan** là danh sách chọn nhiều: giữ Ctrl trên Windows hoặc Command trên macOS khi chọn các mục rời nhau.

Homepage hiện hiển thị tối đa **4 dự án nổi bật** đã xuất bản đến hạn. Dự án chưa được tích nổi bật vẫn có thể xuất hiện trong trang danh sách Portfolio.

## 8. Quản lý dịch vụ, đối tác và báo chí

Ba menu dùng chung biểu mẫu biên tập. Chỉ cần điền các trường phù hợp với loại nội dung; không cần điền mọi ô chi tiết.

| Menu | Những trường nên điền | Nơi hiển thị |
| --- | --- | --- |
| Dịch vụ | Tên dịch vụ, slug, mô tả, nội dung VI/EN, ảnh đại diện, thứ tự; tùy chọn gallery, YouTube, audio, nội dung liên quan | Trang chủ và `/vi/dich-vu`; mỗi dịch vụ có trang chi tiết |
| Đối tác | Tiêu đề là tên đối tác, ảnh đại diện là logo, **Link website / bài gốc** là website đối tác, thứ tự | Khối đối tác trên trang chủ |
| Báo chí | Tiêu đề bài báo, mô tả, ảnh đại diện, **Khách hàng / Nhà xuất bản** là tên báo, **Link website / bài gốc** là URL nguồn, ngày xuất bản | Khối truyền thông trên trang chủ và `/vi/bao-chi` |

Đối với dịch vụ, có thể trình bày các hạng mục bằng danh sách trong **Nội dung**. **Audio sample URL** cần là đường dẫn đến file âm thanh có thể phát trực tiếp; đây không phải ô tải file lên.

Đối tác không có ảnh logo sẽ được trình bày bằng tên. Khi có liên kết, khách có thể bấm để mở website đối tác. Bài báo cần URL nguồn để khách mở bài gốc; không dùng đường dẫn preview Admin làm URL nguồn.

Lưu với trạng thái **Đã xuất bản** và ngày đăng đã đến hạn để hiển thị công khai. Các nhóm này không cần tích **Nổi bật trên trang chủ** như điều kiện bắt buộc để xuất hiện.

## 9. Quản lý album và danh mục

### Tạo album ảnh

1. Mở **Album ảnh** → **+ Tạo mới**.
2. Nhập tên album VI/EN và slug.
3. Ở khối **Gallery**, bấm **Chọn từ thư viện** và chọn nhiều ảnh.
4. Sắp xếp bằng kéo thả hoặc nút **↑**.
5. Chọn trạng thái, thứ tự và bấm **Lưu nội dung**.
6. Mở `/vi/hinh-anh` để kiểm tra album và ảnh sau khi xuất bản.

Khách có thể lọc theo album trên trang Hình ảnh. Khi mở ảnh lớn, có thể dùng phím trái/phải để chuyển ảnh và Escape để đóng.

### Tạo danh mục

1. Mở **Danh mục nội dung**.
2. Chọn **Loại**: Blog, Portfolio, Album hoặc Dịch vụ tùy quyền tài khoản.
3. Nhập **Tên VI**, **Tên EN**, **Slug** và **Thứ tự**.
4. Bấm **Lưu danh mục**.
5. Mở hoặc tải lại biểu mẫu nội dung, rồi chọn danh mục vừa tạo.

Bấm **Sửa** để chỉnh danh mục đã có; bấm **Tạo mới** để trở lại biểu mẫu tạo danh mục. Không đổi loại của một danh mục đang tồn tại. Nếu cần chuyển loại, tạo danh mục mới và gán lại nội dung.

Danh mục đang được nội dung sử dụng không thể xóa. Hãy đổi hoặc bỏ danh mục trong các nội dung liên quan, lưu lại rồi mới xóa danh mục.

Danh mục loại **Album** chỉ là dữ liệu phân loại; muốn tạo một album chứa ảnh và xuất hiện trong bộ lọc trang Hình ảnh, phải tạo ở menu **Album ảnh**.

## 10. Thay nội dung trang chủ và giới thiệu

### Tên thương hiệu, slogan và ảnh Hero

Mở **Trang chủ & Giới thiệu**. Đây là bản cấu hình dùng chung cho trang chủ và trang giới thiệu, không phải danh sách nhiều trang để tạo tùy ý.

| Trường trong biểu mẫu | Nội dung được thay đổi |
| --- | --- |
| Tiêu đề VI / EN | Tên thương hiệu cá nhân được hiển thị trên website |
| Mô tả ngắn VI / EN | Slogan ngắn bên dưới đoạn giới thiệu trong Hero |
| Nội dung VI / EN | Đoạn giới thiệu bên phải ảnh Hero, phần giới thiệu ngắn trên trang chủ và trang About |
| Ảnh đại diện | Ảnh Hero và ảnh chính của trang giới thiệu |
| Gallery | Các ảnh bổ sung ở trang giới thiệu |

Để đổi ảnh Hero, chọn ảnh khác trong **Ảnh đại diện**, bấm **Lưu nội dung** rồi tải lại trang chủ. Slug `profile` được cố định; không cần sửa.

### Các trường cấu hình phía dưới

Mở khối **Cấu hình website**, chỉnh các trường tương ứng ở **Tiếng Việt / English**:

- **Nghề nghiệp:** dòng giới thiệu nghề phía trên lời chào Hero.
- **Lời chào Hero:** câu mở đầu phía trên tên, ví dụ “Xin chào, tôi là”; có thể sửa riêng VI/EN.
- **Tiêu đề giới thiệu:** heading của phần giới thiệu ngắn trên homepage.
- **Câu chuyện đầy đủ (HTML):** phần giới thiệu mở rộng khi khách bấm đọc thêm trên trang About.
- **Lời dẫn dịch vụ / Lời dẫn liên hệ:** đoạn mở đầu của các khu vực tương ứng.
- **Portfolio PDF URL:** liên kết đến file PDF đã được lưu ở một địa chỉ truy cập được.

**Câu chuyện đầy đủ (HTML)** hiện là ô nhập HTML, không phải trình soạn thảo Tiptap. Nếu chỉ cần các đoạn văn đơn giản, có thể dùng mẫu:

```html
<h2>Hành trình của tôi</h2>
<p>Đoạn giới thiệu đầu tiên.</p>
<p>Đoạn kể chuyện tiếp theo.</p>
```

### Slideshow Hero

1. Tại **Slideshow Hero (ngoài ảnh đại diện)**, bấm **Chọn từ thư viện**.
2. Chọn các ảnh bổ sung rồi xác nhận.
3. Bấm **Lưu nội dung** và mở trang chủ.

Khi có ít nhất hai ảnh, carousel tự chuyển sau khoảng 6,5 giây. Bạn có thể bấm mũi tên, chọn chấm bên dưới, dùng phím trái/phải khi khối ảnh đang được chọn hoặc vuốt trên điện thoại. Nút dừng/tiếp tục nằm bên dưới ảnh; tự chạy cũng tạm dừng khi rê chuột hoặc thao tác bàn phím trong carousel. Nếu thiết bị bật giảm chuyển động, ảnh không tự chạy.

Nếu chỉ có một ảnh, bộ đếm hiển thị `01 / 01`; hệ thống không tạo thêm ảnh giả. Các ảnh bổ sung lấy đúng từ mục Slideshow Hero, không tự lấy ảnh album hoặc dự án khác.

Ảnh đại diện là ảnh chính; ảnh chọn thêm được dùng cho slideshow. Muốn tắt slideshow, mở lại bộ chọn, bỏ chọn các ảnh bổ sung, bấm **Chọn 0 ảnh** rồi lưu; ảnh đại diện vẫn giữ nguyên.

### Timeline và thành tích

Mở **Timeline & thành tích** → **+ Tạo mới**. Nhập tiêu đề của mốc, mô tả VI/EN, **Năm** và **Thứ tự**, sau đó xuất bản. Dùng cùng module để thêm mốc học tập, công việc hoặc giải thưởng. Các mốc hiển thị ở trang Giới thiệu.

### Chọn bài và dự án trên homepage

- Với dự án: vào **Portfolio**, tích **Nổi bật trên trang chủ**, đặt **Thứ tự** và lưu. Homepage lấy tối đa 4 dự án nổi bật đủ điều kiện công khai.
- Với blog: vào **Bài viết**, tích **Nổi bật trên trang chủ** cho các bài muốn ưu tiên. Homepage lấy tối đa 3 bài; nếu không có bài nổi bật nào đủ điều kiện, hệ thống dùng danh sách bài công khai hiện có theo thứ tự của website.

Giữ bản **Trang chủ & Giới thiệu** ở trạng thái **Đã xuất bản**, với ngày đăng không ở tương lai, để website tiếp tục hiển thị các nội dung này.

## 11. Cài đặt website và SEO

### Thông tin chung

Mở **Cài đặt & SEO** và chỉnh:

| Vị trí | Công dụng |
| --- | --- |
| Tiêu đề VI / EN | Tên website, được dùng trong tiêu đề trang mặc định và chân trang |
| Mô tả ngắn VI / EN | Mô tả website mặc định |
| Ảnh đại diện | Logo ở navigation; nếu không chọn ảnh, website dùng tên thương hiệu |
| Email liên hệ / Số điện thoại | Thông tin tại trang Liên hệ |
| Mạng xã hội | URL Zalo, Facebook, TikTok, Instagram, YouTube; để trống kênh không dùng |
| `favicon` | URL ảnh biểu tượng tab trình duyệt; có thể lấy bằng Copy URL trong Media Library |
| Nội dung chân trang | Phần chữ bổ sung ở footer |
| Google Analytics Measurement ID | Nhập ID dạng `G-...` nếu đã có property; để trống để không nạp Analytics |

Giữ slug `settings`, trạng thái **Đã xuất bản** và ngày đăng đã đến hạn. Sau khi sửa, bấm **Lưu nội dung**.

### Đổi nhãn menu và tiêu đề các khu vực

Trong **Cấu hình website**, mở **Nhãn & tiêu đề website** rồi chọn nhóm **Tiếng Việt** hoặc **English**. Các nhãn có thể đổi gồm dòng mở đầu Hero, tiêu đề dự án, dịch vụ, blog, báo chí, CTA chân trang và các chữ trên website.

Một số trường hiện dùng tên ngắn như `about`, `work`, `services`, `gallery`, `blog`, `press`, `contact`: chúng tương ứng với các nhãn Giới thiệu, Kinh nghiệm, Dịch vụ, Hình ảnh, Blog, Truyền thông, Liên hệ.

**Dòng chữ bên dưới Hero** dùng dấu `|` để tách các phần. Ví dụ:

```text
MC SỰ KIỆN|✳|VOICE TALENT|✳|SÁNG TẠO NỘI DUNG
```

**Ghi chú nội dung mẫu** là dòng thông báo ở footer. Chỉ thay hoặc bỏ thông báo minh họa khi đã thay nội dung mẫu bằng thông tin thật phù hợp.

### SEO cho từng bài / dự án / dịch vụ

Trong tab ngôn ngữ của nội dung, mở **SEO · VI** hoặc **SEO · EN**:

| Trường | Cách sử dụng |
| --- | --- |
| Meta title | Tiêu đề dùng cho metadata; để trống dùng tiêu đề nội dung |
| Meta description | Tóm tắt dành cho metadata; để trống dùng mô tả ngắn |
| OG image URL | Ảnh chia sẻ mạng xã hội; để trống dùng ảnh đại diện |
| Canonical URL | Chỉ nhập khi cần chỉ định địa chỉ chuẩn riêng; thông thường để trống |

Mỗi ngôn ngữ có SEO riêng. SEO mặc định toàn website nằm trong tab ngôn ngữ của **Cài đặt & SEO**. Sitemap tự lấy các bài, dự án và dịch vụ đã xuất bản đến hạn; bạn không cần nhập lại từng URL vào sitemap.

## 12. Xử lý liên hệ và booking

Chỉ ADMIN có quyền mở **Liên hệ / Booking** tại `/admin/contacts`.

1. Dùng ô **Tìm yêu cầu…** để tìm theo tên, email hoặc nội dung yêu cầu.
2. Chọn bộ lọc trạng thái rồi bấm **Lọc**.
3. Bấm dòng tên khách để mở chi tiết: email, điện thoại, công ty, địa điểm, ngày dự kiến và nội dung.
4. Cập nhật **Trạng thái**, nhập **Ghi chú nội bộ** nếu có.
5. Bấm **Lưu thay đổi**.

| Mã trạng thái | Ý nghĩa sử dụng |
| --- | --- |
| `NEW` — Mới | Yêu cầu vừa nhận, chưa xử lý |
| `PROCESSING` — Đang xử lý | Đang kiểm tra hoặc chuẩn bị phản hồi |
| `CONTACTED` — Đã liên hệ | Đã trao đổi với khách |
| `COMPLETED` — Hoàn thành | Đã xử lý xong yêu cầu |

Trạng thái và ghi chú không được tự gửi cho khách. Đây là thông tin quản lý nội bộ.

Dòng **Email notification** cho biết việc gửi email thông báo cho Admin:

- `NOT_CONFIGURED`: chưa cấu hình dịch vụ email; yêu cầu vẫn được lưu trong Admin.
- `SENT`: dịch vụ email đã chấp nhận yêu cầu gửi; không đồng nghĩa đã xác nhận thư vào hộp thư đến.
- `FAILED`: gửi thông báo lỗi; yêu cầu vẫn còn trong Admin để xử lý.

Hiện chưa có nút gửi lại email tự động. Nếu cần phản hồi khách, dùng email / điện thoại đã ghi trong yêu cầu. Bấm **Xóa** và xác nhận chỉ khi không cần giữ yêu cầu nữa; không có thùng rác để phục hồi.

## 13. Quản lý tài khoản

Chỉ ADMIN mở được **Tài khoản quản trị** tại `/admin/users`.

### Tạo tài khoản

1. Dùng biểu mẫu tạo mới; nếu đang sửa một tài khoản, bấm **Tạo mới** trước.
2. Nhập **Họ tên**, **Email** chưa được dùng và **Mật khẩu** có ít nhất 12 ký tự.
3. Chọn **EDITOR** hoặc **ADMIN** theo bảng quyền ở mục 2.
4. Giữ tích **Hoạt động** để tài khoản đăng nhập được.
5. Bấm **Lưu tài khoản**, rồi chuyển thông tin đăng nhập cho người dùng qua kênh riêng.

### Đổi mật khẩu, vai trò hoặc vô hiệu tài khoản

Bấm **Chỉnh sửa** bên cạnh tài khoản. Khi đổi thông tin:

- Để trống **Mật khẩu** để giữ mật khẩu hiện tại; nhập mật khẩu mới nếu muốn đổi.
- Đổi **Vai trò** để thay quyền truy cập.
- Bỏ tích **Hoạt động** để vô hiệu tài khoản, sau đó bấm lưu.

Không thể hạ quyền hoặc vô hiệu ADMIN hoạt động cuối cùng. Màn hình hiện không có chức năng xóa hẳn tài khoản, tự đăng ký hoặc khôi phục mật khẩu qua email; người dùng cần nhờ ADMIN đặt lại mật khẩu.

Thay `ADMIN_PASSWORD` trong `.env` không tự thay mật khẩu của tài khoản đã tồn tại. Hãy đổi trong **Tài khoản quản trị**.

## 14. Các lỗi thường gặp

| Hiện tượng | Cách kiểm tra / xử lý |
| --- | --- |
| Không mở được localhost | Nhờ người vận hành kiểm tra database và website đã chạy, đúng port; xem README |
| Email / mật khẩu không đúng hoặc tạm thời bị giới hạn | Kiểm tra tài khoản và trạng thái Hoạt động. Nếu đăng nhập quá nhiều lần trong thời gian ngắn, chờ khoảng 15 phút rồi thử lại |
| Thiếu menu hoặc bị từ chối truy cập | Kiểm tra tài khoản là ADMIN hay EDITOR; không phải mọi menu đều được cấp cho EDITOR |
| Vừa mở biểu mẫu nhưng chưa nhập được | Chờ biểu mẫu khởi tạo xong. Trong lúc đang lưu, các trường cũng tạm khóa; chờ thông báo kết quả |
| Slug đã tồn tại | Đổi slug khác trong cùng loại nội dung; có thể thêm năm hoặc tên sự kiện để phân biệt |
| Không lưu được nội dung | Kiểm tra tiêu đề VI, slug, URL bắt đầu bằng `https://` hoặc `http://`, năm và ngày đăng. Chờ thông báo thành công trước khi rời trang |
| Bài chưa có ngoài website | Kiểm tra đã lưu, trạng thái PUBLISHED và ngày đăng không ở tương lai; tải lại trang và bỏ các bộ lọc đang áp dụng |
| Dự án có ở Portfolio nhưng không có trên homepage | Kiểm tra Nổi bật trên trang chủ và Thứ tự; homepage chỉ lấy tối đa 4 dự án nổi bật |
| Trang English vẫn là tiếng Việt | Kiểm tra Tiêu đề EN đã nhập và đã lưu chưa; title EN trống sẽ dùng bản VI |
| English có tiêu đề nhưng thân bài trống | Nhập thêm nội dung EN; khi title EN đã có, hệ thống không tự lấy thân bài VI thay cho phần EN trống |
| Preview không có nội dung mới sửa | Bấm Lưu nội dung trước, sau đó tải lại tab preview |
| Upload báo chưa cấu hình Cloudinary | Nhờ người vận hành cấu hình dịch vụ theo README; Admin không có ô nhập API secret |
| Upload bị từ chối | Dùng JPG/PNG/WebP hợp lệ, tối đa 10 MB/ảnh và 20 ảnh/lần; kiểm tra kết nối và thông báo lỗi |
| Không xóa được ảnh / danh mục | Gỡ hoặc đổi các tham chiếu trong nội dung, lưu lại rồi thử xóa. Ảnh mẫu seed có thể được bảo vệ |
| Ảnh cũ vẫn còn sau khi bấm Gỡ | Cần Lưu nội dung sau khi gỡ; Gỡ không xóa file trong Media Library |
| Sửa alt/caption nhưng chưa lưu | Bấm ra ngoài ô nhập, chờ thông báo; nếu có lỗi, thử lại trước khi rời trang |
| Có booking nhưng không có email | Kiểm tra Email notification. Booking không phụ thuộc việc email đã gửi thành công; nhờ người vận hành kiểm tra dịch vụ email |

Nếu lỗi vẫn còn, gửi người vận hành đường dẫn màn hình, thời điểm xảy ra và nội dung thông báo. Không gửi mật khẩu hoặc toàn bộ tệp `.env`.

## 15. Checklist trước khi xuất bản

- [ ] Tiêu đề, nội dung, tên đối tác / khách hàng và thông tin sự kiện đã được kiểm tra.
- [ ] Ảnh đại diện và ảnh trong bài đúng nội dung, có alt text phù hợp.
- [ ] Slug đúng và các liên kết / video / audio hoạt động.
- [ ] Danh mục, tags, nội dung liên quan và thứ tự hiển thị phù hợp.
- [ ] Bản EN đầy đủ nếu đã nhập Tiêu đề EN; đã kiểm tra preview cần thiết.
- [ ] SEO của các ngôn ngữ đã được xem lại.
- [ ] Trạng thái và ngày đăng đúng ý định, theo giờ Việt Nam.
- [ ] Đã bấm Lưu nội dung và nhận thông báo thành công.
- [ ] Đã mở trang public để kiểm tra trên desktop và điện thoại.

Các hướng dẫn cấu hình database, Cloudinary, email và triển khai dành cho người vận hành nằm trong [README](../README.md). Phạm vi kiểm thử và giới hạn hiện có được ghi trong [báo cáo nghiệm thu](VERIFICATION.md).
