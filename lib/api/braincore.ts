import axios from 'axios'
import type {
  Company,
  ScheduleSession,
  Service,
  Instructor,
  MembershipPlan,
  BookingRequest,
  BookingResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  Member
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
  createBooking: () => `/public/urbe/bookings`,
  memberLogin: () => `/public/members/login`,
  memberSignup: () => `/public/members/signup`,
}

class BraincoreClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = BRAINCORE_API
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('member_token')
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('member_token')
    }
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
    const response = await axios.get(
      `/api/braincore/schedule?start_date=${startDate}&end_date=${endDate}`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getServices(): Promise<Service[]> {
    // Use our API route to avoid CORS issues
    const response = await axios.get(
      `/api/braincore/services`,
      { headers: this.getHeaders() }
    )
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

  async createBooking(data: BookingRequest): Promise<BookingResponse> {
    const response = await axios.post(
      `${this.baseURL}${braincoreAPI.createBooking()}`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await axios.post(
      `${this.baseURL}${braincoreAPI.memberLogin()}`,
      data,
      { headers: this.getHeaders() }
    )
    const loginData = response.data
    this.setToken(loginData.token)
    return loginData
  }

  async signup(data: SignupRequest): Promise<Member> {
    const response = await axios.post(
      `${this.baseURL}${braincoreAPI.memberSignup()}`,
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
}

export const braincore = new BraincoreClient()