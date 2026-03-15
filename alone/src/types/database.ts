export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
        };
      };
      statuses: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          started_at: string;
          ended_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          content: string;
          started_at?: string;
          is_active?: boolean;
        };
        Update: {
          content?: string;
          ended_at?: string | null;
          is_active?: boolean;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
        };
        Update: never;
      };
      stories: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          image_url: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          content: string;
          image_url?: string | null;
          expires_at?: string;
        };
        Update: {
          content?: string;
          image_url?: string | null;
        };
      };
      work_together_requests: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          status_id: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          sender_id: string;
          receiver_id: string;
          status_id: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Status = Database['public']['Tables']['statuses']['Row'];
export type Follow = Database['public']['Tables']['follows']['Row'];
export type Story = Database['public']['Tables']['stories']['Row'];
export type WorkTogetherRequest = Database['public']['Tables']['work_together_requests']['Row'];

// Joined types for display
export type StatusWithProfile = Status & {
  profiles: Profile;
};

export type StoryWithProfile = Story & {
  profiles: Profile;
};

export type WorkTogetherRequestWithProfiles = WorkTogetherRequest & {
  sender: Profile;
  statuses: Status;
};
