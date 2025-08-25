export interface Company {
  id: number
  name: string
  logo?: string
  description?: string
  contact_info?: {
    email?: string
    phone?: string
    address?: string
  }
}

export interface ScheduleSession {
  id: number
  title: string
  service_template_id: number
  service_template_name: string
  start_time: string
  end_time: string
  instructor_id: number
  instructor_name: string
  resource_id: number
  resource_name: string
  capacity: number
  bookings: number
  available_spots: number
  drop_in_price: number | null
  member_price: number | null
  tags: string[]
  status?: 'active' | 'cancelled' | 'full'
  user_booked?: boolean
}

export interface Service {
  id: number
  name: string
  description?: string
  duration_minutes: number
  max_participants?: number
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'all_levels'
  image_url?: string
  category?: string
}

export interface Instructor {
  id: number
  name: string
  bio?: string
  photo_url?: string
  photo_variants?: Record<string, string>  // Variant key to URL mapping for optimized images
  image_url?: string  // Keep for backward compatibility
  title?: string
  first_name?: string
  last_name?: string
  email?: string
  
  // Professional qualifications - can be strings or objects with translations
  certifications?: Array<string | { code: string; display_name: string }>
  specialties?: Array<string | { code: string; display_name: string }>
  years_experience?: number
  teaching_philosophy?: string
  professional_background?: string
  languages_spoken?: string[]
  
  // Social media presence
  social_media?: {
    instagram?: string
    facebook?: string
    linkedin?: string
    youtube?: string
    tiktok?: string
    website?: string
    other?: Record<string, string>
  }
  
  // Media assets
  media?: {
    video_introduction?: string
    gallery?: string[]
  }
  
  // Student engagement
  testimonials?: Array<{
    text: string
    author: string
    date: string
  }>
  featured_services?: number[]
  style_tags?: string[]
}

export interface MembershipPlan {
  id: number
  name: string
  description?: string
  price: number
  currency: string
  billing_period: 'monthly' | 'quarterly' | 'yearly' | 'one_time' | 'term'
  benefits?: string[]
  limitations?: string[]
  
  // Term-based membership fields
  is_term_based?: boolean
  term_duration_days?: number
  allowed_service_templates?: number[]
  sessions_per_week?: number
}

export interface BookingRequest {
  session_id: number
  contact_id: number
  payment_method?: string
  join_waitlist?: boolean
  payment_intent_id?: string
  use_credits?: boolean
  discount_code?: string
}

export interface BookingResponse {
  booking_id: number
  confirmation_code: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'waitlisted'
  payment_required?: boolean
  payment_amount?: number
  session_details: {
    title: string
    start_time: string
    end_time: string
    instructor_name: string | null
    location: string | null
    waitlist_position?: number
    already_on_waitlist?: boolean
  }
}

export interface Member {
  id: number
  contact_id: number
  email: string
  first_name: string
  last_name: string
  phone?: string
  membership_plan_id?: number
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  session_token: string
  member_id: number
  contact_id: number
  email: string
  first_name: string
  last_name: string
  is_verified: boolean
  has_existing_bookings?: boolean
  existing_bookings_count?: number
}

export interface SignupRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

export interface ApiError {
  error: string
  message: string
  status_code: number
}

export interface BookingOptions {
  availability: {
    available_spots: number
  }
  booking_options: Array<{
    title: string
    description: string
    action: string
    type?: string
    credits_required?: number
    price?: number
    currency?: string
    available?: boolean
  }>
  user_info?: {
    available_credits?: number
  }
}

export interface MemberProfile {
  id: number
  member_id: number
  email: string
  first_name: string
  last_name: string
  phone?: string
  date_of_birth?: string
  address?: string
  city?: string
  country?: string
  created_at: string
  is_verified: boolean
}

export interface MemberBooking {
  booking_id: number
  session_id: number
  session_title: string
  session_start: string
  session_end: string
  instructor_name: string | null
  location: string | null
  status: 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'no_show'
  booking_date: string
  confirmation_code: string
  checked_in_at: string | null
  amount_paid: number
  special_requests: string | null
}

export interface MemberSubscription {
  subscription_id: number
  plan_name: string
  plan_type: string
  status: string
  start_date: string
  end_date?: string
  next_billing_date?: string
  current_credits?: number
  credits_used_this_period?: number
  price: number
  benefits?: string[]
}

export interface MemberWaitlistEntry {
  id: number
  position: number
  session?: {
    id: number
    service_template?: {
      name: string
    }
    start_time: string
    end_time: string
    instructor?: {
      name: string
    }
    resource?: {
      name: string
    }
  }
  created_at: string
}

export interface GuestBookingRequest {
  session_id: number
  guest_info: {
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
  payment_intent_id?: string
  discount_code?: string
}

export interface CreatePaymentIntentRequest {
  session_id: number
  amount: number
  contact_id?: number
  guest_info?: {
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
}

export interface CreatePaymentIntentResponse {
  client_secret: string
  publishable_key: string
  amount: number
}

export interface CommunitySpace {
  id: number
  name: string
  slug: string
  description: string
  space_type: 'public' | 'team' | 'partner' | 'vip'
  member_count: number
  post_count: number
  is_active: boolean
  welcome_message?: string
  rules?: string
}

export interface CommunityProfile {
  id: number
  display_name: string
  email?: string
  avatar_url?: string
  bio?: string
  total_points: number
  current_level: number
  current_tier?: {
    id: number
    name: string
    level: number
    description?: string
    badge_url?: string
    perks?: string[]
  }
}

export interface CommunityPostResponse {
  posts: Array<{
    id: number
    space_id: number
    author_id: number
    author: {
      display_name: string
      avatar_url?: string
      tier?: {
        id: number
        name: string
        level: number
        description?: string
        badge_url?: string
        perks?: string[]
      }
    }
    title?: string
    content: string
    post_type: 'standard' | 'announcement' | 'question' | 'achievement' | 'event'
    is_pinned: boolean
    is_locked: boolean
    like_count: number
    comment_count: number
    user_has_liked?: boolean
    created_at: string
    updated_at: string
  }>
}

export interface CommunityComment {
  id: number
  post_id: number
  author_id: number
  author: {
    display_name: string
    avatar_url?: string
    tier?: {
      id: number
      name: string
      level: number
      description?: string
      badge_url?: string
      perks?: string[]
    }
  }
  content: string
  like_count: number
  user_has_liked?: boolean
  created_at: string
  updated_at: string
}

// Term Availability Response
export interface TermAvailability {
  term_start: string
  term_end: string
  total_weeks: number
  sessions_per_week: number
  total_required_sessions: number
  available_slots_by_week: Record<string, Array<{
    session_id: number
    date: string
    start_time: string
    end_time: string
    instructor_name: string
    available_spots: number
  }>>
}

// Recovery Credit
export interface RecoveryCredit {
  id: number
  credit_type: string
  amount: number
  expires_at: string
  source: string
  used: boolean
  created_at: string
}

// Credit History Entry
export interface CreditHistoryEntry {
  transaction_id: number  // Changed from 'id' to match backend response
  transaction_type: 'credit' | 'debit'
  amount: number
  description: string
  created_at: string
  balance_after: number
  booking_id?: number  // Optional booking reference
}

// Subscription Action Response
export interface SubscriptionActionResponse {
  success: boolean
  message: string
  subscription?: MemberSubscription
}

// Receipt Types
export interface Receipt {
  document_number: string
  document_type: string
  pdf_available: boolean
  created_at: string
}

export interface BookingReceipt {
  booking_id: number
  session_id: number
  booking_date: string
  status: string
  payment_status: string
  confirmation_code: string
  amount: number
  currency: string
  payment_method: string | null
  payment_date: string | null
  receipt: Receipt | null
}

export interface SubscriptionReceipt {
  subscription_id: number
  plan_id: number
  billing_period: string
  start_date: string
  end_date: string | null
  amount: number
  currency: string
  payment_method: string
  payment_date: string | null
  receipt: Receipt | null
}

export interface ReceiptsSummary {
  total_bookings: number
  total_transactions: number
  total_spent: number
  currency: string
  receipts_available: number
  oldest_receipt: string | null
  latest_receipt: string | null
}