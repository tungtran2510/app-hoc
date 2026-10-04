# CẨM NANG HOẠT ĐỘNG AI AGENT (GEMINI.md) - APP HỌC CƠ THỂ V2 (GIAO DIỆN MỚI)
> **Tài liệu nạp tự động cho AI Agent khi mở thư mục `d:\app-hoc-co-the-v2`**

## 1. NGUYÊN TẮC CỐT LÕI
1. **Dự án độc lập 100% (Không gian sáng tạo Giao diện mới V2):** Thư mục này (`d:\app-hoc-co-the-v2`) được nhân bản riêng để phát triển các mẫu giao diện mới (cả Desktop & Mobile), cách ly hoàn toàn khỏi bản gốc đang chạy `d:\app-hoc-co-the`.
2. **Bảo vệ dữ liệu người dùng:** Dùng chung dữ liệu Supabase Database (`evuhamqlzprrbuabxyyn`) nhưng tuyệt đối không xóa, không phá vỡ cấu trúc CSDL hiện tại.
3. **Thỏa sức thiết kế Giao diện mới:** Được phép thiết kế lại trang chủ, trang bài học, phối màu, typography, thẻ bài học hiện đại theo yêu cầu của người dùng.
4. **Tham khảo chi tiết:** Đọc file `PROJECT_BRAIN.md` trong thư mục gốc để nắm rõ kiến trúc toàn hệ thống.

## 2. QUY TRÌNH TRIỂN KHAI CHUẨN
- Kiểm tra biên dịch: `cmd.exe /c npx tsc --noEmit`
- Kiểm tra build: `cmd.exe /c npm run build`

