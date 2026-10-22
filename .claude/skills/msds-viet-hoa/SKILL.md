---
name: msds-viet-hoa
description: Soạn Phiếu an toàn hóa chất (MSDS/SDS) tiếng Việt từ MSDS gốc (PDF/Word tiếng Anh hoặc ngôn ngữ khác) theo form mẫu Phụ lục I Thông tư 01/2026/TT-BCT của UNI, và dựng lại trình bày/áp các chỗ bôi đỏ cho MSDS đã dịch. Dùng skill này bất cứ khi nào người dùng nhắc MSDS, SDS, phiếu an toàn hóa chất, "dịch MSDS", "làm MSDS tiếng Việt", "điền form mẫu MSDS", "trình bày lại MSDS", "sửa bôi đỏ MSDS", hoặc đưa file SDS của PPG, Chuan Mao, Kester, Amphenol… kể cả khi họ không gọi tên skill.
---

# MSDS tiếng Việt (UNI)

Quy trình: đọc MSDS gốc → dịch sang tiếng Việt → điền vào form mẫu → xuất `.docx`.
Phiếu này nộp cho cơ quan quản lý và khách hàng, nên sai một con số hay một mã H-code là sai hồ sơ. Vì vậy quy tắc quan trọng nhất là **chỉ dùng thông tin có trong file gốc**.

## Việc cần làm trước khi bắt đầu

1. Xác định **MSDS gốc** (file người dùng đưa). Đọc toàn bộ, kể cả bảng thành phần, mục vận chuyển và mục pháp luật.
2. Mở **form mẫu** `assets/Form-mau-Template.docx` (đi kèm skill). Nếu người dùng có form mẫu mới hơn thì dùng bản của họ.
3. Hỏi người dùng những thông tin mà MSDS gốc không có và form mẫu bắt buộc: **nhà nhập khẩu** (tên, địa chỉ, ĐT), **nhà xuất khẩu** (tên, địa chỉ, ĐT). Mục "liên hệ khẩn cấp" trùng với nhà nhập khẩu. Đừng tự đoán.
4. Hỏi xem có phải khách Chuan Mao / lô PPG không. Nếu có, đọc thêm `references/chuan-mao-bo-sua-boi-do.md`.

## Quy tắc bắt buộc

**1. Giữ nguyên cấu trúc form mẫu** (trừ những điểm đã chốt ở quy tắc 4). Form mẫu đã có sẵn bảng, tiêu đề và nhiều nội dung cố định (toàn bộ Mục XV pháp luật, cấu trúc bảng 7 cột của Mục XIV). Không đổi, không dựng lại. Chỉ điền vào các ô có ký hiệu `<...>` hoặc `<theo MSDS gốc>`. Lý do: form mẫu là bản đã được duyệt, tự sửa cấu trúc từng làm hỏng hồ sơ trước đây.

**2. Thông tin phải đúng từ file gốc.**
- Không suy diễn, không bịa, không lấy thêm từ internet hay kiến thức GHS chung.
- File gốc không có thông tin → ghi `-` (không ghi "Không có" hay "Không có thông tin").
- File gốc chỉ có mô tả mà không có mã P-code → dịch nguyên văn mô tả, **không tự gán** mã P-code. Tương tự với H-code, số EC, công thức hóa học.
- Số liệu (điểm chớp cháy, điểm sôi, tỷ trọng, LD50…) lấy đúng số trong file gốc, giữ đơn vị.

Lý do: ở lần làm Kester 951, Claude tự gán P-code, H-code, EC, công thức không có trong nguồn, và tự dựng lại Mục XIV/XV. Cả hai đều sai.

**3. Tiếng Việt đầy đủ dấu**, thuật ngữ hóa học dùng cách gọi thông dụng tại Việt Nam (etyl benzen, xylen…). Mỗi đoạn thông tin xuống dòng riêng khi form mẫu ghi "mỗi đoạn thông tin cần xuống dòng".

**4. Tên 16 mục, thuật ngữ "Cấp", ngày phát hành** (Long chốt 22/10/2026, ưu tiên hơn tiêu đề của MSDS gốc và hơn mọi quy tắc cũ bên dưới):
- Tiêu đề 16 mục luôn đặt cố định như sau (không theo PDF gốc), viết hoa chữ đầu, bôi đỏ phần tiêu đề:
  I Nhận dạng hóa chất và thông tin về nhà cung cấp · II Nhận dạng đặc tính nguy hiểm của hóa chất · III Thông tin về thành phần các chất · IV Biện pháp sơ cứu về y tế · V Biện pháp xử lý khi có hỏa hoạn · VI Biện pháp phòng ngừa, ứng phó khi có sự cố · VII Yêu cầu về sử dụng, bảo quản · VIII Kiểm soát phơi nhiễm/yêu cầu về thiết bị bảo vệ cá nhân · IX Đặc tính lý, hóa của hóa chất · X Mức ổn định và phản ứng của hóa chất · XI Thông tin về độc tính · XII Thông tin về sinh thái · XIII Thông tin về thải bỏ · XIV Thông tin khi vận chuyển · XV Thông tin về pháp luật · XVI Các thông tin cần thiết khác, bao gồm các thông tin khi xây dựng và hiệu đính Phiếu an toàn hóa chất.
- Phân loại nguy hiểm ở mục II và XI: đổi "Loại" thành "Cấp" (ví dụ "Loại 1" → "Cấp 1", cột "Loại" của bảng độc tính → "Cấp"). Không đổi các chữ "Loại" khác như "Loại sản phẩm".
- Mục XV chỉ gồm nội dung bôi đỏ chuẩn (xem `references/chuan-mao-bo-sua-boi-do.md`). Xóa hết nội dung của nguồn: bảng Thông tư 05/1999/TT-BYT, Nghị định thư Montreal, Hiệp ước Stockholm.
- Ngày phát hành/hiệu chỉnh (đầu trang 1, khung đầu các trang sau và mục XVI) = **ngày tạo bản Việt theo giờ GMT+7**, viết "22 tháng 10 năm 2026" (chữ "tháng" viết thường), bôi đỏ. Hàm `ngayHomNay()` trong `scripts/lib.js` tự lấy. Các mục còn lại của XVI (ngày lần trước, phiên bản, "Chuẩn bị bởi: EHS", "do PPG cung cấp") giữ nguyên theo MSDS gốc. Khối ký cuối file đổi thành công ty nhập khẩu (bôi đỏ). Không bịa tên người ký: nếu người dùng không đưa, để trống và báo lại.

## Cách tạo file

- Công cụ: Node.js gói `docx` (trên máy Long: `require('C:/Users/long1/AppData/Roaming/npm/node_modules/docx')`) hoặc thao tác trực tiếp trên bản sao của form mẫu. Bản Word xuất ra phải mở được bình thường trong Word.
- Để lấy chữ từ một file .docx (form mẫu, bản đã sửa, file gốc dạng Word) dùng `python -I -X utf8 references/dump_docx_text.py <file.docx>`; chỗ bôi đỏ `EE0000` được đánh dấu `[R]`. Script bỏ phần `mc:Fallback` để không bị trùng chữ trong text box.
- Đọc PDF scan hoặc PDF dài: dùng PyMuPDF. Máy này không có LibreOffice/pdftoppm; muốn render Word ra PDF thì dùng Word COM `SaveAs2 FileFormat=17`.

## Khi MSDS gốc là PDF không có lớp chữ

Nhiều PDF của PPG (xuất từ Illustrator) có chữ đã chuyển thành đường nét: PyMuPDF trả về 0 ký tự và máy không có OCR. Cách làm đã chạy được (MSDS PPG6105-304B, 15 trang):
1. Render từng trang ra ảnh (`page.get_pixmap(dpi=110)`) và đọc bằng công cụ Read.
2. **Với bảng và số liệu, render lại vùng đó ở dpi 170 trở lên** (`clip=fitz.Rect(...)`) và đọc lại. Ở dpi 110 đã đọc nhầm "nguy hiểm/nguy hại", "vào đường cống/vào cống", "thẩm thấu/thấm thấu"; những chữ nhỏ như thế rất dễ sai mà không tự phát hiện.
3. Nhiều đoạn văn chuẩn của PPG giống hệt giữa các MSDS (mục V–VIII, X, XIII). Sau khi gõ, dùng `difflib` so với một bản đã dựng xong (ví dụ file 801A "(trinh bay lai)") để bắt chỗ gõ lệch; chỗ nào khác thì đối chiếu lại với ảnh nguồn, đừng mặc định bản nào đúng.
4. Nguồn khác nhau có thể dùng từ khác nhau (Loại/Cấp, số phần trăm, ngày tháng). Luôn theo ảnh của MSDS đang làm.

## Dựng file bằng script có sẵn

`scripts/` chứa bộ dựng đã chạy được trên PPG6105-304B: `lib.js` (hàm `heading`, `sub`, `kv` nhãn:giá trị, `tbl` bảng có viền, ảnh hình đồ), `build.js` (header trang 1 có logo, header các trang sau, footer "Trang X/Y", khổ A4, Times New Roman) và hai file mẫu nội dung `example_body1.js` (mục I–VIII), `example_body2.js` (mục IX–XVI). Cách dùng: sao hai file mẫu thành body cho MSDS mới, thay nội dung theo ảnh nguồn, rồi `node build.js <đầu ra.docx> ./body1 ./body2`. Sửa các hằng `MA`, `TEN`, `NGAY`, `PB` đầu `build.js`. Hình đồ GHS và logo PPG nằm ở `assets/img/` (image2 ngọn lửa, image3 ăn mòn, image4 nguy hại sức khỏe, image5 chấm than, image1 logo PPG, image6 biểu tượng "thông tin đã thay đổi"). Render sang PDF để xem bằng Word COM như đã nêu ở trên.

Các quyết định đã áp dụng khi dựng bản 6105 theo mẫu 801A (làm tương tự trừ khi người dùng nói khác):
- Tiêu đề mục: theo quy tắc 4 (cố định, đỏ).
- Mục I: bỏ khối "nhà cung cấp" và "số điện thoại khẩn cấp" của nguồn (PPG Việt Nam, CHEMTREC), thay bằng 3 khối nhà xuất khẩu / nhà nhập khẩu / khẩn cấp do người dùng cung cấp, bôi đỏ, đặt theo thứ tự đó.
- Mục XIV: thay bảng UN/IMDG/IATA của nguồn bằng bảng 7 cột; thông tin môi trường và chất gây ô nhiễm biển của nguồn được giữ lại (đen) dưới phần "Thông tin bổ sung" để không mất dữ liệu.
- Mục XV: chỉ giữ nội dung bôi đỏ chuẩn; xóa bảng BYT, Montreal, Stockholm của nguồn (Long chốt 22/10/2026).

## Sau khi điền xong, tự kiểm

- Còn sót ký hiệu `<...>` nào không? (tìm `<theo`, `<Claude`, `<Để`).
- Đếm đối chiếu: mọi số liệu, tên chất, số CAS trong bản Việt đều tìm thấy trong file gốc.
- Mục XIV: số UN, tên vận chuyển, nhóm, PG khớp mục 14 của file gốc.
- Không có P/H-code nào không xuất hiện ở file gốc.
- Báo cáo cho người dùng: liệt kê những ô ghi `-` vì file gốc không có, và những chỗ phải hỏi lại. Đừng nói "đã kiểm hết" nếu chưa đối chiếu thật.

## Dựng lại trình bày (khi file Word bị vỡ bố cục)

Khi file Word được chuyển từ PDF (nhiều section, text box) và vỡ trình bày, đọc `references/dung-lai-trinh-bay.md`.

## Bôi đỏ

Bôi đỏ (`EE0000`) là cách Long đánh dấu những chỗ **đã chỉnh so với MSDS gốc** để khách/đồng nghiệp rà. Bôi đỏ khi người dùng yêu cầu, khi áp bộ sửa Chuan Mao, hoặc khi thay thông tin theo yêu cầu của người dùng (nhà xuất khẩu, nhà nhập khẩu, khẩn cấp, khối ký) như ở các bản đã giao. Nội dung bộ sửa nằm ở `references/chuan-mao-bo-sua-boi-do.md`. Chỗ nào ghi "hỏi Long" thì hỏi, không tự quyết.
