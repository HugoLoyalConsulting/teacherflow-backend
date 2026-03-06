# Metabase Business Intelligence Setup Guide

**Metabase** is an open-source business intelligence tool that allows you to create dashboards and visualize your TeacherFlow data.

---

## 📊 What is Metabase?

Metabase connects directly to your PostgreSQL database (Neon) and allows you to:
- Create visual dashboards
- Run SQL queries
- Generate reports
- Share insights with your team
- Monitor key metrics

---

## 🚀 Installation Options

### Option 1: Metabase Cloud (Recommended for Quick Start)

**Pros:**
- No infrastructure management
- Automatic updates
- Quick setup (5 minutes)

**Cons:**
- Paid plans only ($85/month for Starter)

**Steps:**
1. Go to https://www.metabase.com/pricing
2. Sign up for a plan
3. Follow hosted setup (skip to "Database Connection" below)

---

### Option 2: Self-Hosted on Render (Free)

**Pros:**
- Free tier available
- Easy deployment
- Persistent storage

**Steps:**

1. **Create Render Account**
   - Go to https://render.com
   - Sign up/login

2. **Deploy Metabase**
   - Click "New +" → "Web Service"
   - Choose "Deploy an existing image from a registry"
   - Docker Image: `metabase/metabase:latest`
   - Name: `teacherflow-metabase`
   - Region: Oregon (same as backend)
   - Plan: Free

3. **Environment Variables**
   ```env
   MB_DB_TYPE=postgres
   MB_DB_DBNAME=metabase
   MB_DB_PORT=5432
   MB_DB_USER=<neon-user>
   MB_DB_PASS=<neon-password>
   MB_DB_HOST=<neon-host>
   ```

4. **Wait for Deployment**
   - Deployment takes ~5-10 minutes
   - Access at: `https://teacherflow-metabase.onrender.com`

---

### Option 3: Docker (Local Development)

**Pros:**
- Run locally
- Fast iteration
- No internet required

**Steps:**

```bash
# 1. Pull Metabase image
docker pull metabase/metabase:latest

# 2. Run Metabase
docker run -d -p 3000:3000 \
  --name teacherflow-metabase \
  -v ~/metabase-data:/metabase-data \
  -e MB_DB_FILE=/metabase-data/metabase.db \
  metabase/metabase

# 3. Access Metabase
# Open browser: http://localhost:3000
```

---

## 🔌 Database Connection

### Step 1: Complete Metabase Setup

1. Open Metabase URL
2. Create admin account
   - Email
   - Password
   - Organization name: "TeacherFlow"

### Step 2: Add PostgreSQL Database

1. Click "Add a database"
2. Select "PostgreSQL"
3. Fill in connection details:

```
Database name: TeacherFlow Production
Host: ep-shy-paper-acltw1zj-pooler.sa-east-1.aws.neon.tech
Port: 5432
Database name: neondb
Database username: neondb_owner
Database password: npg_jZGViq4QOTA7

Additional options:
✓ Use a secure connection (SSL)
✓ Use SSL client certificate
SSL Mode: require
```

4. Click "Save"
5. Wait for sync to complete (~2 minutes)

---

## 📈 Dashboard Setup

### Quick Start Dashboards

#### 1. **Key Metrics Dashboard**

Create these questions:

**Total Users**
```sql
SELECT COUNT(*) as total_users
FROM users
WHERE deleted_at IS NULL
```

**Active Students**
```sql
SELECT COUNT(*) as active_students
FROM students
WHERE payment_status = 'active'
  AND deleted_at IS NULL
```

**Monthly Revenue**
```sql
SELECT 
  DATE_TRUNC('month', payment_date) as month,
  SUM(amount) as revenue
FROM payments
WHERE status = 'PAID'
  AND payment_date >= NOW() - INTERVAL '12 months'
GROUP BY month
ORDER BY month DESC
```

**New Signups (Last 30 Days)**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as signups
FROM users
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date
```

#### 2. **Student Metrics Dashboard**

**Student Growth**
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_students
FROM students
WHERE deleted_at IS NULL
GROUP BY month
ORDER BY month DESC
LIMIT 12
```

**Payment Status Distribution**
```sql
SELECT 
  payment_status,
  COUNT(*) as count
FROM students
WHERE deleted_at IS NULL
GROUP BY payment_status
```

**Students by Teacher**
```sql
SELECT 
  u.full_name as teacher,
  COUNT(s.id) as student_count
FROM users u
LEFT JOIN students s ON s.teacher_id = u.id
WHERE s.deleted_at IS NULL
GROUP BY u.id, u.full_name
ORDER BY student_count DESC
```

#### 3. **Revenue Dashboard**

**Monthly Recurring Revenue (MRR)**
```sql
SELECT 
  DATE_TRUNC('month', due_date) as month,
  SUM(amount) as mrr
FROM payments
WHERE status IN ('PAID', 'PENDING')
  AND recurrence IS NOT NULL
GROUP BY month
ORDER BY month DESC
```

**Payment Success Rate**
```sql
SELECT 
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
FROM payments
WHERE due_date >= NOW() - INTERVAL '30 days'
GROUP BY status
```

**Overdue Payments**
```sql
SELECT 
  s.name as student,
  u.full_name as teacher,
  p.amount,
  p.due_date,
  NOW()::DATE - p.due_date::DATE as days_overdue
FROM payments p
JOIN students s ON p.student_id = s.id
JOIN users u ON p.teacher_id = u.id
WHERE p.status = 'OVERDUE'
ORDER BY days_overdue DESC
```

---

## 🎨 Creating Visualizations

### For Each Question:

1. **Click "New" → "Question"**
2. Choose "Native Query" (SQL)
3. Paste SQL query
4. Click "Run"
5. Save question with descriptive name

### Visualization Types:

- **Number:** Single metric (Total Users, Revenue)
- **Line Chart:** Trends over time (Signups, Revenue)
- **Bar Chart:** Comparisons (Students by Teacher)
- **Pie Chart:** Distributions (Payment Status)
- **Table:** Detailed lists (Overdue Payments)

### Creating a Dashboard:

1. Click "New" → "Dashboard"
2. Name it (e.g., "Executive Overview")
3. Click "Add a question"
4. Select saved questions
5. Resize and arrange cards
6. Click "Save"

---

## 🔐 Security Best Practices

### 1. **Use Read-Only Database User**

Create a dedicated read-only user in Neon:

```sql
-- Create read-only user
CREATE USER metabase_readonly WITH PASSWORD 'secure_password_here';

-- Grant read-only access
GRANT CONNECT ON DATABASE neondb TO metabase_readonly;
GRANT USAGE ON SCHEMA public TO metabase_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO metabase_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO metabase_readonly;
```

Then use these credentials in Metabase instead of the owner credentials.

### 2. **Filter Sensitive Data**

Create views that exclude sensitive columns:

```sql
-- Safe users view (without passwords)
CREATE VIEW metabase_users AS
SELECT 
  id,
  email,
  full_name,
  is_active,
  created_at,
  last_login_at
FROM users
WHERE deleted_at IS NULL;

-- Grant access to views
GRANT SELECT ON metabase_users TO metabase_readonly;
```

### 3. **Enable Row-Level Security**

For multi-tenant setups, ensure queries include organization filters:

```sql
-- Always filter by organization
SELECT *
FROM students
WHERE organization_id = '...'
  AND deleted_at IS NULL
```

---

## 📧 Sharing Dashboards

### Email Reports

1. Click dashboard → "..." → "Subscriptions"
2. Click "Email it"
3. Set schedule (daily, weekly, monthly)
4. Add recipients
5. Save

### Public Links

⚠️ **Warning:** Only share aggregated, non-sensitive data publicly

1. Click dashboard → "..." → "Sharing"
2. Enable "Public link"
3. Copy and share URL

### User Permissions

1. Go to "Settings" → "Admin" → "People"
2. Invite team members
3. Set permissions:
   - View only
   - Can edit
   - Admin

---

## 🔄 Automatic Data Refresh

Metabase automatically syncs your database:
- **Schema:** Every 24 hours
- **Field values:** Every 24 hours

To manually sync:
1. Go to "Settings" → "Admin" → "Databases"
2. Click "TeacherFlow Production"
3. Click "Sync database schema now"

---

## 📱 Mobile Access

Metabase dashboards are responsive and work on mobile devices:
- iOS Safari
- Android Chrome
- Tablets

---

## 🐛 Troubleshooting

### Connection Failed

**Issue:** "Unable to connect to database"

**Solutions:**
1. Verify Neon database is not paused (auto-pauses after inactivity)
2. Check connection string is correct
3. Ensure SSL mode is set to "require"
4. Check firewall rules

### Slow Queries

**Issue:** Dashboards load slowly

**Solutions:**
1. Add database indexes:
   ```sql
   CREATE INDEX idx_students_teacher ON students(teacher_id);
   CREATE INDEX idx_payments_date ON payments(payment_date);
   ```
2. Use cached results in Metabase
3. Schedule dashboard refreshes during off-peak hours

### Missing Data

**Issue:** Some records don't appear

**Solutions:**
1. Check for `deleted_at IS NULL` filters
2. Verify organization_id filters
3. Check date ranges in queries

---

## 📚 Additional Resources

- **Metabase Documentation:** https://www.metabase.com/docs/latest/
- **SQL Tutorial:** https://www.metabase.com/learn/sql-questions/
- **Dashboard Best Practices:** https://www.metabase.com/learn/dashboards/
- **Neon Documentation:** https://neon.tech/docs

---

## 🎯 Recommended KPIs to Track

### Growth Metrics
- [ ] New user signups (daily/weekly/monthly)
- [ ] Active users (DAU/MAU)
- [ ] Student enrollment growth
- [ ] Teacher retention rate

### Revenue Metrics
- [ ] Monthly Recurring Revenue (MRR)
- [ ] Average Revenue Per User (ARPU)
- [ ] Payment success rate
- [ ] Churn rate

### Engagement Metrics
- [ ] Lessons created per teacher
- [ ] Attendance rate
- [ ] Average students per class
- [ ] Active vs inactive students

### Health Metrics
- [ ] Overdue payments
- [ ] Error rates (from Sentry)
- [ ] API response times
- [ ] Database query performance

---

## 🆘 Need Help?

For Metabase-specific questions:
- Community Forum: https://discourse.metabase.com/
- Support Email: support@metabase.com

For TeacherFlow integration:
- See [ARCHITECTURE_STACK_INTEGRATION.md](./architecture/ARCHITECTURE_STACK_INTEGRATION.md)
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
