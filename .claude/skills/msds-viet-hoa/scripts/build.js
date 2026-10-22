const fs = require('fs');
const L = require('./lib');
const { ngayHomNay, D, run, W, BLUE, RED, FONT, BD, NOB, pic } = L;
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, Header, Footer,
  PageNumber, AlignmentType, TableLayoutType, VerticalAlign, BorderStyle, ShadingType } = D;

const MA = 'PPG6105-304B/200K-T', TEN = 'PPG6105-304B', NGAY = ngayHomNay(), PB = '3.01';
const A = (t, o = {}) => new TextRun({ text: t, font: 'Arial', size: 16, bold: !!o.b, color: o.c || BLUE });
const P = (kids, o = {}) => new Paragraph({ spacing: { before: 20, after: 20 }, children: kids, ...o });
const cellH = (kids, w, o = {}) => new TableCell({
  width: { size: w, type: WidthType.DXA }, borders: o.borders || NOB, margins: { top: 20, bottom: 20, left: 80, right: 80 },
  verticalAlign: o.va, children: kids,
});

// Header trang 2+: khung nhỏ Mã SP / Ngày phát hành / Phiên bản / Tên SP
const BOX = { top: BD, bottom: BD, left: BD, right: BD };
const hdrDefault = new Header({ children: [new Table({
  width: { size: W, type: WidthType.DXA }, columnWidths: [3800, 3700, 2422], layout: TableLayoutType.FIXED,
  borders: { ...BOX, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } },
  rows: [
    new TableRow({ children: [
      cellH([P([A('Mã sản phẩm   ', { b: true }), A(MA, { c: '000000' })])], 3800),
      cellH([P([A('Ngày phát hành   ', { b: true }), A(NGAY, { c: RED })])], 3700),
      cellH([P([A('Phiên bản   ', { b: true }), A(PB, { c: '000000' })])], 2422),
    ] }),
    new TableRow({ children: [
      cellH([P([A('Tên sản phẩm   ', { b: true }), A(TEN, { c: '000000' })])], 3800),
      cellH([P([])], 3700), cellH([P([])], 2422),
    ] }),
  ],
}), new Paragraph({ spacing: { before: 0, after: 0 }, children: [] })] });

// Header trang 1: tiêu đề đỏ + ngày/phiên bản + logo PPG
const hdrFirst = new Header({ children: [new Table({
  width: { size: W, type: WidthType.DXA }, columnWidths: [8300, 1622], layout: TableLayoutType.FIXED,
  rows: [new TableRow({ children: [
    cellH([
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 80 },
        children: [run({ t: 'PHIẾU AN TOÀN HÓA CHẤT', b: true, c: RED, sz: 36 })] }),
      new Paragraph({ spacing: { before: 0, after: 0 }, indent: { left: 700 }, children: [
        run({ t: 'Ngày phát hành/Ngày hiệu chỉnh   ', b: true, c: BLUE }), run({ t: NGAY, c: RED }),
        run({ t: '      Phiên bản   ', b: true, c: BLUE }), run({ t: PB }),
      ] }),
    ], 8300, { va: VerticalAlign.CENTER }),
    cellH([new Paragraph({ alignment: AlignmentType.RIGHT, children: [pic('image1.jpg', 75, 58)] })], 1622, { va: VerticalAlign.CENTER }),
  ] })],
})] });

const ftr = () => new Footer({ children: [new Paragraph({
  alignment: AlignmentType.RIGHT, spacing: { before: 0, after: 0 },
  border: { top: { style: BorderStyle.DOTTED, size: 4, color: LINE_C(), space: 4 } },
  children: [A('Việt Nam', { b: true }), A('        Trang: ', { b: true }),
    new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 16, bold: true, color: BLUE }),
    A('/', { b: true }),
    new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Arial', size: 16, bold: true, color: BLUE })],
})] });
function LINE_C() { return '8EA2C4'; }

const body = [...require(process.argv[3] || './example_body1'), ...require(process.argv[4] || './example_body2')];

const doc = new Document({
  creator: 'UNI', title: 'SDS-PPG6105-304B_VN-VN',
  styles: { default: { document: { run: { font: FONT, size: 20 } } } },
  sections: [{
    properties: {
      titlePage: true,
      page: { size: { width: 11906, height: 16838 }, margin: { top: 1300, right: 992, bottom: 1000, left: 992, header: 450, footer: 450 } },
    },
    headers: { default: hdrDefault, first: hdrFirst },
    footers: { default: ftr(), first: ftr() },
    children: body,
  }],
});
const out = process.argv[2];
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(out, b); console.log('OK', out, b.length); });
