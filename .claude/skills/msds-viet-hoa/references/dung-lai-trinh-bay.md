# Dựng lại trình bày cho MSDS bị vỡ bố cục

Dùng khi file Word là PDF chuyển sang Word (nhiều section, nhiều text box) và chữ nằm lộn xộn. Cách đã làm cho 3 MSDS PPG ngày 03/10/2026:

1. **Trích chữ theo thứ tự thân văn bản**, bỏ `mc:Fallback` để khỏi trùng chữ text box (`dump_docx_text.py` trong thư mục này làm đúng việc đó).
2. **Soi bản render PDF** để ghép đúng nhãn với giá trị. Render bằng Word COM `SaveAs2 FileFormat=17`, đọc ảnh bằng PyMuPDF. Máy không có LibreOffice/pdftoppm.
3. **Dựng lại bằng docx-js** (gói `docx` của Node):
   - tiêu đề mục: nền xanh nhạt;
   - cặp "nhãn : giá trị": bảng ẩn viền;
   - bảng số liệu: có viền;
   - header mỗi trang: Mã SP / Ngày phát hành / Phiên bản / Tên SP; footer "Trang X/Y";
   - hình đồ GHS (ngọn lửa, chấm than…) là hình vector trong file gốc → cắt ảnh từ bản render.
4. **Đối chiếu đếm từ** với file gốc để chắc không thiếu chữ.

Các script dựng cũ (`build_c.js`, `build_p.js`) nằm trong thư mục tạm của phiên làm trước và có thể đã mất, nên viết lại theo các bước trên thay vì tìm chúng.
