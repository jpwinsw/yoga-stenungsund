// Community types that can be shared across different company sites
export interface CommunitySpace {
  id: number;
  name: string;
  slug: string;
  description: string;
  space_type: 'public' | 'team' | 'partner' | 'vip';
  member_count: number;
  post_count: number;
  is_active: boolean;
  welcome_message?: string;
  rules?: string;
}

export interface CommunityMember {
  id: number;
  space_id: number;
  crm_contact_id: number;
  display_name: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  role: 'member' | 'moderator' | 'admin' | 'owner';
  is_active: boolean;
  is_verified: boolean;
  total_points: number;
  current_level: number;
  current_tier?: CommunityTier;
  joined_at: string;
  last_seen_at?: string;
}

export interface CommunityTier {
  id: number;
  name: string;
  level: number;
  description?: string;
  badge_url?: string;
  perks?: string[];
}

export interface CommunityPost {
  id: number;
  space_id: number;
  author_id: number;
  author: {
    display_name: string;
    avatar_url?: string;
    tier?: CommunityTier;
  };
  title?: string;
  content: string;
  post_type: 'standard' | 'announcement' | 'question' | 'achievement' | 'event';
  is_pinned: boolean;
  is_locked: boolean;
  like_count: number;
  comment_count: number;
  user_has_liked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: number;
  post_id: number;
  author_id: number;
  author: {
    display_name: string;
    avatar_url?: string;
    tier?: CommunityTier;
  };
  content: string;
  like_count: number;
  user_has_liked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityAuth {
  member: CommunityMember;
  spaces: CommunitySpace[];
  token?: string;
}