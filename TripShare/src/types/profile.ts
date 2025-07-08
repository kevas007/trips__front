export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  verified: boolean;
  isFollowing?: boolean;
} 