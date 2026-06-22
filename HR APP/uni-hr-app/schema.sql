-- UNI HR App — Database Schema
-- Run this in Supabase SQL Editor

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron"; -- for scheduled jobs

-- ============================================================
-- MODULE 2: HỒ SƠ NHÂN SỰ
-- ============================================================

create table if not exists positions (
  id                       uuid primary key default uuid_generate_v4(),
  name                     text not null unique,
  department               text,
  required_experience_years int default 0,
  description              text
);

create table if not exists employees (
  id                       uuid primary key default uuid_generate_v4(),

  -- Thông tin cá nhân
  full_name                text not null,
  gender                   text check (gender in ('Nam', 'Nữ', 'Khác')),
  date_of_birth            date,
  nationality              text default 'Việt Nam',
  phone                    text,
  id_card_number           text,
  id_card_issued_date      date,
  id_card_issued_place     text,
  address                  text,
  email                    text,

  -- Thông tin công việc
  office                   text check (office in ('HCM', 'HN')),
  position                 text,
  department               text,
  level                    text,
  staff_code               text unique,
  contract_type            text check (contract_type in ('HĐLĐ', 'Thử việc', 'Cộng tác viên')),

  -- Hợp đồng
  contract_start_date      date,
  contract_end_date        date,
  probation_start_date     date,
  probation_end_date       date,
  quit_date                date,
  contract_code            text,

  -- Lương
  probation_salary         bigint,
  official_salary          bigint,

  -- Nhà nước
  bhxh_number              text,
  healthcare_place         text,
  tax_id                   text,

  -- Trạng thái
  status                   text check (status in (
    'Đang làm việc', 'Nghỉ việc HCM', 'Nghỉ việc HN', 'Thử việc'
  )) default 'Đang làm việc',

  -- Microsoft Teams
  teams_user_id            text,
  teams_email              text,

  avatar_url               text,
  notes                    text,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

create table if not exists employee_documents (
  id              uuid primary key default uuid_generate_v4(),
  employee_id     uuid not null references employees(id) on delete cascade,
  doc_type        text check (doc_type in ('CV', 'HĐLĐ', 'CMND', 'Ảnh', 'Khác')),
  file_name       text not null,
  storage_path    text not null,
  file_size       bigint,
  uploaded_at     timestamptz default now()
);

create table if not exists hr_contract_history (
  id              uuid primary key default uuid_generate_v4(),
  employee_id     uuid not null references employees(id) on delete cascade,
  contract_type   text check (contract_type in ('HĐLĐ', 'Thử việc', 'Cộng tác viên')),
  contract_code   text,
  start_date      date,
  end_date        date,
  salary          bigint,
  notes           text,
  created_at      timestamptz default now()
);

create table if not exists attendance_records (
  id              uuid primary key default uuid_generate_v4(),
  employee_id     uuid not null references employees(id) on delete cascade,
  record_date     date not null,
  check_in        time,
  check_out       time,
  work_hours      numeric(4,2),
  status          text check (status in ('Đủ công', 'Vắng', 'Đi trễ', 'Về sớm', 'Nửa ngày')),
  notes           text,
  created_at      timestamptz default now(),
  unique (employee_id, record_date)
);

create table if not exists renewal_reminders (
  id                   uuid primary key default uuid_generate_v4(),
  employee_id          uuid not null references employees(id) on delete cascade,
  contract_end_date    date not null,
  days_before          int not null,
  reminder_type        text,
  notified_at          timestamptz,
  is_resolved          boolean default false,
  created_at           timestamptz default now()
);

-- Teams activity snapshots (hàng tháng)
create table if not exists teams_activity_snapshots (
  id                      uuid primary key default uuid_generate_v4(),
  employee_id             uuid not null references employees(id) on delete cascade,
  snapshot_month          date not null, -- First day of the month
  messages_sent           int default 0,
  meetings_attended       int default 0,
  call_minutes            int default 0,
  active_days             int default 0,
  channel_messages        int default 0,
  chat_messages           int default 0,
  created_at              timestamptz default now(),
  unique (employee_id, snapshot_month)
);

-- ============================================================
-- MODULE 1: TUYỂN DỤNG
-- ============================================================

create table if not exists job_postings (
  id                   uuid primary key default uuid_generate_v4(),
  title                text not null,
  office               text check (office in ('HCM', 'HN', 'Cả hai')),
  required_exp_years   int default 0,
  description          text,
  requirements         text,
  status               text check (status in ('Mở', 'Đóng', 'Tạm dừng')) default 'Mở',
  created_at           timestamptz default now(),
  updated_at           timestamptz default now(),
  created_by           text
);

create table if not exists interviewers (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  email           text not null unique,
  teams_user_id   text,
  title           text,
  is_active       boolean default true,
  created_at      timestamptz default now()
);

create table if not exists candidates (
  id                   uuid primary key default uuid_generate_v4(),
  job_posting_id       uuid references job_postings(id) on delete set null,

  -- Thông tin cơ bản
  full_name            text not null,
  email                text,
  phone                text,

  -- CV AI-extracted
  years_experience     numeric(4,1),
  companies_count      int,
  university           text,
  english_score        text,
  cv_summary           text,

  -- Điểm CV
  cv_score             numeric(6,2),
  score_breakdown      jsonb,

  -- CV file
  cv_file_name         text,
  cv_storage_path      text,

  -- Teams meeting
  teams_meeting_url    text,

  -- Trạng thái
  status               text check (status in (
    'Mới nộp', 'Đang xem xét', 'Mời PV Online', 'Phỏng vấn Online',
    'Mời PV Trực tiếp', 'Phỏng vấn Trực tiếp', 'Offer',
    'Đã nhận việc', 'Từ chối Online', 'Từ chối Trực tiếp', 'Rút đơn'
  )) default 'Mới nộp',

  notes                text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now(),
  created_by           text
);

create table if not exists interview_slots (
  id                   uuid primary key default uuid_generate_v4(),
  candidate_id         uuid not null references candidates(id) on delete cascade,
  interview_type       text check (interview_type in ('Online', 'Trực tiếp')),
  slot_1               timestamptz,
  slot_2               timestamptz,
  slot_3               timestamptz,
  chosen_slot          timestamptz,
  candidate_response   text check (candidate_response in ('Chấp nhận', 'Đề xuất khác', 'Từ chối')),
  proposed_time        timestamptz,
  response_token       text unique default gen_random_uuid()::text,
  token_expires_at     timestamptz default (now() + interval '7 days'),
  invitation_sent_at   timestamptz,
  confirmation_sent_at timestamptz,
  created_at           timestamptz default now()
);

create table if not exists interview_sessions (
  id                   uuid primary key default uuid_generate_v4(),
  candidate_id         uuid not null references candidates(id) on delete cascade,
  interview_type       text check (interview_type in ('Online', 'Trực tiếp')),
  scheduled_at         timestamptz,
  location             text,
  teams_meeting_url    text,
  status               text check (status in ('Lên lịch', 'Hoàn thành', 'Hủy')) default 'Lên lịch',
  notes                text,
  created_at           timestamptz default now()
);

create table if not exists interview_evaluations (
  id                   uuid primary key default uuid_generate_v4(),
  session_id           uuid not null references interview_sessions(id) on delete cascade,
  interviewer_id       uuid references interviewers(id),
  scores               jsonb,
  overall_score        numeric(4,1),
  recommendation       text check (recommendation in ('Đậu', 'Rớt', 'Xem xét thêm')),
  comments             text,
  eval_token           text unique default gen_random_uuid()::text,
  token_expires_at     timestamptz default (now() + interval '7 days'),
  submitted_at         timestamptz,
  created_at           timestamptz default now()
);

create table if not exists approval_actions (
  id                   uuid primary key default uuid_generate_v4(),
  candidate_id         uuid not null references candidates(id) on delete cascade,
  action_type          text check (action_type in (
    'Tiến Online', 'Tiến Trực tiếp', 'Gửi Offer',
    'Từ chối Online', 'Từ chối Trực tiếp', 'Nhận việc'
  )),
  decided_by           text,
  decided_at           timestamptz,
  requested_at         timestamptz default now(),
  deadline_at          timestamptz default (now() + interval '48 hours'),
  reminder_sent        boolean default false,
  notes                text
);

create table if not exists email_logs (
  id                   uuid primary key default uuid_generate_v4(),
  candidate_id         uuid references candidates(id) on delete set null,
  template_name        text,
  recipient_email      text not null,
  subject              text,
  status               text check (status in ('Sent', 'Failed', 'Pending')) default 'Pending',
  provider_message_id  text,
  sent_at              timestamptz,
  error_message        text,
  created_at           timestamptz default now()
);

create table if not exists teams_message_logs (
  id                   uuid primary key default uuid_generate_v4(),
  recipient_teams_id   text,
  message_type         text,
  status               text check (status in ('Sent', 'Failed')) default 'Sent',
  sent_at              timestamptz default now(),
  error                text
);

-- ============================================================
-- MODULE 3: QUẢN LÝ TRANG THIẾT BỊ
-- ============================================================

create table if not exists equipment_items (
  id                   uuid primary key default uuid_generate_v4(),
  equipment_code       text unique not null,
  name                 text not null,
  serial_number        text,
  category             text check (category in (
    'Laptop', 'Màn hình', 'Điện thoại', 'Máy in', 'Phụ kiện', 'Khác'
  )),
  status               text check (status in (
    'Trong kho', 'Đang sử dụng', 'Đang sửa chữa', 'Đã hủy'
  )) default 'Trong kho',
  current_user_id      uuid references employees(id) on delete set null,
  assigned_date        date,
  specs                jsonb,
  condition            text check (condition in ('Tốt', 'Khá', 'Trung bình', 'Hỏng')),
  location             text check (location in ('HCM', 'HN')),
  purchase_date        date,
  warranty_expiry      date,
  purchase_value       bigint,
  current_value        bigint,
  notes                text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create table if not exists equipment_requests (
  id                   uuid primary key default uuid_generate_v4(),
  request_type         text check (request_type in (
    'Xin cấp mới', 'Thiết bị hư hỏng', 'Trả/thu hồi',
    'Đổi người dùng', 'Mượn về nhà', 'Nâng cấp'
  )),
  equipment_id         uuid references equipment_items(id) on delete set null,
  requested_by_employee uuid references employees(id) on delete set null,
  requested_by_user    text,
  requested_at         timestamptz default now(),
  requested_specs      jsonb,
  status               text check (status in (
    'Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đang xử lý', 'Hoàn thành'
  )) default 'Chờ duyệt',
  approved_by          text,
  approved_at          timestamptz,
  rejection_reason     text,
  loan_return_date     date,
  loan_returned_at     timestamptz,
  loan_extended_to     date,
  new_user_id          uuid references employees(id) on delete set null,
  document_type        text check (document_type in (
    'Biên bản bàn giao', 'Biên bản hoàn trả',
    'Biên bản mượn tạm thời', 'Quyết định xử lý BTTH'
  )),
  document_path        text,
  notes                text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create table if not exists equipment_history (
  id               uuid primary key default uuid_generate_v4(),
  equipment_id     uuid not null references equipment_items(id) on delete cascade,
  request_id       uuid references equipment_requests(id),
  action           text,
  from_user_id     uuid references employees(id) on delete set null,
  to_user_id       uuid references employees(id) on delete set null,
  action_date      date,
  condition_before text,
  condition_after  text,
  performed_by     text,
  notes            text,
  created_at       timestamptz default now()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================

create table if not exists hr_audit_logs (
  id              uuid primary key default uuid_generate_v4(),
  table_name      text not null,
  record_id       uuid,
  user_id         text,
  action          text check (action in ('CREATE', 'UPDATE', 'DELETE', 'VIEW')),
  field_changed   text,
  old_value       text,
  new_value       text,
  note            text,
  created_at      timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_employees_office on employees(office);
create index if not exists idx_employees_status on employees(status);
create index if not exists idx_employees_contract_end on employees(contract_end_date);
create index if not exists idx_employees_staff_code on employees(staff_code);
create index if not exists idx_employees_teams_user on employees(teams_user_id);
create index if not exists idx_candidates_job on candidates(job_posting_id);
create index if not exists idx_candidates_status on candidates(status);
create index if not exists idx_interview_slots_token on interview_slots(response_token);
create index if not exists idx_interview_evals_token on interview_evaluations(eval_token);
create index if not exists idx_equipment_status on equipment_items(status);
create index if not exists idx_equipment_requests_status on equipment_requests(status);
create index if not exists idx_renewal_active on renewal_reminders(contract_end_date) where is_resolved = false;

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger employees_updated_at before update on employees
  for each row execute function update_updated_at();

create trigger candidates_updated_at before update on candidates
  for each row execute function update_updated_at();

create trigger job_postings_updated_at before update on job_postings
  for each row execute function update_updated_at();

create trigger equipment_items_updated_at before update on equipment_items
  for each row execute function update_updated_at();

create trigger equipment_requests_updated_at before update on equipment_requests
  for each row execute function update_updated_at();

-- ============================================================
-- INITIAL DATA: positions / interviewers
-- ============================================================

insert into positions (name, department, required_experience_years) values
  ('Clearance Staff', 'Clearance', 2),
  ('FTA-CO Staff', 'FTA-CO', 2),
  ('Accountant', 'Accounting', 2),
  ('IT Staff', 'IT', 2),
  ('HR Staff', 'HR', 1),
  ('Legal Staff', 'Legal', 2),
  ('OPS Staff', 'OPS', 2),
  ('Marketing Staff', 'Marketing', 1),
  ('Logistics Sales', 'Sales', 2)
on conflict (name) do nothing;

-- ============================================================
-- STORAGE BUCKETS (run separately in Supabase dashboard or CLI)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('cvs', 'cvs', false);
-- insert into storage.buckets (id, name, public) values ('employee-docs', 'employee-docs', false);
-- insert into storage.buckets (id, name, public) values ('equipment-docs', 'equipment-docs', false);
