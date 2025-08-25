# Pattern-Based Term Membership Scheduling Feature

## Overview
This document outlines the implementation of pattern-based scheduling for term memberships in the Yoga Stenungsund platform, built on top of the URBE (Universal Resource & Booking Engine) system within brain-core.

## Business Context

### Current Problem
- Term memberships (terminskort) allow 1-3 classes per week over 10 weeks
- Current UI is linear and tedious for multi-week booking
- Members must select each session individually across all weeks
- No easy way to maintain consistent weekly schedule

### Solution
Implement a "schedule once, replicate pattern" approach where members:
1. Select their ideal schedule for Week 1 using real available sessions
2. System extracts this as a weekly pattern
3. Pattern is automatically applied to remaining weeks
4. Conflicts are identified and alternatives suggested

## Implementation Status

### ✅ COMPLETED

#### Frontend Components

1. **EnhancedTermCheckout.tsx** (`/components/membership/EnhancedTermCheckout.tsx`)
   - Multi-step checkout flow replacing SimpleTermCheckout
   - Steps: Auth → Select Class Type → Schedule Week 1 → Review Pattern → Apply Pattern → Confirm
   - Shows real sessions from database for Week 1
   - Pattern extraction and replication logic
   - Conflict resolution UI with alternatives
   - Status: COMPLETE

2. **Translations** 
   - Added `termCheckout` namespace to both sv and en locales
   - `/messages/sv/membership.json` and `/messages/en/membership.json`
   - Status: COMPLETE

3. **API Integration** (`/lib/api/braincore.ts`)
   - Added `applyWeeklyPattern()` method
   - Added `getAggregatedSessions()` method  
   - Properly typed responses (no 'any' types)
   - Status: COMPLETE

4. **Next.js API Routes** (`/app/api/braincore/pattern-booking/route.ts`)
   - POST endpoint for pattern application
   - GET endpoint for aggregated sessions
   - Handles authentication via session tokens
   - Status: COMPLETE

#### Backend Implementation (brain-core)

1. **Pattern Scheduling Service** (`/backend/app/services/urbe/pattern_scheduling_service.py`)
   - Core business logic for pattern-based scheduling
   - Key methods:
     - `apply_weekly_pattern()` - Main pattern application
     - `_process_week()` - Process individual weeks
     - `_find_matching_session()` - Match pattern to real sessions
     - `_find_alternatives()` - Suggest alternatives for conflicts
     - `validate_pattern_feasibility()` - Check if pattern is viable
   - Respects member scheduling rules from membership plan
   - Status: COMPLETE

2. **API Endpoints** (`/backend/app/api/endpoints/urbe/pattern_booking.py`)
   - Thin controller layer (logic in service)
   - `/apply` - Apply pattern across term
   - `/validate` - Validate pattern feasibility
   - Properly registered in URBE router
   - Status: COMPLETE

3. **Data Model Enhancement** (`/backend/app/models/urbe.py`)
   - Added `member_scheduling_rules` field to MembershipPlan model
   - JSONB field for flexible rule configuration:
     ```python
     {
       "require_same_day_each_week": false,  # For 1x/week memberships
       "allow_flexible_days": true,          # Can vary days week to week
       "require_consistent_pattern": false,  # Must maintain initial pattern
       "allow_multiple_templates": false,    # Can mix class types (false for Yoga Stenungsund)
       "max_bookings_per_day": 1,           # Prevent multiple classes same day
       "min_hours_between_bookings": 12,    # Recovery time
       "pattern_lock_after_weeks": 2,       # Lock pattern after N weeks
       "allow_pattern_modification": true    # Can modify pattern mid-term
     }
     ```
   - Status: COMPLETE

### 🚧 IN PROGRESS

1. **Testing**
   - Need to test full flow with real data
   - Verify pattern matching algorithm accuracy
   - Test conflict resolution scenarios

### 📋 TODO

1. **Database Migration**
   - Create Alembic migration for `member_scheduling_rules` field
   - Populate default rules for existing membership plans

2. **Admin UI**
   - Create admin interface for configuring member scheduling rules
   - Allow per-membership-plan rule customization

3. **Enhanced Features**
   - Add "Smart Fill" AI suggestions based on availability predictions
   - Implement pattern modification mid-term (if rules allow)
   - Add waitlist integration for full sessions

4. **Production Deployment**
   - Deploy backend changes to Heroku
   - Deploy frontend to Vercel
   - Monitor initial usage and gather feedback

## Architecture Decisions

### Key Design Principles

1. **Service Layer Pattern**: All business logic in service layer, thin endpoints
2. **Generic URBE Model**: No company-specific references in core models
3. **Flexible Configuration**: JSONB fields for company-specific rules
4. **Pattern Matching Algorithm**: Prioritizes exact matches, then closest alternatives
5. **Conflict Resolution**: Automatic suggestions with manual override option

### Technical Flow

```
User selects Week 1 sessions
    ↓
Extract pattern (day_of_week, time, template_id)
    ↓
For each subsequent week:
    - Find matching sessions (±30min tolerance)
    - If no match, find alternatives
    - Track conflicts
    ↓
Present results with conflict resolution UI
    ↓
User confirms or adjusts
    ↓
Create all bookings via Stripe checkout
```

## Configuration for Yoga Stenungsund

### Current Requirements
- Single class type per membership (no mixing)
- 1x/week: Should maintain same day/time
- 2-3x/week: More flexibility allowed
- Pattern replication across 10-week terms

### member_scheduling_rules Configuration
```json
{
  "require_same_day_each_week": false,
  "allow_flexible_days": true,
  "require_consistent_pattern": false,
  "allow_multiple_templates": false,
  "max_bookings_per_day": 1,
  "min_hours_between_bookings": 12,
  "pattern_lock_after_weeks": 2,
  "allow_pattern_modification": true
}
```

## Future Enhancements (Phase 2)

### Member Scheduling Hub
- Centralized dashboard for all scheduling needs
- Drag-and-drop calendar interface
- Recovery credits management
- Quick booking actions

### AI Agent Integration
- Intelligent schedule recommendations
- Membership optimization suggestions
- Predictive availability alerts
- Conversational booking interface

### Advanced Pattern Features
- Multi-template patterns (when rules allow)
- Pattern templates library
- Group scheduling for friends/family
- Recurring patterns across multiple terms

## API Endpoints

### Frontend → Next.js API
- `POST /api/braincore/pattern-booking` - Apply pattern
- `GET /api/braincore/pattern-booking` - Get aggregated sessions

### Next.js → Brain-core Backend
- `POST /api/v1/urbe/pattern-booking/apply` - Apply weekly pattern
- `POST /api/v1/urbe/pattern-booking/validate` - Validate pattern feasibility
- `GET /api/v1/urbe/pattern-booking/alternatives/{session_id}` - Get alternatives

## Files Modified/Created

### Frontend (yoga-stenungsund)
- `/components/membership/EnhancedTermCheckout.tsx` - NEW
- `/components/membership/TermMembershipCard.tsx` - MODIFIED (uses EnhancedTermCheckout)
- `/lib/api/braincore.ts` - MODIFIED (added pattern methods)
- `/app/api/braincore/pattern-booking/route.ts` - NEW
- `/messages/sv/membership.json` - MODIFIED (added termCheckout namespace)
- `/messages/en/membership.json` - MODIFIED (added termCheckout namespace)

### Backend (brain-core)
- `/backend/app/services/urbe/pattern_scheduling_service.py` - NEW
- `/backend/app/api/endpoints/urbe/pattern_booking.py` - NEW
- `/backend/app/api/endpoints/urbe/__init__.py` - MODIFIED (registered router)
- `/backend/app/models/urbe.py` - MODIFIED (added member_scheduling_rules)

## Testing Checklist

- [ ] Single class type selection enforced
- [ ] Week 1 shows only real available sessions
- [ ] Pattern extraction correctly identifies day/time
- [ ] Pattern application finds correct matches
- [ ] Conflicts are properly identified
- [ ] Alternatives are relevant and available
- [ ] member_scheduling_rules are enforced
- [ ] Checkout includes all selected sessions
- [ ] Bookings are created in database
- [ ] Confirmation emails sent

## Deployment Steps

1. Backend (brain-core on Heroku)
   ```bash
   git add -A
   git commit -m "Add pattern-based scheduling for term memberships"
   git push heroku main
   heroku run alembic upgrade head  # After creating migration
   ```

2. Frontend (yoga-stenungsund on Vercel)
   ```bash
   git add -A
   git commit -m "Add enhanced term checkout with pattern scheduling"
   git push origin main  # Auto-deploys via Vercel
   ```

## Contact & Context

- **Project**: Yoga Stenungsund membership and scheduling system
- **Backend**: Brain-core URBE system (Universal Resource & Booking Engine)
- **Goal**: Simplify term membership booking from tedious multi-step to smart pattern-based
- **Current Phase**: Implementation complete, testing needed
- **Next Phase**: Deploy, monitor, then build Member Scheduling Hub

## Recovery Instructions

If context is lost, this feature implements a "schedule Week 1, replicate pattern" approach for term memberships. The core logic lives in the brain-core backend service layer, with a React UI in the yoga-stenungsund frontend. The system respects configurable rules per membership type and handles conflicts intelligently.