// Mục I – VIII (nội dung theo PDF gốc SDS-PPG6105-304B_VN-VN.pdf)
const L = require('./lib');
const { heading, sub, kv, tbl, para, gap, pic, RED, D } = L;
const { Paragraph, Table, TableRow, TableCell, WidthType, TableLayoutType } = D;

const B = [];
const add = (...x) => B.push(...x);

// ---------- I ----------
add(heading('I.', 'Nhận dạng hóa chất và thông tin về nhà cung cấp', true));
add(kv('Mã sản phẩm', 'PPG6105-304B/200K-T'));
add(kv('Tên thương mại', 'PPG6105-304B', { red: true }));
add(kv('Số CAS', 'Không áp dụng.'));
add(kv('Số đăng ký EC', 'Hỗn hợp.'));
add(kv('Loại sản phẩm', 'Chất lỏng.'));
add(sub('Hoạt động sử dụng đã được xác định có liên quan của chất hoặc hỗn hợp và hoạt động sử dụng được khuyên nên tránh'));
add(kv('Ứng dụng sản phẩm', ['Phủ.', 'Ứng dụng công nghiệp.']));
add(kv('Các mục đích sử dụng không được khuyến cáo', 'Sản phẩm không có ý định, dán nhãn hoặc đóng gói để sử dụng cho người tiêu dùng.'));
add(gap(80));
add(kv('Thông tin chi tiết về nhà xuất khẩu', [
  { t: 'PPG INDUSTRIES (SINGAPORE) PTE LTD', b: true },
  '8 SELETAR AEROSPACE AVENUE SINGAPORE 797403',
  'TEL: +65 69827675 / 69827676 / 69827679',
], { red: true }));
add(gap(80));
const imp = [
  { t: '<TÊN CÔNG TY NHẬP KHẨU>', b: true },
  'Địa chỉ: <địa chỉ nhà nhập khẩu>',
  'Tel: <số điện thoại>',
];
add(kv('Thông tin chi tiết về nhà nhập khẩu', imp, { red: true }));
add(gap(80));
add(kv('Thông tin liên hệ trong trường hợp khẩn cấp', imp, { red: true }));

// ---------- II ----------
add(heading('II.', 'Nhận dạng đặc tính nguy hiểm của hóa chất', true));
add(kv('Mức xếp loại nguy hiểm', [
  'CHẤT LỎNG DỄ CHÁY - Cấp 3',
  'ĐỘC TÍNH CẤP (đường miệng) - Cấp 5',
  'GÂY KHÓ CHỊU CHO DA - Cấp 2',
  'KÍCH ỨNG MẮT - Cấp 2A',
  'NHẠY DA - Cấp 1',
  'ĐỘC TÍNH HỆ THỐNG/CƠ QUAN MỤC TIÊU CỤ THỂ - TIẾP XÚC 1 LẦN (Các tác dụng gây mê) - Cấp 3',
  'ĐỘC TÍNH HỆ THỐNG/CƠ QUAN MỤC TIÊU CỤ THỂ - TIẾP XÚC LẶP LẠI - Cấp 2',
  'ĐỘC TÍNH VỚI MÔI TRƯỜNG NƯỚC (CẤP) - Cấp 3',
  'ĐỘC TÍNH VỚI MÔI TRƯỜNG NƯỚC (LÂU DÀI) - Cấp 3',
  'Tỷ lệ phần trăm hỗn hợp chứa (các) thành phần độc tố cấp tính không xác định qua đường miệng: 44.8%',
  'Tỷ lệ phần trăm (các) hợp phần các chất nguy hại cho môi trường nước trong hỗn hợp: 50.7%',
]));
add(sub('Các thành phần cơ bản của nhãn GHS (Hệ Thống Hợp Tác Toàn Cầu Về Phân Loại Và Ghi Nhãn Hóa Chất)'));
{
  const W0 = 2900, C0 = 260;
  add(new Table({
    width: { size: L.W, type: WidthType.DXA }, columnWidths: [W0, C0, L.W - W0 - C0], layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: [
      L.cell([para({ t: 'Hình đồ cảnh báo', b: true, c: L.BLUE })], W0, { raw: true }),
      L.cell([para({ t: ':', b: true, c: L.BLUE })], C0, { raw: true }),
      L.cell([new Paragraph({ spacing: { before: 40, after: 40 }, children: [
        pic('image2.png', 56, 56), L.run('  '), pic('image4.png', 56, 56), L.run('  '), pic('image5.png', 56, 56),
      ] })], L.W - W0 - C0, { raw: true }),
    ] })],
  }));
}
add(kv('Từ cảnh báo', 'Cảnh báo'));
add(kv('Cảnh báo nguy cơ', [
  'Hơi và chất lỏng dễ cháy.',
  'Có thể có hại nếu nuốt phải.',
  'Gây kích ứng da.',
  'Có thể gây ra một phản ứng dị ứng da.',
  'Gây kích ứng mắt nghiêm trọng.',
  'Có thể gây uể oải hoặc chóng mặt.',
  'Có thể làm tổn thương các cơ quan qua phơi nhiễm lâu và nhiều lần. (phổi)',
  'Có hại đối với sinh vật thủy sinh với ảnh hưởng kéo dài.',
]));
add(sub('Các công bố về phòng ngừa'));
add(kv('Ngăn chặn', 'Đeo găng tay, quần áo bảo hộ và đồ bảo vệ mắt hoặc mặt nạ. Tránh xa nguồn nhiệt, bề mặt nóng, tia lửa, ngọn lửa trần và các nguồn gây cháy khác. Cấm hút thuốc. Chỉ sử dụng ngoài trời hoặc trong khu vực thoáng khí. Tránh thải ra môi trường. Không hít thở hơi. Rửa sạch sau khi sử dụng. Không mang quần áo bị nhiễm bẩn ra khỏi nơi làm việc.', { ind: 140 }));
add(kv('Phản ứng', 'NẾU HÍT PHẢI: Chuyển nạn nhân đến khu vực không khí trong lành và giữ nạn nhân ở tư thế dễ hô hấp. Gọi TRUNG TÂM CHỐNG ĐỘC hoặc bác sĩ nếu cảm thấy không khỏe. NẾU NUỐT PHẢI: Gọi TRUNG TÂM CHỐNG ĐỘC hoặc bác sĩ nếu cảm thấy không khỏe. NẾU TIẾP XÚC VỚI DA (hoặc tóc): Ngay lập tức cởi bỏ quần áo bị nhiễm bẩn. Rửa sạch da bằng nước. Nếu xảy ra kích ứng da hoặc phát ban: Hỏi ý kiến tư vấn y tế. NẾU VÀO MẮT: Rửa sạch một cách thận trọng bằng nước trong vài phút. Loại bỏ kính áp tròng, nếu có và dễ thực hiện. Tiếp tục rửa. Nếu vẫn còn kích ứng mắt: Hỏi ý kiến tư vấn y tế hoặc chăm sóc y tế.', { ind: 140 }));
add(kv('Lưu trữ', 'Lưu trữ có khóa chặt. Lưu trữ trong môi trường thoáng khí. Giữ bao bì kín.', { ind: 140 }));
add(kv('Xử lý', 'Xả bỏ chất thải và bao bì theo tất cả các quy định của địa phương, khu vực, quốc gia và quốc tế.', { ind: 140 }));
add(gap(60));
add(kv('Lộ trình vào', 'Không có sẵn.'));
add(kv('Các hiểm họa khác không cần phải được phân loại', 'Việc tiếp xúc lâu dài hoặc lặp đi lặp lại có thể làm khô da và gây kích ứng khó chịu. Có chứa chất có thể phát ra formaldehyde nếu được bảo quản quá thời hạn sử dụng và / hoặc trong quá trình bảo dưỡng ở nhiệt độ cao hơn 60C / 140F.'));

// ---------- III ----------
add(heading('III.', 'Thông tin về thành phần các chất', true));
add(kv('Chất/pha chế', 'Hỗn hợp'));
add(sub('Số đăng ký CAS (Dịch Vụ Thông Tin Cơ Bản Hóa Chất Của Hoa Kỳ)/ các mã số khác'));
add(kv('Số CAS', 'Không áp dụng.', { ind: 140 }));
add(kv('Số đăng ký EC', 'Hỗn hợp.', { ind: 140 }));
add(tbl([4300, 1750, 2100, 1772], ['Tên thành phần nguy hiểm', 'Số CAS', 'Công thức hóa học', '%'], [
  ['Solvent naphtha (petroleum), heavy aromatic', '64742-94-5', '-', '≤14'],
  ['Glutaric acid, dimethyl ester', '1119-40-0', 'C7H12O4', '≤10'],
  ['Polymer of m-cresol / p-cresol / formaldehyde', '27029-76-1', '(C7H8O.C7H8O.CH2O)x', '≤5'],
  ['Solvent naphtha (petroleum), light aromatic', '64742-95-6', '-', '≤4.8'],
  ['1,2,4-Trimethylbenzene', '95-63-6', 'C9H12', '≤4.9'],
  ['Formaldehyde, polymer with 6-phenyl-1,3,5-triazine-2,4-diamine, ethylated methylated', '68037-08-1', '-', '≤5'],
  ['Benzene, trimethyl-', '25551-13-7', 'C9-H12', '≤3'],
  ['n-butanol', '71-36-3', 'C4H10O', '≤2.9'],
  ['etyl benzen', '100-41-4', 'C8H10', '≤3'],
  ['Cyclohexane, 5-isocyanato-1-(isocyanatomethyl)-1,3,3-trimethyl-, homopolymer, caprolactam-blocked', '127184-53-6', 'CHON', '≤3'],
  ['Xylene', '1330-20-7', 'C8-H10', '≤2'],
  ['Dimethyl succinate', '106-65-0', 'C6H10O4', '≤3'],
  ['diisobutyl keton', '108-83-8', 'C9H18O', '≤2.7'],
  ['Dimethyl adipate', '627-93-0', 'C8H14O4', '≤3'],
  ['1-metoxy-2-propanol', '107-98-2', 'C4H10O2', '≤3'],
]));
add(gap(60));
add(para({ t: 'Với hiểu biết hiện tại của nhà cung cấp và ở mức độ cô đặc áp dụng, không có thành phần nào bị phân loại là độc hại với sức khỏe và môi trường cần phải báo cáo trong phần này.', b: true }));
add(para({ t: 'Mã SUB đại diện cho những chất mà không có số CAS được đăng ký.', b: true }));
add(para({ t: 'Giới hạn phơi nhiễm nghề nghiệp, nếu có, được liệt kê ở phần 8.', b: true }));

// ---------- IV ----------
add(heading('IV.', 'Biện pháp sơ cứu về y tế', true));
add(sub('Mô tả các biện pháp sơ cứu cần thiết'));
add(kv('Tiếp xúc mắt', 'Kiểm tra và tháo bỏ kính sát tròng. Ngay lập tức rửa mắt bằng dòng nước trong ít nhất 15 phút, mở to mắt khi rửa. Tìm hỗ trợ y tế ngay.', { ind: 140 }));
add(kv('Hít phải', 'Đưa ra ngoài chỗ thoáng khí. Giữ nạn nhân trong tình trạng ấm và thoải mái. Nếu ngưng thở, thở không đều hay có hiện tượng bị suy giảm hô hấp, làm hô hấp nhân tạo hay cho thở oxy thực hiện bởi nhân viên có huấn luyện.', { ind: 140 }));
add(kv('Tiếp xúc ngoài da', 'Cởi quần áo và giày dép dính chất độc. Rửa sạch da bằng xà phòng và nước hoặc dùng những chất rửa da đã được công nhận. Đừng sử dụng dung môi hay chất pha loãng.', { ind: 140 }));
add(kv('Nuốt phải', 'Nếu nuốt phải, tìm tư vấn y tế ngay và đưa cho thấy bình đựng chất hay nhãn hiệu này. Giữ nạn nhân trong tình trạng ấm và thoải mái. KHÔNG cố tạo cho nôn mửa.', { ind: 140 }));
add(sub('Các triệu chứng/tác dụng quan trọng nhất, cấp tính và chậm'));
add(sub('Tác động sức khỏe cấp tính tiềm ẩn', 1));
add(kv('Tiếp xúc mắt', 'Gây kích ứng mắt nghiêm trọng.', { ind: 280 }));
add(kv('Hít phải', 'Có thể gây suy nhược hệ thống thần kinh trung ương (CNS). Có thể gây uể oải hoặc chóng mặt.', { ind: 280 }));
add(kv('Tiếp xúc ngoài da', 'Gây kích ứng da. Lấy mỡ trong da. Có thể gây ra một phản ứng dị ứng da.', { ind: 280 }));
add(kv('Nuốt phải', 'Có thể có hại nếu nuốt phải. Có thể gây suy nhược hệ thống thần kinh trung ương (CNS).', { ind: 280 }));
add(sub('Dấu hiệu/triệu chứng phơi nhiễm quá mức', 1));
const adv = 'Các triệu chứng bất lợi có thể bao gồm những điều sau đây:';
add(kv('Tiếp xúc mắt', [adv, 'đau nhức hoặc kích ứng khó chịu', 'chảy nước mắt', 'bị đỏ'], { ind: 280 }));
add(kv('Hít phải', [adv, 'buồn nôn hay nôn mửa', 'đau đầu', 'buồn ngủ/mệt mỏi', 'chóng mặt/hoa mắt', 'bất tỉnh'], { ind: 280 }));
add(kv('Tiếp xúc ngoài da', [adv, 'kích ứng khó chịu', 'bị đỏ', 'khô da', 'nứt da'], { ind: 280 }));
add(kv('Nuốt phải', 'Không có thông tin cụ thể gì.', { ind: 280 }));
add(sub('Thể hiện sự cần thiết phải được y bác sĩ chăm sóc ngay lập tức và được điều trị đặc biệt, nếu cần'));
add(kv('Lưu ý đối với bác sĩ điều trị', 'Nếu hít phải sản phẩm phân hủy trong đám cháy, triệu chứng có thể xuất hiện muộn. Người bị phơi nhiễm cần được theo dõi y tế trong 48 giờ.', { ind: 140 }));
add(kv('Điều trị cụ thể', 'Không đòi hỏi điều trị đặc biệt.', { ind: 140 }));
add(kv('Bảo vệ nhân viên sơ cứu', 'Không nên đưa ra hành động nào nếu có thể gây nguy hại cho cá nhân hoặc nếu chưa được huấn luyện thích đáng. Nếu nghi ngờ khói vẫn còn, người cứu hộ phải mang mặt nạ thích hợp hay máy thở tự hành. Có thể nguy hiểm cho người đến cấp cứu nếu người này dùng cách thổi vô miệng để hồi sinh. Dùng nước giặt thật sạch quần áo dính chất độc trước khi cởi ra hoặc mang bao tay.', { ind: 140 }));
add(gap(60));
add(para({ t: 'Xem thông tin độc tính (phần 11)', b: true }));

// ---------- V ----------
add(heading('V.', 'Biện pháp xử lý khi có hỏa hoạn', true));
add(sub('Phương tiện dập tắt'));
add(kv('Các chất chữa cháy phù hợp', [['Dùng hóa chất khô, CO', { t: '2', sub: true }, ', bụi nước hay bọt.']], { ind: 140 }));
add(kv('Các chất chữa cháy không phù hợp', 'Đừng dùng tia nước.', { ind: 140 }));
add(gap(60));
add(kv('Các hiểm họa đặc trưng phát sinh từ hóa chất', 'Hơi và chất lỏng dễ cháy. Để chảy ra đường cống có thể gây ra đám cháy hoặc tiếng nổ. Khi cháy hoặc khi quá nóng, áp suất sẽ tăng và đồ chứa có thể trào ra, và sau đó có thể phát nổ. Vật liệu này có hại cho thủy sinh vật với các tác dụng lâu dài. Nước chữa cháy bị ô nhiễm với chất này phải được khống chế và ngăn không cho đổ ra nguồn nước, cống rãnh.'));
add(kv('Sản phẩm phân rã do nhiệt nguy hiểm', ['Các sản phẩm làm thối rữa có thể bao gồm các vật liệu sau đây:', 'cacbon oxit', 'ôxit nitơ', 'Formaldehyd.'], { ind: 140 }));
add(gap(60));
add(kv('Các hành động bảo vệ đặc biệt cho người chữa cháy', 'Nhanh chóng cô lập hiện trường bằng cách đuổi tất các mọi người ra khỏi khu vực xảy ra sự cố nếu thấy có cháy. Không nên đưa ra hành động nào nếu có thể gây nguy hại cho cá nhân hoặc nếu chưa được huấn luyện thích đáng. Di chuyển bình chứa khỏi khu vực cháy nếu có thể làm được mà không nguy hiểm. Dùng bụi nước để giữ mát bình chứa phơi ra lửa.'));
add(kv('Phương tiện, trang phục bảo hộ cần thiết khi chữa cháy', 'Nhân viên chữa cháy phải trang bị các dụng cụ bảo hộ thích hợp và máy thở độc lập (SCBA), với bộ phận che mặt kín và hoạt động ở chế độ áp suất dương.'));

// ---------- VI ----------
add(heading('VI.', 'Biện pháp phòng ngừa, ứng phó khi có sự cố', true));
add(sub('Các biện pháp đề phòng cá nhân, thiết bị bảo vệ và các quy trình xử lý khẩn cấp'));
add(kv('Cho người không phải nhân viên cấp cứu', 'Không nên đưa ra hành động nào nếu có thể gây nguy hại cho cá nhân hoặc nếu chưa được huấn luyện thích đáng. Di tản khỏi khu vực chung quanh. Ngăn không cho vào những người không cần thiết và không có thiết bị bảo hộ. Không nên sờ mó hoặc dẫm vào chất đã đổ ra. Tắt tất cả các nguồn phát lửa. Không dùng pháo sáng, khói hay ngọn lửa trong khu vực nguy hiểm. Tránh hít hơi hay sương. Cung cấp thông hơi đầy đủ. Đeo bình thở thích hợp trong trường hợp không có đủ thoáng khí. Sử dụng trang bị bảo hộ cá nhân phù hợp.', { ind: 140 }));
add(kv('Cho các nhân viên cấp cứu', 'Nếu cần phải có quần áo đặc biệt để xử lý lượng tràn đổ, hãy lưu ý đến mọi thông tin trong Mục 8 về các vật liệu phù hợp và không phù hợp. Xem thêm thông tin trong mục “Cho người không phải nhân viên cấp cứu”.', { ind: 140 }));
add(gap(60));
add(kv('Đề phòng cho môi trường', 'Tránh làm lây lan những chỗ vật liệu bị đổ trào, và không cho chúng thoát ra và tiếp xúc với đất, dòng nước, khu vực thoát nước và cống rãnh. Thông báo cho nhà chức trách liên quan nếu sản phẩm đã gây ô nhiễm môi trường (cống rãnh, nguồn nước, đất hay không khí). Chất làm ô nhiễm nước. Có thể có hại cho môi trường nếu thải ra số lượng lớn.'));
add(sub('Các phương pháp và vật liệu dùng để ngăn chặn và làm sạch'));
add(kv('Khi tràn đổ, dò rỉ ở mức nhỏ', 'Bịt chỗ rò rỉ nếu không nguy hiểm. Di chuyển các đồ đựng khỏi khu vực có chất đổ. Dùng dụng cụ không bắn tia lửa và thiết bị không nổ. Pha loãng bằng nước và dọn sạch nếu tan trong nước. Theo cách khác, nếu không tan trong nước, hãy thấm hút bằng một vật liệu khô trơ và đặt vào thùng chứa chất thải phù hợp. Xử lý thông qua nhà thầu xử lý chất thải có phép.', { ind: 140 }));
add(kv('Khi tràn đổ, dò rỉ lớn ở diện rộng', 'Bịt chỗ rò rỉ nếu không nguy hiểm. Di chuyển các đồ đựng khỏi khu vực có chất đổ. Dùng dụng cụ không bắn tia lửa và thiết bị không nổ. Tiếp cận phát thải từ hướng xuôi chiều gió. Ngăn không cho chảy vào đường cống, đường nước, khu hầm hoặc khu vực bị quây kín. Rửa chất đổ tràn vào nhà máy xử lý chất thải hay tiến hành như sau. Hốt và dọn chỗ đổ bằng chất không cháy nổ, thẩm thấu, ví dụ, cát, đất, đất cát hay đất mùn rồi cho vào bình chứa để xử lý theo đúng qui định của địa phương (xem Phần 13). Xử lý thông qua nhà thầu xử lý chất thải có phép. Vật liệu bị nhiễm hút độc có thể gây nguy hại tương tự như sản phẩm đổ tràn. Ghi chú: xem Phần 1 về thông tin liên hệ khẩn cấp và Phần 13 về xử lý chất thải.', { ind: 140 }));

// ---------- VII ----------
add(heading('VII.', 'Yêu cầu về sử dụng, bảo quản', true));
add(sub('Các biện pháp đề phòng cho thao tác an toàn'));
add(kv('Biện pháp bảo vệ', 'Trang bị các dụng cụ bảo hộ cá nhân thích hợp (xem phần 8). Trong bất kỳ quy trình nào có sử dụng sản phẩm này đều không được sử dụng các cá nhân đã có tiền sử bệnh da nhạy cảm. Đừng để vào mắt hay dính lên da hay quần áo. Không hít thở hơi hoặc sương. Đừng nuốt. Tránh thải ra môi trường. Chỉ sử dụng khi có thông gió đầy đủ. Đeo bình thở thích hợp trong trường hợp không có đủ thoáng khí. Đừng bước vào khu vực chứa hàng hay nơi đóng kín trừ phi có thông gió đầy đủ. Giữ trong đồ đựng ban đầu hoặc trong một đồ đựng khác được phê chuẩn, được chế tạo từ một vật liệu phù hợp, đóng chặt lại khi không sử dụng. Cất giữ và sử dụng xa chỗ nóng, tia lửa, ngọn lửa hoặc bất kỳ nguồn kích hỏa nào. Dùng thiết bị bằng điện (quạt, đèn, dụng cụ xử lý vật liệu) không gây nổ. Chỉ sử dụng dụng cụ không phát tia lửa. Tiến hành các biện pháp phòng ngừa tĩnh điện toát ra. Các đồ đựng đã đổ hết những món chứa bên trong vẫn giữ lại cặn và có thể nguy hiểm. Đừng sử dụng lại bình chứa.', { ind: 140 }));
add(kv('Tư vấn về vệ sinh nghề nghiệp tổng quát', 'Cấm không được ăn, uống và hút thuốc trong khu vực xử lý, trữ và chế biến chất này. Công nhân phải rửa tay và mặt trước khi ăn, uống và hút thuốc. Cởi bỏ quần áo ô nhiễm và trang bị bảo hộ rồi mới đi vào các khu vực ăn uống. Xem thêm Mục 8 để biết thêm thông tin về các biện pháp vệ sinh.', { ind: 140 }));
add(gap(60));
add(kv('Các điều kiện bảo quản an toàn, kể cả mọi khả năng tương kỵ', 'Đừng lưu trữ ở nhiệt độ cao hơn nhiệt độ sau đây: 50°C (122°F). Cất giữ theo đúng quy định của địa phương. Lưu trữ trong khu vực cách biệt được phê chuẩn. Bảo quản trong thùng chứa ban đầu tại khu vực khô, mát và thông thoáng tốt, tránh ánh sáng mặt trời trực tiếp, tránh các vật liệu không tương thích (xem Phần 10) và thực phẩm và đồ uống. Cất giữ khóa kín. Loại trừ mọi nguồn bắt lửa. Giữ tách xa các vật liệu ôxi hóa. Đậy thật chặt các đồ đựng và bao lại cho đến khi mang ra dùng. Các đồ đựng đã mở ra phải được đóng lại cẩn thận và để dựng đứng, cho khỏi rò rỉ. Đừng chứa đựng trong bình không dán nhãn hiệu. Dùng biện pháp ngăn cách thích hợp để tránh ô nhiễm môi trường. Xem Mục 10 để biết các chất kỵ tiếp xúc trước khi xử lý hoặc sử dụng.'));

// ---------- VIII ----------
add(heading('VIII.', 'Kiểm soát phơi nhiễm/yêu cầu về thiết bị bảo vệ cá nhân', true));
add(sub('Các thông số kiểm soát'));
add(sub('Giới hạn phơi nhiễm nghề nghiệp', 1));
const T = (s) => ({ t: s, b: true });
add(tbl([4700, 5222], ['Tên thành phần nguy hiểm', 'Giới hạn phơi nhiễm'], [
  ['1,2,4-Trimethylbenzene', [T('ACGIH TLV (Hoa Kỳ, 1/2024)'), '  TWA 8 giờ: 10 ppm.']],
  ['Benzene, trimethyl-', [T('ACGIH TLV (Hoa Kỳ, 1/2024) [trimethyl benzene, isomers]'), '  TWA 8 giờ: 10 ppm.']],
  ['n-butanol', [T('Bộ Y tế (Việt Nam, 6/2019)'), '  TWA 8 giờ: 150 mg/m³.']],
  ['etyl benzen', [[T('ACGIH TLV (Hoa Kỳ, 1/2024) '), 'Ototoxicant.'], '  TWA 8 giờ: 20 ppm.']],
  ['Xylene', [T('Bộ Y tế (Việt Nam, 6/2019) [xylen]'), '  TWA 8 giờ: 100 mg/m³.', '  STEL 15 phút: 300 mg/m³.']],
  ['diisobutyl keton', [T('ACGIH TLV (Hoa Kỳ, 1/2024)'), '  TWA 8 giờ: 25 ppm.', '  TWA 8 giờ: 145 mg/m³.']],
  ['1-metoxy-2-propanol', [T('ACGIH TLV (Hoa Kỳ, 1/2024)'), '  TWA 8 giờ: 50 ppm.', '  TWA 8 giờ: 184 mg/m³.', '  STEL 15 phút: 100 ppm.', '  STEL 15 phút: 369 mg/m³.']],
]));
add(gap(60));
add(kv('Quy trình theo dõi đề nghị', 'Cần tham khảo các tiêu chuẩn theo dõi phù hợp. Cũng cần phải tham khảo các hướng dẫn của quốc gia về các phương pháp xác định những chất nguy hại.'));
add(kv('Các biện pháp kiểm soát kỹ thuật phù hợp', 'Chỉ sử dụng khi có thông gió đầy đủ. Dùng các phương tiện che chắn của quy trình, hệ thống thông gió tại chỗ hay các biện pháp kiểm soát kỹ thuật khác để giữ mức phơi nhiễm của công nhân đối với khí độc hại thấp hơn bất kỳ giới hạn nào được khuyến cáo hoặc do luật định. Các phương tiện kiểm soát cũng cần giữ cho độ tập trung của khí, hơi hoặc bụi dưới bất kỳ giới hạn gây nổ nào. Sử dụng thiết bị thông hơi chống nổ.'));
add(kv('Kiểm soát phơi nhiễm môi trường', 'Phải kiểm tra khí thải từ ống thông gió hay thiết bị dây chuyền làm việc để bảo đảm chúng tuân thủ yêu cầu luật lệ bảo vệ môi trường. Trong một số trường hợp, cần có bộ lọc khói, màng lọc hay điều chỉnh cơ khí đối với thiết bị trong dây chuyền để giảm khí thải tới mức chấp nhận được.'));
add(sub('Các phương tiện bảo hộ cá nhân khi làm việc'));
add(kv('Biện pháp vệ sinh', 'Rửa bàn tay, cánh tay, và mặt cho thật sạch sau khi làm việc với hóa chất, trước khi ăn uống, hút thuốc và dùng nhà vệ sinh và vào lúc cuối giờ làm. Phải sử dụng kỹ thuật thích hợp để lột bỏ quần áo có thể đã bị nhiễm. Quần áo dùng trong việc có nhiễm bẩn không được phép ra ngoài nơi làm việc. Giặt sạch trang phục có dính chất độc trước khi dùng lại. Cần đặt những trạm rửa mắt và phòng tắm bảo an toàn ở gần địa điểm làm việc.', { ind: 140 }));
add(kv('Bảo vệ mắt', 'Kính chống văng hóa chất.', { ind: 140 }));
add(sub('Bảo vệ da', 1));
add(kv('Bảo vệ tay', 'Phải luôn luôn mang bao tay kháng hóa chất, không thấm chất lỏng, phù hợp với tiêu chuẩn được chấp nhận khi xử lý sản phẩm có hóa chất, nếu một cuộc đánh giá rủi ro xác định điều này cần thiết. Xem xét các thông số do nhà sản xuất găng cung cấp, kiểm tra trong khi sử dụng để biết rằng găng vẫn còn giữ được các tính chất bảo vệ của nó. Cần lưu ý rằng thời gian thấm qua của bất kỳ vật liệu găng tay nào của bất kỳ nhà sản xuất găng nào cũng khác nhau. Trong trường hợp hỗn hợp có chứa nhiều chất, thì thời gian bảo vệ của găng tay không thể tính chính xác được.', { ind: 280 }));
add(kv('Găng tay', 'Cao su butyl', { ind: 280 }));
add(kv('Bảo vệ thân thể', 'Phải chọn thiết bị bảo hộ cá nhân cho cơ thể dựa vào nhiệm vụ đang thi hành và nguy cơ gắn liền và phải được chuyên gia chấp thuận trước khi xử lý sản phẩm này. Khi có nguy cơ cháy do tĩnh điện, phải sử dụng trang phục bảo hộ chống tĩnh điện. Để đạt được hiệu quả bảo vệ chống tĩnh điện tốt nhất, trang phục cần bao gồm bộ áo liền quần, ủng và găng tay chống tĩnh điện.', { ind: 280 }));
add(kv('Biện pháp bảo vệ da khác', 'Giày dép phù hợp và mọi biện pháp bảo vệ thêm cho da phải được chọn theo công việc sẽ thực hiện cùng các nguy cơ gắn liền với công việc đó và phải được một chuyên gia phê chuẩn cho sử dụng trước khi thao tác với sản phẩm này.', { ind: 280 }));
add(kv('Bảo vệ hô hấp', 'Chọn lựa khẩu trang phải dựa trên mức phơi nhiễm đã biết hoặc dự kiến, mối nguy của sản phẩm và giới hạn hoạt động an toàn của khẩu trang đã chọn. Nếu người lao động bị phơi nhiễm vượt quá giới hạn phơi nhiễm, họ phải sử dụng dụng cụ thở thích hợp đã được kiểm nghiệm. Hãy dùng khẩu trang vừa vặn, lọc không khí hoặc khí tiếp không khí, đáp ứng tiêu chuẩn được công nhận, trong trường hợp một cuộc đánh giá rủi ro cho thấy điều này là cần thiết.', { ind: 140 }));

module.exports = B;
