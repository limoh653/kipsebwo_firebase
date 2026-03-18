-- ============================================================
-- KIPSEBWO POLYTECHNIC - SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. USER PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  department text check (department in ('finance','admissions','examinations','stores','admin')) not null,
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.user_profiles enable row level security;

create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.user_profiles for all
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and department = 'admin'
    )
  );

-- ============================================================
-- 2. AUDIT TRAIL
-- ============================================================
create table public.audit_trail (
  id bigserial primary key,
  user_id uuid references auth.users on delete set null,
  username text,
  action text not null,
  created_at timestamptz default now()
);

alter table public.audit_trail enable row level security;

create policy "Admins can view audit trail"
  on public.audit_trail for select
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and department = 'admin'
    )
  );

create policy "Authenticated users can insert audit trail"
  on public.audit_trail for insert
  with check (auth.uid() is not null);

-- ============================================================
-- 3. FEE STRUCTURES
-- ============================================================
create table public.fee_structures (
  id bigserial primary key,
  course text not null,
  scholar_type text check (scholar_type in ('Day Scholar','Boarder')) not null,
  financial_year text not null,
  -- Term 1
  pta_t1 numeric(10,2) default 0,
  medical_t1 numeric(10,2) default 0,
  ltt_t1 numeric(10,2) default 0,
  contingencies_t1 numeric(10,2) default 0,
  -- Term 2
  pta_t2 numeric(10,2) default 0,
  medical_t2 numeric(10,2) default 0,
  ltt_t2 numeric(10,2) default 0,
  -- Term 3
  pta_t3 numeric(10,2) default 0,
  medical_t3 numeric(10,2) default 0,
  ltt_t3 numeric(10,2) default 0,
  -- One-off fees
  adm_fee numeric(10,2) default 0,
  caution_money numeric(10,2) default 0,
  student_id_fee numeric(10,2) default 0,
  -- Boarding fees
  boarding_fee_t1 numeric(10,2) default 0,
  boarding_fee_t2 numeric(10,2) default 0,
  boarding_fee_t3 numeric(10,2) default 0,
  created_at timestamptz default now(),
  unique(course, scholar_type, financial_year)
);

alter table public.fee_structures enable row level security;
create policy "Finance/admin can manage fee structures"
  on public.fee_structures for all
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and department in ('finance','admin') and is_approved = true
    )
  );
create policy "All approved users can view fee structures"
  on public.fee_structures for select
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and is_approved = true
    )
  );

-- ============================================================
-- 4. STUDENTS
-- ============================================================
create table public.students (
  id bigserial primary key,
  name text not null,
  admission_number text unique not null,
  id_number text,
  email text,
  birth_certificate_number text,
  phone_number text not null,
  sex text check (sex in ('Male','Female')) not null,
  course text not null,
  last_school text,
  parent_contacts text,
  religion text,
  admission_date date default current_date,
  projected_duration_months integer default 12,
  year_enrolled integer default 2026,
  residence text check (residence in ('Boarder','Day Scholar')) default 'Day Scholar',
  status text check (status in ('Active','Deferred','Dropout','Completed')) default 'Active',
  passport_photo_url text,
  created_at timestamptz default now()
);

alter table public.students enable row level security;
create policy "Admissions/admin can manage students"
  on public.students for all
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and department in ('admissions','admin') and is_approved = true
    )
  );
create policy "All approved users can view students"
  on public.students for select
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and is_approved = true
    )
  );

-- ============================================================
-- 5. FEE BALANCES
-- ============================================================
create table public.fee_balances (
  id bigserial primary key,
  student_id bigint references public.students on delete cascade unique not null,
  total_invoiced numeric(10,2) default 0,
  total_paid numeric(10,2) default 0,
  updated_at timestamptz default now()
);

alter table public.fee_balances enable row level security;
create policy "Finance/admin can manage fee balances"
  on public.fee_balances for all
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and department in ('finance','admin') and is_approved = true
    )
  );
create policy "Admissions can view fee balances"
  on public.fee_balances for select
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and is_approved = true
    )
  );

-- ============================================================
-- 6. PAYMENTS
-- ============================================================
create table public.payments (
  id bigserial primary key,
  student_id bigint references public.students on delete cascade not null,
  amount numeric(10,2) not null,
  mode text check (mode in ('M-Pesa','Bank Cheque','Bank Deposit','Cash','Others')) not null,
  reference_number text unique,
  date_paid timestamptz default now(),
  recorded_by uuid references auth.users on delete set null
);

alter table public.payments enable row level security;
create policy "Finance/admin can manage payments"
  on public.payments for all
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and department in ('finance','admin') and is_approved = true
    )
  );
create policy "All approved can view payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and is_approved = true
    )
  );

-- Auto-generate reference number via trigger
create or replace function generate_payment_reference()
returns trigger as $$
begin
  if new.reference_number is null or new.reference_number = '' then
    new.reference_number := 'KIP-' || to_char(now(), 'YYYY') || '-' || upper(substring(gen_random_uuid()::text, 1, 8));
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_payment_reference
  before insert on public.payments
  for each row execute function generate_payment_reference();

-- Update fee_balance after payment
create or replace function update_fee_balance()
returns trigger as $$
begin
  update public.fee_balances
  set total_paid = (
    select coalesce(sum(amount), 0)
    from public.payments
    where student_id = new.student_id
  ),
  updated_at = now()
  where student_id = new.student_id;
  return new;
end;
$$ language plpgsql;

create trigger after_payment_insert
  after insert on public.payments
  for each row execute function update_fee_balance();

-- ============================================================
-- 7. EXAMINATIONS
-- ============================================================
create table public.examinations (
  id bigserial primary key,
  student_id bigint references public.students on delete cascade not null,
  subject_name text not null,
  cat_1 integer default 0,
  cat_2 integer default 0,
  end_term integer default 0,
  total_marks numeric(5,2) default 0,
  year_of_study text check (year_of_study in ('1','2','3')) default '1',
  semester text check (semester in ('1','2')) default '1',
  date_recorded timestamptz default now()
);

alter table public.examinations enable row level security;
create policy "Exams dept/admin can manage examinations"
  on public.examinations for all
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and department in ('examinations','admin') and is_approved = true
    )
  );
create policy "All approved can view examinations"
  on public.examinations for select
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and is_approved = true
    )
  );

-- Auto-calculate total_marks
create or replace function calc_exam_total()
returns trigger as $$
begin
  new.total_marks := ((new.cat_1 + new.cat_2) / 2.0) + new.end_term;
  return new;
end;
$$ language plpgsql;

create trigger before_exam_save
  before insert or update on public.examinations
  for each row execute function calc_exam_total();

-- ============================================================
-- 8. KNEC PAYMENTS
-- ============================================================
create table public.knec_payments (
  id bigserial primary key,
  student_id bigint references public.students on delete cascade not null,
  exam_series text not null,
  required_amount numeric(10,2) default 0,
  amount_paid numeric(10,2) default 0,
  date_paid date default current_date,
  unique(student_id, exam_series)
);

alter table public.knec_payments enable row level security;
create policy "Exams/admin can manage knec payments"
  on public.knec_payments for all
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and department in ('examinations','admin') and is_approved = true
    )
  );

-- ============================================================
-- 9. CONSUMABLES (Stores)
-- ============================================================
create table public.consumables (
  id bigserial primary key,
  description text not null,
  quantity integer default 0,
  number_issued integer default 0,
  balance_in_stock integer generated always as (quantity - number_issued) stored,
  date_supplied date default current_date,
  added_by uuid references auth.users on delete set null,
  created_at timestamptz default now()
);

alter table public.consumables enable row level security;
create policy "Stores/admin can manage consumables"
  on public.consumables for all
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and department in ('stores','admin') and is_approved = true
    )
  );

-- ============================================================
-- 10. PERMANENT EQUIPMENT (Stores)
-- ============================================================
create table public.permanent_equipment (
  id bigserial primary key,
  asset_description text not null,
  serial_number text unique not null,
  make_and_model text,
  date_of_delivery date,
  original_location text,
  current_location text,
  date_of_disposal date,
  asset_condition text check (asset_condition in ('Good','Fair','Damaged','Disposed')) default 'Good',
  remarks text,
  added_by uuid references auth.users on delete set null,
  created_at timestamptz default now()
);

alter table public.permanent_equipment enable row level security;
create policy "Stores/admin can manage equipment"
  on public.permanent_equipment for all
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and department in ('stores','admin') and is_approved = true
    )
  );

-- ============================================================
-- Auto-create fee_balance when student is added
-- ============================================================
create or replace function auto_create_fee_balance()
returns trigger as $$
declare
  structure record;
  total_inv numeric := 0;
begin
  -- Try to find a matching fee structure
  select * into structure
  from public.fee_structures
  where lower(course) = lower(new.course)
    and scholar_type = new.residence
  order by financial_year desc
  limit 1;

  if found then
    total_inv :=
      (structure.pta_t1 + structure.medical_t1 + structure.ltt_t1 + structure.contingencies_t1
       + structure.adm_fee + structure.caution_money + structure.student_id_fee + structure.boarding_fee_t1)
      + (structure.pta_t2 + structure.medical_t2 + structure.ltt_t2 + structure.boarding_fee_t2)
      + (structure.pta_t3 + structure.medical_t3 + structure.ltt_t3 + structure.boarding_fee_t3);
  end if;

  insert into public.fee_balances (student_id, total_invoiced, total_paid)
  values (new.id, total_inv, 0)
  on conflict (student_id) do nothing;

  return new;
end;
$$ language plpgsql;

create trigger after_student_insert
  after insert on public.students
  for each row execute function auto_create_fee_balance();

-- ============================================================
-- Storage bucket for student photos
-- ============================================================
insert into storage.buckets (id, name, public) values ('student-photos', 'student-photos', true)
on conflict do nothing;
