// Mục IX – XVI
const L = require('./lib');
const { ngayHomNay, heading, sub, kv, tbl, para, gap, pic, RED, D } = L;
const { Paragraph, AlignmentType } = D;

const B = [];
const add = (...x) => B.push(...x);
const IND1 = { ind: 140 }, IND2 = { ind: 280 };

// ---------- IX ----------
add(heading('IX.', 'Đặc tính lý, hóa của hóa chất', true));
add(sub('Bề ngoài'));
add(kv('Trạng thái vật lý', 'Chất lỏng.', IND1));
add(kv('Màu sắc', 'Vàng.', IND1));
add(kv('Mùi', 'Không có sẵn.'));
add(kv('Ngưỡng về mùi', 'Không có sẵn.'));
add(kv('pH', 'Không áp dụng.'));
add(kv('Điểm nóng chảy', 'Không có sẵn.'));
add(kv('Điểm sôi', '>37.78°C (>100°F)'));
add(kv('Điểm bùng cháy', 'Cốc đậy kín: 31°C (87.8°F)'));
add(kv('Tỷ lệ hóa hơi', 'Không có sẵn.'));
add(kv('Khả năng cháy (chất rắn, khí)', 'Không có sẵn.'));
add(kv('Giới hạn nổ (bốc cháy) dưới và trên', 'Không có sẵn.'));
add(kv('Áp suất hóa hơi', 'Không có sẵn.'));
add(kv('Tỷ trọng hơi', 'Không có sẵn.'));
add(kv('Mật độ tương đối', '1.03'));
add(kv('Bulk Density (g/cm³)', '1.025'));
add(kv('(Các) độ tan', ['nước lạnh: Không hòa tan']));
add(kv('Hệ số phân chia nước/Octanol', 'Không áp dụng.'));
add(kv('Nhiệt độ tự cháy', 'Không có sẵn.'));
add(kv('Nhiệt độ phân hủy', 'Không có sẵn.'));
add(kv('Tính dẻo', ['Sôi động (nhiệt độ phòng): Không có sẵn.', 'Động lực học (nhiệt độ phòng): Không có sẵn.', 'Động lực học (40°C): >21 mm²/s']));

// ---------- X ----------
add(heading('X.', 'Mức ổn định và phản ứng của hóa chất', true));
add(kv('Khả năng phản ứng', 'Không có dữ liệu thử nghiệm riêng liên quan đến khả năng phản ứng của sản phẩm này hoặc các thành phần của nó.'));
add(kv('Tính ổn định', 'Sản phẩm ổn định.'));
add(kv('Khả năng gây các phản ứng nguy hại', 'Trong điều kiện bảo quản và sử dụng thông thường, các phản ứng gây nguy hiểm sẽ không xảy ra.'));
add(kv('Tình trạng cần tránh', 'Khi bị phơi nhiễm ở các mức nhiệt độ cao có thể sản sinh ra các sản phẩm phân hủy độc hại.'));
add(kv('Các vật liệu không tương thích', 'Tránh xa các chất sau đây để phòng ngừa phản ứng tỏa nhiệt mạnh: chất oxy hóa, kiềm mạnh, axit mạnh.'));
add(kv('Sản phẩm phân rã có mối nguy', 'Tùy thuộc vào điều kiện, các sản phẩm phân hủy có thể bao gồm các tài liệu sau đây:  cacbon oxit  ôxit nitơ  Formaldehyd.'));

// ---------- XI ----------
add(heading('XI.', 'Thông tin về độc tính', true));
add(sub('Thông tin về các tác dụng độc'));
add(sub('Độc tính cấp tính', 1));
const HR = 'Solvent naphtha (petroleum), heavy aromatic', LA = 'Solvent naphtha (petroleum), light aromatic';
const CY = 'Cyclohexane, 5-isocyanato-1-(isocyanatomethyl)-1,3,3-trimethyl-, homopolymer, caprolactam-blocked';
const BUI = 'LC50 Hít phải Bụi và sương', HOI = 'LC50 Hít phải Hơi', DA = 'LD50 Ngoài da', MI = 'LD50 Đường miệng';
add(tbl([2650, 2350, 1500, 1800, 1622], ['Tên sản phẩm/thành phần', 'Kết quả', 'Loài', 'Liều lượng', 'Sự phơi nhiễm'], [
  [HR, BUI, 'Chuột', '>5.2 mg/l', '4 giờ'],
  ['', MI, 'Chuột', '>5 g/kg', '-'],
  ['Glutaric acid, dimethyl ester', BUI, 'Chuột', '>11 mg/l', '4 giờ'],
  ['', DA, 'Thỏ', '>5000 mg/kg', '-'],
  ['', MI, 'Chuột', '>5000 mg/kg', '-'],
  [LA, DA, 'Thỏ', '3.48 g/kg', '-'],
  ['', MI, 'Chuột', '8400 mg/kg', '-'],
  ['1,2,4-Trimethylbenzene', HOI, 'Chuột', '18000 mg/m³', '4 giờ'],
  ['', MI, 'Chuột', '5 g/kg', '-'],
  ['Benzene, trimethyl-', MI, 'Chuột', '8970 mg/kg', '-'],
  ['n-butanol', HOI, 'Chuột', '24000 mg/m³', '4 giờ'],
  ['', DA, 'Thỏ', '3400 mg/kg', '-'],
  ['', MI, 'Chuột', '790 mg/kg', '-'],
  ['etyl benzen', HOI, 'Chuột', '17.8 mg/l', '4 giờ'],
  ['', DA, 'Thỏ', '17.8 g/kg', '-'],
  ['', MI, 'Chuột', '3.5 g/kg', '-'],
  [CY, BUI, 'Chuột', '>5.3 mg/l', '4 giờ'],
  ['', MI, 'Chuột - Nam, Nữ', '>10000 mg/kg', '-'],
  ['Xylene', DA, 'Thỏ', '1.7 g/kg', '-'],
  ['', MI, 'Chuột', '4.3 g/kg', '-'],
  ['Dimethyl succinate', BUI, 'Chuột', '>5900 mg/m³', '4 giờ'],
  ['', DA, 'Thỏ', '>5000 mg/kg', '-'],
  ['', MI, 'Chuột', '>5 g/kg', '-'],
  ['diisobutyl keton', DA, 'Thỏ', '16 g/kg', '-'],
  ['', MI, 'Chuột', '5750 mg/kg', '-'],
  ['Dimethyl adipate', BUI, 'Chuột', '>11 mg/l', '4 giờ'],
  ['', DA, 'Thỏ', '>5000 mg/kg', '-'],
  ['', MI, 'Chuột', '11300 mg/kg', '-'],
  ['1-metoxy-2-propanol', HOI, 'Chuột', '>7000 ppm', '6 giờ'],
  ['', DA, 'Thỏ', '13 g/kg', '-'],
  ['', MI, 'Chuột', '5.2 g/kg', '-'],
]));
add(gap(40));
add(kv('Kết luận/Tóm tắt', 'Không có dữ liệu nào về bản thân hỗn hợp.'));
add(sub('Kích ứng/Ăn mòn', 1));
add(tbl([2200, 2300, 1000, 900, 1700, 1822], ['Tên sản phẩm/thành phần', 'Kết quả', 'Loài', 'Điểm', 'Sự phơi nhiễm', 'Theo dõi tác dụng kích ứng'], [
  ['n-butanol', 'Mắt - Đục giác mạc', 'Thỏ', '4', '-', '-'],
  ['Xylene', 'Da - Chất gây khó chịu vừa phải', 'Thỏ', '-', '24 giờ 500 mg', '-'],
]));
add(gap(40));
add(sub('Kết luận/Tóm tắt', 1));
const NO = 'Không có dữ liệu nào về bản thân hỗn hợp.';
add(kv('Da', NO, IND1));
add(kv('Mắt', NO, IND1));
add(kv('Hô hấp', NO, IND1));
add(sub('Nhạy cảm', 1));
add(kv('Da', NO, IND1));
add(kv('Hô hấp', NO, IND1));
add(sub('Tính đột biến', 1));
add(kv('Kết luận/Tóm tắt', NO, IND1));
add(sub('Tính gây ung thư', 1));
add(kv('Kết luận/Tóm tắt', NO, IND1));
add(sub('Độc tính sinh sản', 1));
add(kv('Kết luận/Tóm tắt', NO, IND1));
add(sub('Độc tính gây quái thai', 1));
add(kv('Kết luận/Tóm tắt', NO, IND1));
add(sub('Độc tính đối với một cơ quan cụ thể chịu tác động (phơi nhiễm một lần)', 1));
const MEE = 'Các tác dụng gây mê', KHO = 'Kích ứng đường hô hấp';
add(tbl([4400, 1500, 1600, 2422], ['Tên', 'Cấp', 'Cách phơi nhiễm', 'Cơ quan có nhắm tới'], [
  [HR, 'Cấp 3', '-', MEE],
  [LA, 'Cấp 3', '-', MEE],
  ['1,2,4-Trimethylbenzene', 'Cấp 3', '-', KHO],
  ['n-butanol', 'Cấp 3', '-', KHO],
  ['-', 'Cấp 3', '-', MEE],
  ['Xylene', 'Cấp 3', '-', KHO],
  ['diisobutyl keton', 'Cấp 3', '-', KHO],
  ['1-metoxy-2-propanol', 'Cấp 3', '-', MEE],
]));
add(sub('Độc tính đối với một cơ quan cụ thể chịu tác động (phơi nhiễm lặp lại nhiều lần)', 1));
add(tbl([4400, 1500, 1600, 2422], ['Tên', 'Cấp', 'Cách phơi nhiễm', 'Cơ quan có nhắm tới'], [
  ['etyl benzen', 'Cấp 2', '-', 'cơ quan thính giác'],
  [CY, 'Cấp 1', 'hít phải', 'phổi'],
]));
add(sub('Nguy hiểm bị ngạt từ nôn mửa', 1));
const ASP = 'HIỂM HỌA HÍT PHẢI - Cấp 1';
add(tbl([5400, 4522], ['Tên', 'Kết quả'], [
  [HR, ASP], [LA, ASP], ['etyl benzen', ASP], ['Xylene', ASP], ['diisobutyl keton', ASP],
]));
add(gap(60));
add(kv('Thông tin về các đường tiếp xúc có khả năng xảy ra', 'Không có sẵn.'));
add(sub('Tác động sức khỏe cấp tính tiềm ẩn'));
add(kv('Tiếp xúc mắt', 'Gây kích ứng mắt nghiêm trọng.', IND1));
add(kv('Hít phải', 'Có thể gây suy nhược hệ thống thần kinh trung ương (CNS). Có thể gây uể oải hoặc chóng mặt.', IND1));
add(kv('Tiếp xúc ngoài da', 'Gây kích ứng da. Lấy mỡ trong da. Có thể gây ra một phản ứng dị ứng da.', IND1));
add(kv('Nuốt phải', 'Có thể có hại nếu nuốt phải. Có thể gây suy nhược hệ thống thần kinh trung ương (CNS).', IND1));
add(sub('Các triệu chứng có liên quan đến các đặc điểm lý học, hóa học, và độc tính'));
const adv = 'Các triệu chứng bất lợi có thể bao gồm những điều sau đây:';
add(kv('Tiếp xúc mắt', [adv, 'đau nhức hoặc kích ứng khó chịu', 'chảy nước mắt', 'bị đỏ'], IND1));
add(kv('Hít phải', [adv, 'buồn nôn hay nôn mửa', 'đau đầu', 'buồn ngủ/mệt mỏi', 'chóng mặt/hoa mắt', 'bất tỉnh'], IND1));
add(kv('Tiếp xúc ngoài da', [adv, 'kích ứng khó chịu', 'bị đỏ', 'khô da', 'nứt da'], IND1));
add(kv('Nuốt phải', 'Không có thông tin cụ thể gì.', IND1));
add(sub('Các tác động chậm và tức thời và cả các tác động mãn tính từ việc phơi nhiễm ngắn hạn và lâu dài'));
add(sub('Phơi nhiễm ngắn hạn', 1));
add(kv('Các tác dụng tức thời có thể gặp', NO, IND2));
add(kv('Các tác dụng chậm có thể gặp', NO, IND2));
add(sub('Phơi nhiễm lâu dài', 1));
add(kv('Các tác dụng tức thời có thể gặp', NO, IND2));
add(kv('Các tác dụng chậm có thể gặp', NO, IND2));
add(sub('Tác động sức khỏe mãn tính tiềm ẩn', 1));
add(kv('Tổng quát', 'Có thể làm tổn thương các cơ quan qua phơi nhiễm lâu và nhiều lần. Việc tiếp xúc lâu dài hoặc lặp đi lặp lại có thể làm mất mỡ ở da và dẫn đến ngứa ngáy, nứt da và/hoặc bị viêm biểu bì. Nếu đã bị nhạy cảm, một phản ứng dị ứng nghiêm trọng có thể xảy ra về sau này khi có tiếp xúc ở mức độ thấp.', IND2));
add(kv('Tính gây ung thư', 'Chưa biết đến hậu quả nghiêm trọng hoặc nguy hiểm tai hại nào.', IND2));
add(kv('Tính đột biến', 'Chưa biết đến hậu quả nghiêm trọng hoặc nguy hiểm tai hại nào.', IND2));
add(kv('Độc tính sinh sản', 'Chưa biết đến hậu quả nghiêm trọng hoặc nguy hiểm tai hại nào.', IND2));
add(sub('Các số liệu đo lường độ độc'));
add(sub('Các giá trị ước tính độ độc cấp tính', 1));
add(tbl([5000, 4922], ['Lộ trình', 'Giá trị ATE (ước tính độ độc cấp tính)'], [
  ['Đường miệng', '4650.12 mg/kg'],
  ['Ngoài da', '5137.81 mg/kg'],
  ['Hít vào (các chất hơi)', '72.59 mg/l'],
  ['Hít vào (bụi và các thể sương)', '6.91 mg/l'],
]));
add(gap(60));
add(kv('Thông tin cần thiết khác', 'Việc tiếp xúc lâu dài hoặc lặp đi lặp lại có thể làm khô da và gây kích ứng khó chịu. Phơi nhiễm lặp đi lặp lại với nồng độ hóa hơi cao có thể gây kích ứng cho hệ hô hấp, tổn thương não và hệ thần kinh vĩnh viễn. Hít phải hơi/hơi phun tập trung quá giới hạn phơi nhiễm đề nghị gây ra nhức đầu, chóng mặt và buồn nôn và có thể dẫn đến bất tỉnh hay tử vong. Có chứa chất có thể phát ra formaldehyde nếu được bảo quản quá thời hạn sử dụng và / hoặc trong quá trình bảo dưỡng ở nhiệt độ cao hơn 60C / 140F. Tránh tiếp xúc với da và quần áo.'));

// ---------- XII ----------
add(heading('XII.', 'Thông tin về sinh thái', true));
add(sub('Độc Tính'));
add(tbl([2650, 3400, 2300, 1572], ['Tên sản phẩm/thành phần', 'Kết quả', 'Loài', 'Sự phơi nhiễm'], [
  [HR, 'NOEL 0.48 mg/l Nước ngọt', 'Daphnia', '21 ngày'],
  [LA, 'Cấp tính LC50 8.2 mg/l', 'Cá', '96 giờ'],
  ['n-butanol', 'Cấp tính LC50 1376 mg/l', 'Cá', '96 giờ'],
  ['etyl benzen', 'Cấp tính EC50 1.8 mg/l Nước ngọt', 'Daphnia', '48 giờ'],
  ['', 'mãn tính NOEC 1 mg/l Nước ngọt', [['Daphnia - ', { t: 'Ceriodaphnia dubia', i: true }]], '-'],
  ['1-metoxy-2-propanol', 'Cấp tính LC50 23300 mg/l', 'Daphnia', '48 giờ'],
  ['', 'Cấp tính LC50 >4500 mg/l Nước ngọt', 'Cá', '96 giờ'],
]));
add(sub('Độ bền và khả năng phân hủy'));
add(tbl([2650, 2200, 2300, 1000, 1772], ['Tên sản phẩm/thành phần', 'Thử nghiệm', 'Kết quả', 'Liều lượng', 'Chất tiêm chủng'], [
  ['etyl benzen', '-', '79 % - Dễ dàng - 10 ngày', '-', '-'],
  [CY, 'OECD Khả năng phân hủy sinh học sẵn sàng - Kiểm tra hô hấp đo áp suất', '1 % - Không dễ - 28 ngày', '-', '-'],
]));
add(gap(60));
add(tbl([2650, 2400, 2000, 2872], ['Tên sản phẩm/thành phần', 'Chu kỳ bán phân rã dưới nước', 'Quang phân', 'Tính bị vi khuẩn làm thối rữa'], [
  ['etyl benzen', '-', '-', 'Dễ dàng'],
  [CY, '-', '-', 'Không dễ'],
  ['Xylene', '-', '-', 'Dễ dàng'],
]));
add(sub('Khả năng tồn lưu'));
add(tbl([3600, 2200, 2000, 2122], ['Tên sản phẩm/thành phần', 'LogPow', 'BCF', 'Tiềm năng'], [
  [HR, '2.8 để 6.5', '-', 'Cao'],
  ['Glutaric acid, dimethyl ester', '0.49', '-', 'Thấp'],
  ['1,2,4-Trimethylbenzene', '3.63', '120.23', 'Thấp'],
  ['Benzene, trimethyl-', '3.4 để 3.8', '-', 'Thấp'],
  ['n-butanol', '1', '-', 'Thấp'],
  ['etyl benzen', '3.6', '79.43', 'Thấp'],
  ['Xylene', '3.12', '7.4 để 18.5', 'Thấp'],
  ['Dimethyl succinate', '0.33', '-', 'Thấp'],
  ['diisobutyl keton', '3.71', '-', 'Thấp'],
  ['Dimethyl adipate', '1.03', '-', 'Thấp'],
  ['1-metoxy-2-propanol', '<1', '-', 'Thấp'],
]));
add(sub('Khả năng phân tán qua đất'));
add(kv('Hệ số phân cách đất/nước', 'Không có sẵn.', IND1));
add(gap(40));
add(kv('Hậu quả xấu khác', 'Chưa biết đến hậu quả nghiêm trọng hoặc nguy hiểm tai hại nào.'));

// ---------- XIII ----------
add(heading('XIII.', 'Thông tin về thải bỏ', true));
add(kv('Các phương pháp thải bỏ', 'Cần tránh hoặc giảm thiểu tối đa việc tạo ra rác, chất thải. Việc hủy bỏ sản phẩm này, các dung dịch hoặc các bán sản phẩm phải luôn tuân thủ các quy định về bảo vệ môi trường và luật về hủy chất thải, cũng như bất kỳ các quy định nào khác của nhà chức trách địa phương. Xử lý các sản phẩm thừa hay không tái chế được bởi nhà thầu xử lý có phép. Chất thải khi chưa xử lý không được vứt bỏ vào hệ thống thoát nước trừ khi hoàn toàn tuân thủ các yêu cầu của tất cả các nhà chức trách có thẩm quyền. Bao bì đựng chất thải phải được thu hồi tái chế. Chỉ nên xem xét thực hiện việc đốt cháy hoặc chôn lấp khi việc thu hồi tái chế là không thể thực hiện được. Chất này và bình chứa cần phải được xử lý theo cách an toàn. Cần phải cẩn thận khi làm việc với các dụng cụ đựng rỗng chưa được làm sạch hoặc rửa sạch. Bình rỗng hay tàu thủy có thể giữ lại cặn sản phẩm. Hơi của cặn sản phẩm có thể tạo ra một bầu khí quyển rất dễ cháy hoặc nổ trong dụng cụ đựng. Không cắt, hàn hoặc mài các dụng cụ đựng đã qua sử dụng trừ khi chúng đã được làm sạch cẩn thận phần bên trong. Tránh làm lây lan những chỗ vật liệu bị đổ trào, và không cho chúng thoát ra và tiếp xúc với đất, dòng nước, khu vực thoát nước và cống rãnh.'));

// ---------- XIV (bảng 7 cột, bôi đỏ) ----------
add(heading('XIV.', 'Thông tin khi vận chuyển', true));
{
  const pics = () => [
    new Paragraph({ spacing: { before: 40, after: 20 }, children: [pic('image2.png', 46, 46), L.run(' '), pic('image4.png', 46, 46)] }),
    new Paragraph({ spacing: { before: 0, after: 40 }, children: [pic('image5.png', 46, 46)] }),
  ];
  const widths = [1950, 950, 950, 900, 850, 2200, 2122];
  const r = (x) => x;
  const rows = [
    [
      ['Quy định về vận chuyển hàng nguy hiểm của việt Nam:',
        '- Nghị định số 161/2024/NĐ-CP ngày 18/12/2024 của Chính phủ quy đinh danh mục hàng nguy hiểm, vận chuyển hàng nguy hiểm bằng phương tiện giao thông cơ giới đường bộ;',
        '- Nghị định số 34/2024/NĐ-CP ngày 31/03/2024 của Chính phủ quy định danh mục hàng hóa nguy hiểm, vận chuyển hàng hóa nguy hiểm bằng phương tiện giao thông cơ giới đường bộ và phương tiện thủy nội địa'],
      'UN1263', 'PAINT', 'Nhóm 3', 'III', null,
      'Kiểm tra thùng chứa không rò rỉ, ăn mòn, hư hỏng. Tránh va đập, xếp chồng gây sụp đổ, Phải tuân thủ quy định về vận tải hàng nguy hiểm bằng đường bộ/nội địa',
    ],
    ['Quy đinh về vận chuyển hàng nguy hiểm quốc tế của EU,USA...', 'UN1263', 'PAINT', 'Class 3', 'III', null, ''],
  ];
  const mk = (cells, isH) => new D.TableRow({
    tableHeader: isH, cantSplit: true,
    children: cells.map((c, i) => L.cell(c === null ? pics() : c, widths[i], {
      raw: c === null, borders: L.BORD, base: { c: RED, ...(isH ? { b: true } : {}) },
      va: isH ? D.VerticalAlign.CENTER : undefined, p: isH ? { alignment: AlignmentType.CENTER } : undefined,
    })),
  });
  add(new D.Table({
    width: { size: L.W, type: D.WidthType.DXA }, columnWidths: widths, layout: D.TableLayoutType.FIXED,
    rows: [
      mk(['Tên quy định', 'Số UN', 'Tên vận chuyển đường biển', 'Loại nhóm hàng nguy hiểm', 'Quy cách đóng gói', 'Nhãn vận chuyển', 'Thông tin bổ sung'], true),
      ...rows.map((r2) => mk(r2, false)),
    ],
  }));
}
add(gap(80));
add(sub('Thông tin bổ sung'));
add(kv('UN', 'Không nhận dạng được cái nào.', IND1));
add(kv('IMDG', 'The marine pollutant mark is not required when transported in sizes of ≤5 L or ≤5 kg.', IND1));
add(kv('IATA', 'Cần đóng dấu chất nguy hiểm cho môi trường nếu được quy định trong các quy định vận chuyển khác.', IND1));
add(gap(40));
add(kv('Mối nguy cho môi trường', ['UN: Vâng. Không cần dán nhãn chất độc hại với môi trường.', 'IMDG: Yes.', 'IATA: Yes. The environmentally hazardous substance mark is not required.']));
add(kv('Chất gây ô nhiễm biển', ['UN: Không áp dụng.', 'IMDG: (Solvent naphtha (petroleum), heavy aromatic)', 'IATA: Not applicable.']));
add(gap(40));
add(kv('Các biện pháp đề phòng đặc biệt cho người dùng', [[{ t: 'Chuyên chở trong nhà xưởng của người sử dụng:', b: true }, ' luôn luôn chuyên chở trong những thùng đựng được đậy kín và những thùng này phải được dựng đứng và giữ chặt. Nên đảm bảo là những người chuyên chở sản phẩm biết phải làm gì trong trường hợp bị tai nạn hoặc bị đổ.']]));
add(kv('Vận chuyển số lượng lớn theo các công cụ IMO', 'Không áp dụng.'));

// ---------- XV ----------
add(heading('XV.', 'Thông tin về pháp luật', true));
add(kv('Các quy định riêng về an toàn, y tế và môi trường cho sản phẩm', [
  '1. Tình trạng khai báo, đăng ký ở quốc gia khu vực trên thế giới (liệt kê các danh mục quốc gia đã tiến hành khai báo, tình trạng khai báo): Sản phẩm được phân loại nguy hiểm theo Hệ thống hài hòa toàn cầu về phân loại và ghi nhãn hóa chất (GHS)',
  '2. Phân loại nguy hiểm theo quốc gia, đăng ký: 3-Chất lỏng dễ cháy',
  '- Quy chuẩn Việt Nam: QCVN 05:2020/BCT',
  '3. Quy chuẩn kỹ thuật tuân thủ',
  '- Luật Hóa chất số 69/2025/QH15 ngày 14 tháng 06 năm 2025;',
  '- Nghị định số: 24/2026/NĐ-CP của Chính phủ ngày 17 tháng 01 năm 2026 Quy định các danh mục hoá chất thuộc phạm vi điều chỉnh của Luật Hoá chất;',
  '- Nghị định số 25/2026/NĐ-CP ngày 17/01/2026 của Chính phủ Quy định chi tiết và biện pháp để tổ chức, hướng dẫn thi hành một số điều của Luật Hóa chất về phát triển ngành công nghiệp hóa chất và an toàn, an ninh hóa chất;',
  '- Nghị định 26/2026/NĐ-CP của Chính phủ ngày 17 tháng 01 năm 2026 Quy định chi tiết và hướng dẫn thi hành một số điều của Luật Hoá chất về quản lý hoạt động hoá chất và hoá chất nguy hiểm trong sản phẩm hàng hoá.',
  '- Nghị định số 28/2026/NĐ – CP của chính phủ ngày 19 tháng 01 năm 2026 Quy định về các danh mục chất ma túy và tiền chất.',
  '- Thông tư số: 01/2026/TT-BCT ngày 17 tháng 01 năm 2026 Quy định chi tiết và hướng dẫn thi hành một số điều của Luật Hóa chất và Nghị định số 26/2026/NĐ-CP của Chính phủ quy định chi tiết và hướng dẫn thi hành một số điều của Luật Hóa chất về quản lý hoạt động hóa chất và hóa chất nguy hiểm trong sản phẩm, hàng hóa.',
  '- Thông tư số 02/2026/TT-BCT ngày 17/01/2026 của Bộ Công thương Quy định một số biện pháp thi hành Luật Hóa chất và Nghị định số 25/2026/NĐ-CP của Chính phủ quy định chi tiết và biện pháp để tổ chức, hướng dẫn thi hành một số điều của Luật Hóa chất về phát triển ngành công nghiệp hóa chất và an toàn, an ninh hóa chất.',
  '- Nghị định 43/2017/NĐ-CP về nhãn hàng hóa và Nghị định số 111/2021/NĐ-CP của Chính phủ: Sửa đổi, bổ sung một số điều Nghị định số 43/2017/NĐ-CP ngày 14 tháng 4 năm 2017 của Chính phủ về nhãn hàng hóa.',
  '- Quy chuẩn Việt Nam: QCVN 05:2020/BCT. Thông tư số: 48/2020/TT-BCT ngày 21 tháng 12 năm 2020 Quy chuẩn kỹ thuật quốc gia về an toàn trong sản xuất, kinh doanh, sử dụng, bảo quản và vận chuyển hóa chất nguy hiểm.',
  '- Nghị định số 34/2024/NĐ-CP ngày 31/03/2024 của Chính phủ Quy định Danh mục hàng hóa nguy hiểm và vận chuyển hàng hóa nguy hiểm bằng phương tiện giao thông cơ giới đường bộ và phương tiện thủy nội địa và Nghị định số 161/2024/NĐ-CP ngày 18/12/2024 của Chính phủ: Quy định Danh mục hàng hóa nguy hiểm, vận chuyển hàng hóa nguy hiểm và trình tự, thủ tục cấp giấy phép, cấp giấy chứng nhận hoàn thành chương trình tập huấn cho người lái xe hoặc người áp tải vận chuyển hàng hóa nguy hiểm trên đường bộ.',
  '- Các văn bản pháp luật hiện hành liên quan khác.',
], { valRed: true }));

// ---------- XVI ----------
add(heading('XVI.', 'Các thông tin cần thiết khác, bao gồm các thông tin khi xây dựng và hiệu đính Phiếu an toàn hóa chất', true));
add(sub('Lịch sử'));
add(kv('Ngày phát hành/Ngày hiệu chỉnh', ngayHomNay(), { ...IND1, valRed: true }));
add(kv('Ngày phát hành lần trước', '5/29/2025', IND1));
add(kv('Phiên bản', '3.01', IND1));
add(kv('Chuẩn bị bởi', 'EHS', IND1));
add(kv('Bảng từ viết tắt', [
  'ATE = Ước tính độ độc hại cấp tính',
  'BCF = Hệ số nồng độ sinh học',
  'GHS = Hệ thống phân loại và dán nhãn hóa chất hài hòa toàn cầu',
  'IATA = Hiệp hội vận tải hàng không quốc tế',
  'IBC = Côngtenơ khổ trung',
  'IMDG = Hàng hóa nguy hiểm hàng hải quốc tế',
  'LogPow = Lôgarít của hệ số phân chia octanol/nước',
  'MARPOL = Công ước quốc tế về việc ngăn chặn ô nhiễm từ tàu thuyền, 1973, được sửa đổi bởi Nghị định thư năm 1978. ("Marpol" = Marine Pollution (Ô nhiễm hàng hải))',
  'UN = Liên hợp quốc',
]));
add(kv('Tham khảo', 'Không có sẵn.'));
add(new Paragraph({ spacing: { before: 60, after: 60 }, children: [pic('image6.png', 14, 15), L.run({ t: ' Cho thấy thông tin đã thay đổi kể từ phiên bản phát hành trước đó.', b: true })] }));
add(sub('Người đọc lưu ý'));
add(para({ t: 'Thông tin trong bảng chỉ dẫn an toàn này dựa trên kiến thức khoa học kỹ thuật hiện tại. Mục đích của thông tin là tạo sự chú ý về khía cạnh sức khỏe và an toàn liên quan đến sản phẩm do PPG cung cấp, và đề xuất các biện pháp phòng ngừa khi lưu trữ cũng như xử lý sản phẩm. Các thuộc tính của sản phẩm không được chứng nhận hay đảm bảo. Chúng tôi không chịu trách nhiệm đối với những trường hợp không tuân thủ các biện pháp phòng ngừa được quy định trong bảng chỉ dẫn an toàn này hay sử dụng sản phẩm không đúng cách.', b: true }));
add(gap(300));
add(new Paragraph({ alignment: AlignmentType.CENTER, indent: { left: 4600 }, spacing: { before: 200, after: 0 },
  keepNext: true, children: [L.run({ t: '<TÊN CÔNG TY NHẬP KHẨU>', b: true, c: RED, sz: 24 })] }));

module.exports = B;
