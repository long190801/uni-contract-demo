-- UNI HR App — Bảng lưu văn bản tự động (HĐ lao động/thử việc/CTV/phụ lục)
-- Chạy trong Supabase SQL Editor.
-- Mục đích: (1) đánh số HĐ theo STT cùng loại của từng NV, (2) liệt kê văn bản đã tạo.

create table if not exists generated_documents (
  id            uuid primary key default uuid_generate_v4(),
  employee_id   uuid not null references employees(id) on delete cascade,
  doc_type      text not null,          -- HDLDXDTH / HDLDKXDTH / HDTV / HDCTV / PL
  doc_number    text,                   -- số HĐ đã sinh, vd HDLDXDTH/U023-02
  title         text,                   -- tên hiển thị
  web_url       text,                   -- link SharePoint (mở Word online)
  field_values  jsonb,                  -- snapshot toàn bộ giá trị đã điền
  created_by    text,
  created_at    timestamptz default now()
);

create index if not exists idx_gendoc_employee on generated_documents(employee_id);
create index if not exists idx_gendoc_type on generated_documents(employee_id, doc_type);
