# Bộ sửa bôi đỏ chuẩn cho MSDS PPG

Bộ sửa này dùng khi người dùng yêu cầu áp "bộ sửa bôi đỏ" cho MSDS của PPG. Màu đỏ `EE0000` đánh dấu chỗ đã chỉnh so với MSDS gốc.

**Cách dùng:** chép NGUYÊN VĂN các khối dưới, giữ màu đỏ. Chỉ đổi phần riêng của từng sản phẩm (số UN, tên vận chuyển, nhóm, PG, phân loại ở XV mục 2, hình đồ) theo đúng MSDS gốc của sản phẩm đó. Không tự suy diễn. Thông tin nhà nhập khẩu, người ký do người dùng cung cấp cho từng lô; không dùng lại thông tin của lô trước.

> Quy tắc chung cho mọi MSDS (tiêu đề 16 mục, "Cấp" thay "Loại", ngày phát hành = ngày tạo GMT+7, mục XV chỉ giữ nội dung đỏ) nằm ở SKILL.md, quy tắc 4.

## Các chỗ bôi đỏ (nguyên văn)

1. Tiêu đề trang 1: **PHIẾU AN TOÀN HÓA CHẤT**
2. Mục I: nhãn "Tên sản phẩm" đổi thành **Tên thương mại**
3. Mục I, thay khối nhà cung cấp/khẩn cấp bằng 3 dòng:
   - **Thông tin chi tiết về nhà xuất khẩu**: PPG INDUSTRIES (SINGAPORE) PTE LTD / 8 SELETAR AEROSPACE AVENUE SINGAPORE 797403 / TEL: +65 69827675 / 69827676 / 69827679
   - **Thông tin chi tiết về nhà nhập khẩu**: <tên / địa chỉ / ĐT do người dùng cung cấp>
   - **Thông tin liên hệ trong trường hợp khẩn cấp**: (y hệt khối nhà nhập khẩu)
4. Mục XIV: tiêu đề **"XIV. Thông tin khi vận chuyển"**; thay toàn bộ bằng bảng 7 cột: Tên quy định | Số UN | Tên vận chuyển đường biển | Loại nhóm hàng nguy hiểm | Quy cách đóng gói | Nhãn vận chuyển | Thông tin bổ sung
   - Hàng 1: "Quy định về vận chuyển hàng nguy hiểm của việt Nam:" + "- Nghị định số 161/2024/NĐ-CP ngày 18/12/2024 của Chính phủ quy đinh danh mục hàng nguy hiểm, vận chuyển hàng nguy hiểm bằng phương tiện giao thông cơ giới đường bộ;" + "- Nghị định số 34/2024/NĐ-CP ngày 31/03/2024 của Chính phủ quy định danh mục hàng hóa nguy hiểm, vận chuyển hàng hóa nguy hiểm bằng phương tiện giao thông cơ giới đường bộ và phương tiện thủy nội địa" | UN1263 | PAINT | Nhóm 3 | III | [hình đồ] | "Kiểm tra thùng chứa không rò rỉ, ăn mòn, hư hỏng. Tránh va đập, xếp chồng gây sụp đổ, Phải tuân thủ quy định về vận tải hàng nguy hiểm bằng đường bộ/nội địa"
   - Hàng 2: "Quy đinh về vận chuyển hàng nguy hiểm quốc tế của EU,USA..." | UN1263 | PAINT | Class 3 | III | [hình đồ] | (trống)
   - Giữ lại (đen) sau bảng: Thông tin bổ sung/UN, Các biện pháp đề phòng đặc biệt cho người dùng, Vận chuyển số lượng lớn theo các công cụ IMO
   - Giá trị UN1263 / PAINT / Nhóm 3 / III là của dòng PPG đã làm; luôn đối chiếu với mục 14 của MSDS gốc.
5. Mục XV: ô "Các quy định riêng về an toàn, y tế và môi trường cho sản phẩm" thay bằng:
   1. Tình trạng khai báo, đăng ký ở quốc gia khu vực trên thế giới (liệt kê các danh mục quốc gia đã tiến hành khai báo, tình trạng khai báo): Sản phẩm được phân loại nguy hiểm theo Hệ thống hài hòa toàn cầu về phân loại và ghi nhãn hóa chất (GHS)
   2. Phân loại nguy hiểm theo quốc gia, đăng ký: 3-Chất lỏng dễ cháy / - Quy chuẩn Việt Nam: QCVN 05:2020/BCT
   3. Quy chuẩn kỹ thuật tuân thủ, gồm 11 gạch đầu dòng. Câu chữ đầy đủ đã có sẵn trong form mẫu `assets/Form-mau-Template.docx`, mục XV, khoản 3 (copy nguyên văn từ đó): Luật Hóa chất 69/2025/QH15; NĐ 24/2026/NĐ-CP; NĐ 25/2026/NĐ-CP; NĐ 26/2026/NĐ-CP; NĐ 28/2026/NĐ–CP (chất ma túy và tiền chất, có trong bản 801A của Long, không có trong form mẫu: lấy từ file 801A); TT 01/2026/TT-BCT; TT 02/2026/TT-BCT; NĐ 43/2017/NĐ-CP + NĐ 111/2021/NĐ-CP; QCVN 05:2020/BCT – TT 48/2020/TT-BCT; NĐ 34/2024/NĐ-CP + NĐ 161/2024/NĐ-CP; "- Các văn bản pháp luật hiện hành liên quan khác."
6. Mục XVI: tiêu đề đỏ theo quy tắc 4 của SKILL.md.
7. Cuối file, khối ký bên phải (Times New Roman, đỏ): tên công ty nhập khẩu, khoảng trống ký, rồi tên người ký **nếu người dùng cung cấp**; không bịa.

## Font
Phần thân dùng Times New Roman (header/footer Arial).

## Lỗi hay gặp khi dùng file mẫu cũ (đừng chép theo)
- Mục VII từng ghi sai "tia la"; MSDS gốc của PPG là "tia lửa".
- Khi trích chữ để so, CO₂ có thể hiện thành CO2 vì số 2 là chỉ số dưới. Đó không phải lỗi.
