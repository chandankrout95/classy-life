
export interface Post {
  id?: string;
  imageUrl: string;
  imageHint: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  caption?: string;
  type: 'image' | 'reel';
  saves?: number;
  watchTime?: string;
  interactions?: number;
  profileActivity?: number;
  viewsBreakdown?: {
    instagram: number;
    facebook: number;
  };
  timeseries?: TimeSeriesData[];
  audienceBreakdown?: {
    followers: number;
    nonFollowers: number;
  };
  genderBreakdown?: {
    men: number;
    women: number;
  };
  ageBreakdown?: {
    range: string;
    percentage: number;
  }[];
  countryBreakdown?: { name: string; percentage: number; }[];
  topCities?: { name: string, percentage: number }[];
  viewSources?: {
    source: string;
    percentage: number;
  }[];
  accountsReached?: number;
  retentionData?: RetentionData[];
  skipRate?: number;
  typicalSkipRate?: number | string;
  avgWatchTime?: number;
  interactionsBreakdown?: {
    followers: number;
    nonFollowers: number;
  };
  accountsEngaged?: number;
  follows?: number;
  createdAt?: string;
  viewRate?: number;
  reposts?: number;
  likesOverTime?: { timestamp: number; retention: number }[];
  // This is a temporary property for AI actions
  metrics?: Metric;
}

export interface UserProfileData {
  id: string; // Firebase UID
  username: string;
  email: string;
  avatarUrl: string;
  avatarHint: string;
  stats: {
    posts: number;
    followers: string;
    following: number;
    topCountries?: { name: string, percentage: number }[];
    topCities?: { name: string, percentage: number }[];
    topAgeRanges?: { name: string, percentage: number }[];
    genderBreakdown?: { name: string, percentage: number }[];
    profileActivity?: {
        total: number;
        change: number;
        vsDate: string;
        visits: { total: number; change: number };
        linkTaps: { total: number; changeText: string };
    };
    viewsBreakdown?: { name: string; value: number; color: string }[];
    totalViews?: number;
    accountsReached?: { value: number; change: number };
    dateRangeText?: string;
  };
  name: string;
  bio: string[];
  link?: string;
  professionalDashboard: {
    views: string;
  };
  posts: Post[];
}

export interface TimeSeriesData {
  date: string;
  views: number;
}

export interface RetentionData {
  timestamp: number;
  retention: number;
}

export interface CountryData {
  country: string;
  views: number;
}

export interface Metric {
  views: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  reach: number;
  impressions: number;
  avg_watch_time: number;
}

export type MetricKey = keyof Metric;


export interface VideoInsight {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  metrics: Metric;
  timeseries: TimeSeriesData[];
  countryBreakdown: { country: string; views: number }[];
  lastEdited: string;
  isDemo: boolean;
}
