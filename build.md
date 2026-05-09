# 💳 Subscription Billing System (SaaS Project)

A full-stack Subscription & Billing Management System built with Next.js and Supabase.  
It helps users track subscriptions like Netflix, Spotify, and other recurring expenses, along with renewals, analytics, and notifications.

---

# 🚀 Features

## 👤 User Management
- User registration & login
- Role-based access (Admin / User)
- Active / inactive users
- Secure authentication (recommended Supabase Auth)

## 📦 Subscription Management
- Add, edit, delete subscriptions
- Billing types: Monthly, Weekly, Annual
- Track subscription costs

## 🔁 Renewal Tracking
- Renewal dates
- Expiration dates
- Cancel subscriptions
- Renewal history

## 📊 Dashboard
- Total monthly spending
- Active subscriptions
- Upcoming renewals
- Expired subscriptions

## 📈 Analytics
- Monthly spending chart
- Yearly expense summary
- Subscription breakdown
- Financial insights

## 🔔 Notifications
- Renewal reminders
- Due payment alerts
- Expiry warnings
- Optional push notifications

## 🧾 Activity Logs
- Creation logs
- Update logs
- Cancellation logs
- Audit trail per user

---

# 🧱 Tech Stack
- Next.js (Frontend + API)
- Supabase (Database & Auth)
- PostgreSQL (via Supabase)
- Tailwind CSS (UI)

---

# 🗂️ Database Schema

## tbluser
- user_id
- user_fullname
- user_username
- user_password
- user_role_id
- user_is_active

## tblrole
- role_id
- role_name

## tblsubscriptionname
- subscription_id
- subscription_name
- subscription_type (Monthly / Weekly / Annually)
- subscription_bill
- subscription_added_by

## tblsubscriptionrenew
- subscription_renew_id
- subscription_renewed_at
- subscription_expired_at
- subscription_renewed_by
- subscription_is_cancelled

## tblsubscriptionlog
- subscription_renew_id
- subscription_total_bill
- subscription_action_by
- subscription_created_at

---

# 📁 Project Structure

app/  
components/  
lib/  
hooks/  
providers/  
types/  
config/  
public/  
styles/

---

# 🔐 Authentication Flow
Login → Validate User → Create Session → Dashboard Access

Recommended: Supabase Auth (instead of custom user table)

---

# 📊 System Flow
User Login → Dashboard → Add Subscription → Track Renewal → Analytics → Notifications

---

# 🎯 Project Goals
- SaaS architecture practice
- Full-stack development
- Database design (PostgreSQL)
- Subscription tracking system
- Scalable Next.js structure

---

# 🚀 Future Improvements
- Stripe payment integration
- Email notifications
- Push notifications
- PDF invoice export
- Budget tracking system
- Mobile app version

---

# 👨‍💻 Author
Built as a SaaS learning and portfolio project using modern web technologies.