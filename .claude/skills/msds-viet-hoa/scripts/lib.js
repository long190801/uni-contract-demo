const fs = require('fs');
const path = require('path');
let D;
try { D = require('docx'); } catch (e) { D = require('C:/Users/long1/AppData/Roaming/npm/node_modules/docx'); }
const { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  ImageRun, AlignmentType, VerticalAlign, TableLayoutType } = D;

const FONT = 'Times New Roman';
const BLUE = '1F3864';
const RED = 'EE0000';
const LINE = '8EA2C4';
const SZ = 20;
const W = 9922;
const IMG = path.join(__dirname, '..', 'assets', 'img');
const img = (f) => fs.readFileSync(path.join(IMG, f));

const NB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NOB = { top: NB, bottom: NB, left: NB, right: NB };
const BD = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const BORD = { top: BD, bottom: BD, left: BD, right: BD };

// r: chuỗi hoặc {t, b, i, u, c, sz, sub}
function run(x, base = {}) {
  if (typeof x === 'string') x = { t: x };
  const o = { ...base, ...x };
  return new TextRun({
    text: o.t, font: FONT, size: o.sz || SZ, bold: !!o.b, italics: !!o.i,
    underline: o.u ? {} : undefined, color: o.c, subScript: !!o.sub,
  });
}
// line: chuỗi | mảng runs | {runs:[...]}
function para(line, base = {}, popts = {}) {
  const arr = Array.isArray(line) ? line : [line];
  return new Paragraph({
    spacing: { before: 0, after: 30, line: 250 },
    children: arr.map((x) => run(x, base)), ...popts,
  });
}
function heading(num, title, red = false) {
  const kids = red
    ? [run({ t: num + ' ', b: true, c: BLUE, sz: 24 }), run({ t: title, b: true, c: RED, sz: 24 })]
    : [run({ t: num + ' ' + title, b: true, c: BLUE, sz: 24 })];
  return new Paragraph({
    keepNext: true, spacing: { before: 220, after: 100 }, children: kids,
    shading: { type: ShadingType.CLEAR, fill: 'DCE3F1', color: 'auto' },
    border: { top: BD, bottom: BD, left: BD, right: BD },
  });
}
function sub(title, lvl = 0) {
  return new Paragraph({
    keepNext: true, spacing: { before: 100, after: 50 }, indent: { left: lvl * 140 },
    children: [run({ t: title, b: true, u: true, c: BLUE })],
  });
}
function cell(content, width, opts = {}) {
  const lines = Array.isArray(content) ? content : [content];
  const kids = opts.raw ? content : lines.map((l) => (l instanceof Paragraph ? l : para(l, opts.base || {}, opts.p || {})));
  return new TableCell({
    width: { size: width, type: WidthType.DXA }, borders: opts.borders || NOB,
    margins: { top: 20, bottom: 20, left: 70, right: 70 },
    verticalAlign: opts.va || VerticalAlign.TOP,
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill, color: 'auto' } : undefined,
    columnSpan: opts.span, children: kids.length ? kids : [para('')],
  });
}
// nhãn : giá trị  (lines là mảng dòng; mỗi dòng chuỗi | mảng runs)
function kv(label, lines, o = {}) {
  const ind = o.ind || 0;
  const lw = o.lw || 2900 - ind * 0, cw = 260;
  const lab = [para({ t: label, b: true, c: o.red ? RED : BLUE }, {}, { indent: { left: ind } })];
  const vr = o.valRed !== undefined ? o.valRed : o.red;
  const val = (Array.isArray(lines) ? lines : [lines]).map((l) => para(l, vr ? { c: RED } : {}));
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [lw, cw, W - lw - cw],
    layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: [
      cell(lab, lw, { raw: true }),
      cell([para({ t: ':', b: true, c: o.red ? RED : BLUE })], cw, { raw: true }),
      cell(val, W - lw - cw, { raw: true }),
    ] })],
  });
}
// bảng có viền: widths, header (mảng chuỗi), rows (mảng mảng ô; ô = chuỗi | mảng dòng)
function tbl(widths, header, rows, o = {}) {
  const tw = widths.reduce((a, b) => a + b, 0);
  const mk = (cells, isH) => new TableRow({
    tableHeader: isH, cantSplit: true,
    children: cells.map((c, i) => cell(c, widths[i], {
      borders: BORD, base: isH ? { b: true, c: o.hc || BLUE } : (o.red ? { c: RED } : {}),
      fill: isH ? o.hfill : undefined,
    })),
  });
  return new Table({
    width: { size: tw, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED,
    rows: [...(header ? [mk(header, true)] : []), ...rows.map((r) => mk(r, false))],
  });
}
const gap = (n = 60) => new Paragraph({ spacing: { before: 0, after: n }, children: [] });
function pic(file, w, h) {
  return new ImageRun({ type: file.endsWith('jpg') ? 'jpg' : 'png', data: img(file), transformation: { width: w, height: h } });
}
// Ngày tạo bản Việt theo giờ GMT+7, dạng "22 tháng 10 năm 2026"
function ngayHomNay() {
  const d = new Date(Date.now() + 7 * 3600 * 1000);
  return `${d.getUTCDate()} tháng ${d.getUTCMonth() + 1} năm ${d.getUTCFullYear()}`;
}
module.exports = { ngayHomNay, D, run, para, heading, sub, cell, kv, tbl, gap, pic, img, FONT, BLUE, RED, LINE, SZ, W, NOB, BORD, BD };
