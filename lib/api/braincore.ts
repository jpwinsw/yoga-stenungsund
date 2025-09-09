import axios, { AxiosError } from 'axios'
import type {
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
  CreditHistoryEntry,
  MemberCreditDetails,
  SubscriptionActionResponse,
  BookingReceipt,
  SubscriptionReceipt,
  ReceiptsSummary
} from '@/lib/types/braincore'

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || '5'

// Setup axios interceptor for 401 handling
axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Skip interceptor for authentication endpoints
      // These endpoints handle their own 401 errors
      const authEndpoints = [
        '/auth/login',
        '/auth/signup',
        '/auth/magic-link',
        '/auth/reset-password',
        '/auth/check-email'
      ];
      
      const isAuthEndpoint = authEndpoints.some(endpoint => 
        error.config?.url?.includes(endpoint)
      );
      
      if (!isAuthEndpoint) {
        // Only handle 401s from protected endpoints (session expired)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('member_token')
          localStorage.removeItem('member_data')
          localStorage.removeItem('session_expires_at')
          
          // Dispatch auth logout event
          window.dispatchEvent(new Event('auth-logout'))
          
          // Redirect to login with return URL
          const currentPath = window.location.pathname
          const returnUrl = encodeURIComponent(currentPath)
          
          // Check if we're already on a login-related page to avoid redirect loops
          if (!currentPath.includes('/schema') && !currentPath.includes('/login')) {
            window.location.href = `/schema?sessionExpired=true&returnUrl=${returnUrl}`
          }
        }
      }
    }
    return Promise.reject(error)
  }
)

export const braincoreAPI = {
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
  private token: string | null = null
  private member: Member | null = null

  constructor() {
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
    // Add Accept-Language header based on current locale
    if (typeof window !== 'undefined') {
      const locale = document.documentElement.lang || 'en'
      headers['Accept-Language'] = locale
    }
    return headers
  }

  setToken(token: string, expiresIn?: number) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('member_token', token)
      
      // Store expiration time (default 30 days if not provided)
      const expirationMs = expiresIn || 30 * 24 * 60 * 60 * 1000 // 30 days in ms
      const expiresAt = new Date(Date.now() + expirationMs).toISOString()
      localStorage.setItem('session_expires_at', expiresAt)
    }
  }

  clearToken() {
    this.token = null
    this.member = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('member_token')
      localStorage.removeItem('member_data')
      localStorage.removeItem('session_expires_at')
      // Dispatch a custom event to notify all components about logout
      window.dispatchEvent(new Event('auth-logout'))
    }
  }
  
  getMember(): Member | null {
    return this.member
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

  async validateDiscountCode(data: {
    code: string
    membership_plan_id?: number
    service_id?: number
    amount: number
    company_id?: number
  }): Promise<{
    valid: boolean
    discount_amount: number
    final_amount: number
    discount_type: string
    discount_value: number
    message?: string
  }> {
    // Use our API route to avoid CORS issues
    const response = await axios.post(
      `/api/braincore/discount/validate`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
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
    discount_code?: string
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

  async checkEmailExists(email: string): Promise<{ exists: boolean; has_password: boolean }> {
    const response = await axios.post(
      `/api/braincore/auth/check-email`,
      {
        email,
        company_id: parseInt(process.env.NEXT_PUBLIC_COMPANY_ID || '5')
      }
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
    
    // Set token using session_token field (30 days expiry)
    this.setToken(loginData.session_token, 30 * 24 * 60 * 60 * 1000)
    
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
    if (!this.token) return false
    
    // Check if session has expired
    if (typeof window !== 'undefined') {
      const expiresAt = localStorage.getItem('session_expires_at')
      if (expiresAt) {
        const expirationDate = new Date(expiresAt)
        if (expirationDate < new Date()) {
          // Session has expired, clear it
          this.clearToken()
          return false
        }
      }
    }
    
    return true
  }
  
  getSessionExpiresAt(): Date | null {
    if (typeof window !== 'undefined') {
      const expiresAt = localStorage.getItem('session_expires_at')
      if (expiresAt) {
        return new Date(expiresAt)
      }
    }
    return null
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

  async createMembershipCheckout(
    planId: number, 
    discountCode?: string,
    receiptDetails?: {
      personal_number?: string
      street_address?: string
      postal_code?: string
      city?: string
      company_name?: string
      vat_number?: string
    }
  ): Promise<{
    checkout_session_id: string
    checkout_url: string
    publishable_key: string
  }> {
    const currentUrl = window.location.origin
    const successUrl = `${currentUrl}/medlemskap/tack?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${currentUrl}/medlemskap?canceled=true`
    
    const response = await axios.post(
      `/api/braincore/membership/checkout`,
      {
        plan_id: planId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        ...(discountCode && { discount_code: discountCode }),
        ...(receiptDetails && { receipt_details: receiptDetails })
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
    discount_code?: string
    receipt_details?: {
      personal_number?: string
      street_address?: string
      postal_code?: string
      city?: string
      company_name?: string
      vat_number?: string
    }
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

  async cancelTermBooking(bookingId: number): Promise<{ success: boolean; message: string }> {
    // Use our API route to avoid CORS issues  
    // Note: Must include trailing slash due to Next.js trailingSlash config
    const response = await axios.post(
      `/api/braincore/member/term-bookings/${bookingId}/cancel/`,
      {},
      { 
        headers: this.getHeaders(),
        maxRedirects: 5 // Ensure axios follows redirects
      }
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

  async getCreditDetails(): Promise<MemberCreditDetails> {
    // Use our API route to get comprehensive credit breakdown
    const response = await axios.get(
      `/api/braincore/member/credits/details`,
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

  async getMemberBookingReceipts(): Promise<BookingReceipt[]> {
    const response = await axios.get(
      `/api/braincore/member/receipts/bookings`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getMemberSubscriptionReceipts(): Promise<SubscriptionReceipt[]> {
    const response = await axios.get(
      `/api/braincore/member/receipts/subscriptions`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getReceiptsSummary(): Promise<ReceiptsSummary> {
    const response = await axios.get(
      `/api/braincore/member/receipts/summary`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async applyWeeklyPattern(data: {
    plan_id: number
    selected_template_id: number
    weekly_pattern: Array<{
      dayOfWeek: number
      time: string
      sessionId: number
      templateId: number
    }>
    term_weeks: number
    auto_resolve_conflicts?: boolean
  }): Promise<{
    scheduled_sessions: number[]
    total_scheduled: number
    required_total: number
    conflicts: Array<{
      week: number
      missing_slots: Array<{
        dayOfWeek: number
        time: string
      }>
      alternatives: ScheduleSession[]
    }>
  }> {
    const response = await axios.post(
      '/api/braincore/pattern-booking',
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getAggregatedSessions(
    templateIds: number[],
    startDate: string,
    endDate: string
  ): Promise<ScheduleSession[]> {
    const response = await axios.get(
      `/api/braincore/pattern-booking?template_ids=${templateIds.join(',')}&start_date=${startDate}&end_date=${endDate}`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async downloadReceiptPDF(documentNumber: string): Promise<Blob> {
    const response = await axios.get(
      `/api/braincore/member/receipts/download/${documentNumber}`,
      { 
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    )
    return response.data
  }
}

export const braincore = new BraincoreClient()