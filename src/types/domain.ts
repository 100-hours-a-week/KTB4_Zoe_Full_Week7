export type AuthStatus = "unknown" | "authenticated" | "guest";

export type CurrentUser = {
  userId: number | null;
  nickname: string;
  email: string;
  profileImage: string | null;
};

export type ApiEnvelope<T> = {
  data: T;
  message?: string;
};

export type ApiErrorData = Record<string, string | string[] | undefined>;

export type ApiError = Error & {
  status?: number;
  code?: string;
  data?: ApiErrorData;
};

export type Writer = {
  user_id?: number;
  id?: number;
  nickname?: string;
  profile_image?: string | null;
  profileImage?: string | null;
};

export type PollOption = {
  option_id: number;
  content: string;
};

export type PollResultOption = {
  option_id: number;
  vote_count: number;
  vote_rate: string;
};

export type Poll = {
  poll_id: number;
  options: PollOption[];
  has_voted: boolean;
  total_vote_count: number;
  selected_option_id?: number;
  result?: {
    total_vote_count?: number;
    options: PollResultOption[];
  };
};

export type PollVoteResponse = {
  poll_id: number;
  selected_option_id: number;
  result: {
    total_vote_count: number;
    options: PollResultOption[];
  };
};

export type Post = {
  post_id?: number;
  id?: number;
  title: string;
  content?: string;
  created_at?: string;
  createdAt?: string;
  writer?: Writer;
  user_id?: number;
  userId?: number;
  author_id?: number;
  authorId?: number;
  image_urls?: string[];
  imageUrls?: string[];
  like_count?: number;
  likeCount?: number;
  comment_count?: number;
  commentCount?: number;
  view_count?: number;
  viewCount?: number;
  is_liked?: boolean;
  liked?: boolean;
  poll?: Poll;
};

export type PostsPageData = {
  posts: Post[];
  next_cursor: string | number | null;
  has_next: boolean;
};

export type Comment = {
  comment_id?: number;
  id?: number;
  user_id?: number;
  userId?: number;
  nickname?: string;
  profile_image?: string | null;
  profileImage?: string | null;
  content: string;
  created_at?: string;
  createdAt?: string;
};

export type CommentPagination = {
  page: number;
  has_next: boolean;
};

export type CommentsPageData = {
  comments: Comment[];
  pagination: CommentPagination;
};

export type LikeResponse = {
  is_liked?: boolean;
  liked?: boolean;
  like_count?: number;
  likeCount?: number;
};
