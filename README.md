# Kipsebwo VTC — React + Supabase

St. Augustine Kipsebwo Vocational Training Centre management system,
migrated from Django to React (Vite) + Supabase.

## Stack
- **Frontend**: React 18 + Vite
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Custom CSS (dark theme, Syne + DM Sans fonts)
- **Routing**: React Router v6
- **Notifications**: react-hot-toast

---

## Quick Setup

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. In your project dashboard, go to **SQL Editor**
3. Paste and run the entire contents of `supabase_schema.sql`

### 2. Configure Environment Variables
Create a `.env` file in the project root (copy from `.env.example`):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these in your Supabase dashboard under **Settings → API**.

### 3. Create the First Admin User
In **Supabase → Authentication → Users**, click "Add user":
- Email: `admin@kipsebwo.ac.ke` (or any email)
- Password: your choice

Then in **SQL Editor**, run:
```sql
INSERT INTO public.user_profiles (id, username, department, is_approved)
VALUES (
  '<the-user-uuid-from-auth>',
  'Admin',
  'admin',
  true
);
```

### 4. Install & Run
```bash
npm install
npm run dev
```

---

## Features

### 🎓 Admissions
- Register students with all details
- Group view by course
- Dynamic year/term calculation based on admission date
- Edit student profiles

### 💰 Finance
- Fee structure management (per course/scholar type/year)
- Record payments (M-Pesa, Bank, Cash, etc.)
- Auto-generate payment reference numbers
- Print receipts
- Student fee balance tracking
- Date-range payment filtering

### 📚 Examinations
- Enter CAT 1, CAT 2, End Term marks
- Auto-calculate totals and grades
- KNEC exam payment tracking
- Filter by course/student

### 📦 Stores
- Consumables inventory (quantity, issued, balance)
- Permanent equipment register (serial numbers, condition, location)
- Full CRUD with audit trail

### 🛡️ Admin Panel
- User approval workflow (users register → admin approves)
- Full audit trail of all actions
- Role-based access (each department sees only their section)

### 🔐 Authentication
- Supabase Auth (email/password)
- Department-based RBAC
- Admin approval before login
- Session persistence

---

## Migration Notes (Django → Supabase)

| Django | Supabase Equivalent |
|--------|---------------------|
| `models.py` | PostgreSQL tables in `supabase_schema.sql` |
| `UserProfile` | `public.user_profiles` |
| `@login_required` | Supabase `auth.uid()` in RLS policies |
| `@department_required` | Row Level Security per table |
| `post_save` signals | PostgreSQL `TRIGGER` functions |
| `Payment.save()` auto-ref | `generate_payment_reference()` trigger |
| `auto_calculate_fees` signal | `auto_create_fee_balance()` trigger |
| `calc total_marks` in save | `calc_exam_totals()` trigger |
| Django Admin | Custom `/admin` page in React |
| `AuditTrail` | `public.audit_trail` table |
| Media files | Supabase Storage bucket (`student-photos`) |

---

## Folder Structure

```
src/
  context/       # AuthContext (global auth state)
  lib/           # supabase.js client
  components/    # Layout (sidebar nav)
  pages/
    auth/        # Login, Register, Pending
    admissions/  # AdmissionsPage, StudentProfile
    finance/     # FinancePage (payments + fee structures)
    examinations/ # ExaminationsPage (marks + KNEC)
    stores/      # StoresPage (consumables + equipment)
    admin/       # AdminPage (user management + audit)
  index.css      # Global styles
```
