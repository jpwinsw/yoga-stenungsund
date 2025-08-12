import axios from 'axios'
import type {
  Company,
  ScheduleSession,
  Service,
  Instructor,
  MembershipPlan,
  BookingRequest,
  BookingResponse,
  GuestBookingRequest,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  Member,
  BookingOptions,
  MemberProfile,
  MemberBooking,
  MemberSubscription,
  MemberWaitlistEntry,
  CommunitySpace,
  CommunityProfile,
  CommunityPostResponse,
  CommunityComment,
  TermAvailability,
  RecoveryCredit,
  CreditHistoryEntry,
  SubscriptionActionResponse
} from '@/lib/types/braincore'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || '5'

export const braincoreAPI = {
  getCompany: () => `/api/company/${COMPANY_ID}`,
  getSchedule: (startDate: string, endDate: string) =>
    `/public/urbe/schedule/${COMPANY_ID}?start_date=${startDate}&end_date=${endDate}`,
  getServices: () => `/public/urbe/services/${COMPANY_ID}`,
  getInstructors: () => `/public/urbe/instructors/${COMPANY_ID}`,
  getMembershipPlans: () => `/public/urbe/memberships/${COMPANY_ID}`,
  getBookingOptions: (sessionId: number, contactId?: number) =>
    `/public/urbe/session/${sessionId}/booking-options${contactId ? `?contact_id=${contactId}` : ''}`,
  createBooking: () => `/public/book-session`,
  memberLogin: () => `/member-portal/login`,
  memberSignup: () => `/member-portal/signup`,
}

class BraincoreClient {
  private baseURL: string
  private token: string | null = null
  private member: Member | null = null

  constructor() {
    this.baseURL = BRAINCORE_API
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('member_token')
      const memberData = localStorage.getItem('member_data')
      if (memberData) {
        try {
          this.member = JSON.parse(memberData)
        } catch (e) {
          console.error('Failed to parse member data:', e)
        }
      }
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }
    return headers
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('member_token', token)
    }
  }

  clearToken() {
    this.token = null
    this.member = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('member_token')
      localStorage.removeItem('member_data')
    }
  }
  
  getMember(): Member | null {
    return this.member
  }

  async getCompany(): Promise<Company> {
    const response = await axios.get(
      `${this.baseURL}${braincoreAPI.getCompany()}`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getSchedule(startDate: string, endDate: string): Promise<ScheduleSession[]> {
    // Use our API route to avoid CORS issues
    const member = this.getMember()
    const contactId = member?.contact_id
    
    const response = await axios.get(
      `/api/braincore/schedule?start_date=${startDate}&end_date=${endDate}${contactId ? `&contact_id=${contactId}` : ''}`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getServices(ids?: number[]): Promise<Service[]> {
    // Use our API route to avoid CORS issues
    let url = `/api/braincore/services`
    if (ids && ids.length > 0) {
      url += `?ids=${ids.join(',')}`
    }
    const response = await axios.get(url, { headers: this.getHeaders() })
    return response.data
  }

  async getInstructors(): Promise<Instructor[]> {
    // Use our API route to avoid CORS issues
    const response = await axios.get(
      `/api/braincore/instructors`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getMembershipPlans(): Promise<MembershipPlan[]> {
    // Use our API route to avoid CORS issues
    const response = await axios.get(
      `/api/braincore/memberships`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getBookingOptions(sessionId: number, locale: string = 'en'): Promise<BookingOptions> {
    const member = this.getMember()
    const contactId = member?.contact_id
    
    // Build query params
    const params = new URLSearchParams()
    if (contactId) params.append('contact_id', contactId.toString())
    params.append('locale', locale)
    
    // Use our API route to avoid CORS issues
    const response = await axios.get(
      `/api/braincore/urbe/session/${sessionId}/booking-options?${params.toString()}`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async createBooking(data: BookingRequest | {
    session_id: number
    guest_info?: {
      first_name: string
      last_name: string
      email: string
      phone?: string
    }
  }): Promise<BookingResponse> {
    // Use our API route to avoid CORS issues
    const response = await axios.post(
      `/api/braincore/bookings`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async createGuestBooking(data: GuestBookingRequest): Promise<BookingResponse> {
    // Use our API route to avoid CORS issues
    const response = await axios.post(
      `/api/braincore/guest-bookings`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getMemberBookings(): Promise<MemberBooking[]> {
    // Use our API route to avoid CORS issues
    const response = await axios.get(
      `/api/braincore/member/bookings`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async cancelBooking(bookingId: number): Promise<void> {
    // Use our API route to avoid CORS issues
    await axios.post(
      `/api/braincore/member/bookings/${bookingId}/cancel`,
      {},
      { headers: this.getHeaders() }
    )
  }

  async getMemberWaitlist(): Promise<MemberWaitlistEntry[]> {
    // Use our API route to avoid CORS issues
    const response = await axios.get(
      `/api/braincore/member/waitlist`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getMemberProfile(): Promise<MemberProfile> {
    const response = await axios.get(
      `/api/braincore/member/profile`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async updateMemberProfile(data: {
    first_name?: string
    last_name?: string
    phone?: string
    address?: string
    city?: string
    country?: string
  }): Promise<MemberProfile> {
    const response = await axios.put(
      `/api/braincore/member/profile`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getMemberSubscriptions(): Promise<MemberSubscription[]> {
    const response = await axios.get(
      `/api/braincore/member/subscriptions`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async leaveWaitlist(entryId: number): Promise<void> {
    await axios.post(
      `/api/braincore/member/waitlist/${entryId}/leave`,
      {},
      { headers: this.getHeaders() }
    )
  }

  async createPaymentIntent(data: {
    company_id: number
    amount: number
    currency?: string
    description: string
    entity_type: string
    entity_id: number
    customer_email?: string
    customer_name?: string
    is_guest?: boolean
  }): Promise<{
    payment_intent_id: string
    client_secret: string
    amount: number
    currency: string
    status: string
    publishable_key: string
  }> {
    // For guest payments, don't send auth headers
    const headers = data.is_guest 
      ? { 'Content-Type': 'application/json' }
      : this.getHeaders()
    
    const response = await axios.post(
      `/api/braincore/payments/create-intent`,
      data,
      { headers }
    )
    return response.data
  }

  async confirmPayment(data: {
    payment_intent_id: string
    payment_method_id?: string
  }): Promise<{ success: boolean }> {
    const response = await axios.post(
      `/api/braincore/payments/confirm`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getPaymentStatus(paymentIntentId: string): Promise<{
    payment_intent_id: string
    status: string
    amount: number
    currency: string
    created_at: string
    completed_at?: string
    error_message?: string
  }> {
    const response = await axios.get(
      `/api/braincore/payments/status/${paymentIntentId}`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    // Use our API route to avoid CORS issues
    const response = await axios.post(
      `/api/braincore/auth/login`,
      data,
      { headers: this.getHeaders() }
    )
    const loginData = response.data
    
    // Set token using session_token field
    this.setToken(loginData.session_token)
    
    // Store member data by reconstructing Member object from response
    this.member = {
      id: loginData.member_id,
      contact_id: loginData.contact_id,
      email: loginData.email,
      first_name: loginData.first_name,
      last_name: loginData.last_name,
      created_at: new Date().toISOString()
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('member_data', JSON.stringify(this.member))
    }
    
    return loginData
  }

  async signup(data: SignupRequest): Promise<Member> {
    // Use our API route to avoid CORS issues
    const response = await axios.post(
      `/api/braincore/auth/signup`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async logout() {
    this.clearToken()
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  // Community Methods
  async getCommunitySpaces(): Promise<CommunitySpace[]> {
    const response = await axios.get(
      `/api/braincore/community/spaces/`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getCommunityProfile(): Promise<CommunityProfile> {
    const response = await axios.get(
      `/api/braincore/community/profile/`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async updateCommunityProfile(data: {
    display_name?: string
    bio?: string
    avatar_url?: string
  }): Promise<CommunityProfile> {
    const response = await axios.patch(
      `/api/braincore/community/profile`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getCommunityPosts(spaceId: number, page = 1): Promise<CommunityPostResponse> {
    const response = await axios.get(
      `/api/braincore/community/spaces/${spaceId}/posts?page=${page}`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async createCommunityPost(spaceId: number, data: {
    title?: string
    content: string
    post_type?: string
  }): Promise<{ id: number }> {
    const response = await axios.post(
      `/api/braincore/community/spaces/${spaceId}/posts`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async likeCommunityPost(spaceId: number, postId: number): Promise<void> {
    await axios.post(
      `/api/braincore/community/spaces/${spaceId}/posts/${postId}/like`,
      {},
      { headers: this.getHeaders() }
    )
  }

  async getPostComments(spaceId: number, postId: number): Promise<CommunityComment[]> {
    const response = await axios.get(
      `/api/braincore/community/spaces/${spaceId}/posts/${postId}/comments`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async createComment(spaceId: number, postId: number, content: string): Promise<CommunityComment> {
    const response = await axios.post(
      `/api/braincore/community/spaces/${spaceId}/posts/${postId}/comments`,
      { content },
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async createMembershipCheckout(planId: number): Promise<{
    checkout_session_id: string
    checkout_url: string
    publishable_key: string
  }> {
    const currentUrl = window.location.origin
    const successUrl = `${currentUrl}/medlemskap/tack`
    const cancelUrl = `${currentUrl}/medlemskap`
    
    const response = await axios.post(
      `/api/braincore/membership/checkout`,
      {
        plan_id: planId,
        success_url: successUrl,
        cancel_url: cancelUrl
      },
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getTermAvailability(
    planId: number, 
    serviceTemplateId: number, 
    startDate: string
  ): Promise<TermAvailability> {
    // Use our API route to avoid CORS issues
    const response = await axios.get(
      `/api/braincore/term-availability/${planId}/${serviceTemplateId}?start_date=${encodeURIComponent(startDate)}`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async createTermMembershipCheckout(data: {
    plan_id: number
    selected_service_template_id: number
    term_start_date: string
    pre_booked_sessions: Array<{
      session_id: number
      date: Date
      time: string
    }>
    success_url: string
    cancel_url: string
  }): Promise<{
    checkout_session_id: string
    checkout_url: string
    publishable_key: string
  }> {
    // Use our API route to avoid CORS issues
    const response = await axios.post(
      `/api/braincore/term-checkout`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getRecoveryCredits(): Promise<RecoveryCredit[]> {
    const response = await axios.get(
      `${this.baseURL}/api/urbe/member-portal/recovery-credits`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async cancelTermBooking(bookingId: number): Promise<{ success: boolean; message: string }> {
    const response = await axios.post(
      `${this.baseURL}/api/urbe/term-membership/cancel-term-booking/${bookingId}`,
      {},
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getCreditHistory(): Promise<CreditHistoryEntry[]> {
    // Use our API route to avoid CORS issues
    const response = await axios.get(
      `/api/braincore/member/credits/history`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async pauseSubscription(subscriptionId: number): Promise<SubscriptionActionResponse> {
    // Use our API route to avoid CORS issues
    const response = await axios.post(
      `/api/braincore/member/subscriptions/${subscriptionId}/pause`,
      {},
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async resumeSubscription(subscriptionId: number): Promise<SubscriptionActionResponse> {
    // Use our API route to avoid CORS issues
    const response = await axios.post(
      `/api/braincore/member/subscriptions/${subscriptionId}/resume`,
      {},
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async cancelSubscription(subscriptionId: number): Promise<SubscriptionActionResponse> {
    // Use our API route to avoid CORS issues
    const response = await axios.post(
      `/api/braincore/member/subscriptions/${subscriptionId}/cancel`,
      {},
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async confirmBookingPayment(bookingId: number, paymentIntentId: string): Promise<BookingResponse> {
    // Public endpoint for confirming guest booking payment
    const response = await axios.post(
      `/api/braincore/bookings-confirm/${bookingId}/`,
      { payment_intent_id: paymentIntentId }
    )
    return response.data
  }
}

export const braincore = new BraincoreClient()