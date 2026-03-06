# 🎉 Interactive Onboarding Tour + LGPD Compliance

## ✅ Implemented Features

This document describes the **Interactive Step-by-Step Onboarding Tour** and **LGPD (Brazilian Data Protection Law) Compliance** features.

---

## 📚 Interactive Onboarding Tour

### Overview
A modern, lightweight step-by-step tour that guides new users through TeacherFlow's main features using pop-ups with shadows and smooth animations.

### Tour Steps (11 total)
1. **Welcome** - Introduction to TeacherFlow
2. **Dashboard Overview** - Explains the main dashboard
3. **Navigation Menu** - How to navigate between sections
4. **Locations (1st Priority)** - Create locations where classes happen
5. **Groups (2nd Priority)** - Set up classes/groups linked to locations
6. **Students (3rd Priority)** - Add students (with optional location)
7. **Calendar** - Manage schedules and lessons
8. **Payments** - Track financial status
9. **Quick Actions** - Shortcut buttons
10. **Profile & Settings** - Account management + LGPD
11. **Completion** - Congratulations message

### Hierarchy Design
```
Locais (Locations) 
  ↓
Turmas (Groups) → Must have a location
  ↓
Alunos (Students) → Can have optional location + optional groups
```

**Key Points:**
- Students can exist **without groups** (individual lessons)
- Students can have a **primary location** (optional)
- Groups **must** be linked to a location
- Location-first workflow ensures clean data hierarchy

### Files Created

#### Backend
- **`backend/app/routers/tour.py`** (240 lines)
  - `GET /tour/status` - Get current tour progress
  - `POST /tour/step` - Update current step
  - `POST /tour/complete` - Mark tour as completed
  - `POST /tour/skip` - Skip tour (still marks as completed)
  - `POST /tour/reset` - Restart tour from beginning
  - `POST /tour/admin/reset-user/{user_id}` - Admin reset for specific user

#### Frontend
- **`frontend/src/utils/onboardingTour.ts`** (200 lines)
  - Tour configuration with driver.js
  - 11 tour steps with element selectors
  - Helper functions: `startOnboardingTour()`, `resumeTourFromStep()`, `shouldShowTour()`
  
- **`frontend/src/components/OnboardingTourWrapper.tsx`** (130 lines)
  - React wrapper component
  - Auto-starts tour for new users (after 1.5s delay)
  - Tracks progress via API
  - Floating "?" button to restart tour
  - Event handlers: onNextClick, onDestroyStarted, onCloseClick

- **`frontend/src/styles/onboarding-tour.css`** (250 lines)
  - Custom CSS for driver.js
  - Modern design with shadows and animations
  - Dark mode support
  - Mobile responsive
  - Smooth transitions and pulse effects

#### Database
- **Migration:** `backend/alembic/versions/003_add_lgpd_compliance.py`
  - Added to User model:
    - `interactive_tour_completed` (Boolean, default: False)
    - `interactive_tour_step` (Integer, default: 0)

---

## 🛡️ LGPD Compliance

### Overview
Full implementation of Brazilian Data Protection Law (Lei nº 13.709/2018) with consent management, data access rights, and deletion requests.

### Features

#### 1. Consent Management (LGPD Article 7)
- Modal dialog on first login (blocking)
- Records: IP address, timestamp, terms version
- Consent versioning (v1.0, v1.1, v2.0, etc.)
- Update consent when terms change

#### 2. Data Rights (LGPD Article 18)
- **Confirmation** - Check if data is being processed
- **Access** - View all stored data
- **Correction** - Update incorrect data
- **Portability** - Export data as JSON
- **Deletion** - Request permanent account deletion
- **Revocation** - Withdraw consent anytime

#### 3. Data Classification
Three levels:
- **Personal** - Name, email, phone (default)
- **Sensitive** - Health data, biometrics, race, religion
- **Anonymous** - No personal identifiers

#### 4. Data Retention
- Default: 5 years after last access
- Automatic deletion after retention period
- User can request early deletion (30-day grace period)

#### 5. Audit Logging
- Tracks all data access operations
- Logs: timestamp, action, user agent
- Stored in JSON format: `lgpd_data_access_logs`

### Files Created

#### Backend
- **`backend/app/routers/lgpd.py`** (460 lines)
  - `POST /lgpd/consent` - Register consent
  - `GET /lgpd/consent-status` - Check consent status
  - `PUT /lgpd/update-consent` - Update to new terms version
  - `GET /lgpd/export-data` - Export all user data (portability)
  - `POST /lgpd/request-deletion` - Request account deletion (30-day grace)
  - `DELETE /lgpd/cancel-deletion` - Cancel deletion request
  - `PUT /lgpd/student/{student_id}/consent` - Update student LGPD settings

#### Frontend
- **`frontend/src/components/LGPDConsentModal.tsx`** (420 lines)
  - Beautiful modal with scroll area
  - Explains all LGPD rights in Portuguese
  - Two checkboxes: Terms of Use + Privacy Policy
  - Cannot close on first login (blocking)
  - Shows current consent status
  - Custom hook: `useLGPDConsent()`

#### Database
- **Migration:** `backend/alembic/versions/003_add_lgpd_compliance.py` (155 lines)
  - **User Model Fields:**
    - `lgpd_consent` (Boolean)
    - `lgpd_consent_date` (DateTime)
    - `lgpd_consent_ip` (String)
    - `lgpd_consent_version` (String, default: "1.0")
    - `lgpd_data_retention_until` (DateTime, +5 years)
    - `lgpd_right_to_delete_requested` (Boolean)
    - `lgpd_right_to_delete_requested_at` (DateTime)
    - `lgpd_data_access_logs` (JSON array)
  
  - **Student Model Fields:**
    - `location_id` (String, FK to locations, nullable) - For hierarchy
    - `lgpd_parent_consent` (Boolean) - Required for minors
    - `lgpd_parent_consent_date` (DateTime)
    - `lgpd_consent_document_url` (String) - Store signed PDFs
    - `lgpd_data_classification` (String: personal/sensitive/anonymous)
    - `lgpd_purpose` (String, default: "educational_services")
    - `lgpd_can_contact` (Boolean, default: True)

  - **Indexes Created:**
    - `ix_users_lgpd_consent` (for quick consent checks)
    - `ix_users_lgpd_right_to_delete` (for deletion queue)
    - `ix_students_lgpd_data_classification` (for data export filtering)

---

## 🚀 Installation & Setup

### 1. Install Dependencies

#### Backend (already installed)
```bash
# All dependencies are already in requirements.txt
# No additional packages needed
```

#### Frontend
```bash
cd frontend
npm install driver.js
# or
yarn add driver.js
```

### 2. Run Database Migration
```bash
cd backend
alembic upgrade head
```

This will:
- Add 11 fields to `users` table
- Add 7 fields to `students` table
- Create 3 indexes for performance
- Set default values for existing users

### 3. Import Components

#### In your main App.tsx or Layout:
```tsx
import { OnboardingTourWrapper } from '@/components/OnboardingTourWrapper';
import { LGPDConsentModal, useLGPDConsent } from '@/components/LGPDConsentModal';
import '@/styles/onboarding-tour.css';
import 'driver.js/dist/driver.css';

function App() {
  const { needsConsent, setNeedsConsent } = useLGPDConsent();

  return (
    <OnboardingTourWrapper>
      {/* Your app content */}
      <YourMainLayout />
      
      {/* LGPD Modal - shows on first login */}
      <LGPDConsentModal
        open={needsConsent}
        onOpenChange={setNeedsConsent}
        onConsentGiven={() => setNeedsConsent(false)}
        isFirstLogin={needsConsent}
      />
    </OnboardingTourWrapper>
  );
}
```

### 4. Add Element IDs to Dashboard

For the tour to work, add these IDs to your dashboard elements:

```tsx
// Dashboard container
<div id="dashboard-container">...</div>

// Navigation menu
<nav id="nav-menu">
  <a id="nav-locations" href="/locations">Locais</a>
  <a id="nav-groups" href="/groups">Turmas</a>
  <a id="nav-students" href="/students">Alunos</a>
  <a id="nav-calendar" href="/calendar">Agenda</a>
  <a id="nav-payments" href="/payments">Pagamentos</a>
</nav>

// Quick actions
<div id="quick-actions">...</div>

// User menu
<div id="user-menu">...</div>
```

### 5. Verify Routes Registered

Ensure `main.py` includes:
```python
from app.routers import tour, lgpd

app.include_router(tour.router, prefix=settings.API_V1_STR)
app.include_router(lgpd.router, prefix=settings.API_V1_STR)
```

---

## 📊 API Endpoints

### Interactive Tour

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/tour/status` | Get tour progress |
| `POST` | `/api/v1/tour/step` | Update current step |
| `POST` | `/api/v1/tour/complete` | Mark as completed |
| `POST` | `/api/v1/tour/skip` | Skip tour |
| `POST` | `/api/v1/tour/reset` | Restart tour |
| `POST` | `/api/v1/tour/admin/reset-user/{id}` | Admin reset |

### LGPD Compliance

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/lgpd/consent` | Register consent |
| `GET` | `/api/v1/lgpd/consent-status` | Check consent |
| `PUT` | `/api/v1/lgpd/update-consent` | Update consent version |
| `GET` | `/api/v1/lgpd/export-data` | Export all data (JSON) |
| `POST` | `/api/v1/lgpd/request-deletion` | Request deletion (30 days) |
| `DELETE` | `/api/v1/lgpd/cancel-deletion` | Cancel deletion |
| `PUT` | `/api/v1/lgpd/student/{id}/consent` | Student LGPD settings |

---

## 🎨 Customization

### Tour Steps
Edit `frontend/src/utils/onboardingTour.ts`:
```typescript
export const onboardingSteps: TourStep[] = [
  {
    element: "#your-element",
    popover: {
      title: "Your Title",
      description: "Your description",
      side: "right",
      align: "center",
    },
  },
  // ... more steps
];
```

### Tour Styling
Edit `frontend/src/styles/onboarding-tour.css`:
```css
.driver-popover {
  border-radius: 16px !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15) !important;
}
```

### LGPD Modal Text
Edit `frontend/src/components/LGPDConsentModal.tsx`:
- Change data retention period (default: 5 years)
- Update DPO contact email
- Customize consent language

### Terms Version
When updating Terms of Service:
1. Increment version in `LGPDConsentModal.tsx`:
   ```typescript
   const CURRENT_TERMS_VERSION = "2.0";
   ```
2. All users will see consent modal on next login

---

## 🧪 Testing

### Test Tour Locally
1. Create new user account
2. Login → Tour should auto-start after 1.5s
3. Click through all 11 steps
4. Verify "Congratulations!" message at end
5. Check database: `interactive_tour_completed = True`

### Test Tour Reset
1. Click floating "?" button (bottom-right)
2. Tour restarts from step 0

### Test LGPD Consent
1. Create new user → Modal blocks access
2. Try to close → Should be prevented
3. Check both checkboxes → "Accept" button enables
4. Click accept → Modal closes, consent saved

### Test Data Export
```bash
curl -X GET "http://localhost:8000/api/v1/lgpd/export-data" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response includes:
- User profile
- All students
- All locations
- All groups
- All lessons
- All payments

### Test Deletion Request
```bash
curl -X POST "http://localhost:8000/api/v1/lgpd/request-deletion" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "message": "Your data deletion request has been registered...",
  "deletion_requested_at": "2025-03-03T10:30:00",
  "estimated_completion": "2025-04-02T10:30:00",
  "request_id": "DEL-user123-1709462400"
}
```

---

## 📋 Checklist

- [x] Create tour configuration (onboardingTour.ts)
- [x] Create OnboardingTourWrapper component
- [x] Create custom CSS for driver.js
- [x] Create tour backend router (tour.py)
- [x] Create LGPD backend router (lgpd.py)
- [x] Create LGPDConsentModal component
- [x] Add database migration (003_add_lgpd_compliance.py)
- [x] Register routers in main.py
- [x] Add `location_id` to students (optional FK)
- [ ] Install driver.js: `npm install driver.js`
- [ ] Run migration: `alembic upgrade head`
- [ ] Add element IDs to dashboard components
- [ ] Import OnboardingTourWrapper in App.tsx
- [ ] Import LGPDConsentModal in App.tsx
- [ ] Test tour flow (11 steps)
- [ ] Test LGPD consent modal
- [ ] Test data export endpoint
- [ ] Deploy to production

---

## 🐛 Troubleshooting

### Tour doesn't start
- Check if user has `interactive_tour_completed = False` in database
- Verify element IDs exist in DOM (`#nav-menu`, `#dashboard-container`, etc.)
- Check browser console for errors

### LGPD modal doesn't appear
- Verify user has `lgpd_consent = False` in database
- Check `useLGPDConsent()` hook in console
- Ensure API endpoint `/lgpd/consent-status` returns 200

### Migration fails
```bash
# Rollback and retry
alembic downgrade -1
alembic upgrade head

# Or check current revision
alembic current
alembic history
```

### Tour styling looks wrong
- Ensure `onboarding-tour.css` is imported
- Ensure `driver.js/dist/driver.css` is imported
- Check CSS load order (custom CSS should come after driver.js CSS)

---

## 📖 References

- **Driver.js Docs:** https://driverjs.com/
- **LGPD Law:** https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- **LGPD Articles:**
  - Article 7: Legal basis for processing
  - Article 9: Sensitive personal data
  - Article 15 & 16: Data retention
  - Article 18: Data subject rights

---

## 🎯 Next Steps

1. **Install driver.js:** `npm install driver.js`
2. **Run migration:** `alembic upgrade head`
3. **Add element IDs to dashboard**
4. **Test tour flow end-to-end**
5. **Test LGPD modal on first login**
6. **Deploy to production**
7. **Monitor tour completion rates** (add analytics if needed)

---

**Status:** ✅ Implementation Complete  
**Last Updated:** 2025-03-03  
**Version:** 1.0
