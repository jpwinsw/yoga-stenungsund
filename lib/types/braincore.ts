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
  certifications?: string[]
  specialties?: string[]
  image_url?: string
  years_experience?: number
}

export interface MembershipPlan {
  id: number
  name: string
  description?: string
  price: number
  currency: string
  billing_period: 'monthly' | 'quarterly' | 'yearly' | 'one_time'
  benefits?: string[]
  limitations?: string[]
}

export interface BookingRequest {
  session_id: number
  member_id: number
  payment_method?: string
}

export interface BookingResponse {
  id: number
  booking_reference: string
  session_id: number
  member_id: number
  status: 'confirmed' | 'pending' | 'cancelled'
  created_at: string
}

export interface Member {
  id: number
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
  token: string
  member: Member
  expires_at: string
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