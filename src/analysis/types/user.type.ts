export interface User {
  id: number;
  id_str: string;
  name: string;
  screen_name: string;
  location: string;
  description: string;
  url: string;
  entities: Entities;
  protected: boolean;
  followers_count: number;
  friends_count: number;
  listed_count: number;
  created_at: string;
  favourites_count: number;
  utc_offset?: any;
  time_zone?: any;
  geo_enabled: boolean;
  verified: boolean;
  statuses_count: number;
  lang?: any;
  status: Status;
  contributors_enabled: boolean;
  is_translator: boolean;
  is_translation_enabled: boolean;
  profile_background_color: string;
  profile_background_image_url: string;
  profile_background_image_url_https: string;
  profile_background_tile: boolean;
  profile_image_url: string;
  profile_image_url_https: string;
  profile_banner_url: string;
  profile_link_color: string;
  profile_sidebar_border_color: string;
  profile_sidebar_fill_color: string;
  profile_text_color: string;
  profile_use_background_image: boolean;
  has_extended_profile: boolean;
  default_profile: boolean;
  default_profile_image: boolean;
  following: boolean;
  live_following: boolean;
  follow_request_sent: boolean;
  notifications: boolean;
  muting: boolean;
  blocking: boolean;
  blocked_by: boolean;
  translator_type: string;
}

interface Status {
  created_at: string;
  id: number;
  id_str: string;
  text: string;
  truncated: boolean;
  entities: Entities2;
  extended_entities: Extendedentities;
  source: string;
  in_reply_to_status_id?: any;
  in_reply_to_status_id_str?: any;
  in_reply_to_user_id?: any;
  in_reply_to_user_id_str?: any;
  in_reply_to_screen_name?: any;
  geo?: any;
  coordinates?: any;
  place?: any;
  contributors?: any;
  is_quote_status: boolean;
  retweet_count: number;
  favorite_count: number;
  favorited: boolean;
  retweeted: boolean;
  possibly_sensitive: boolean;
  lang: string;
}

interface Extendedentities {
  media: Media[];
}

interface Entities2 {
  hashtags: any[];
  symbols: any[];
  user_mentions: any[];
  urls: any[];
  media: Media[];
}

interface Media {
  id: number;
  id_str: string;
  indices: number[];
  media_url: string;
  media_url_https: string;
  url: string;
  display_url: string;
  expanded_url: string;
  type: string;
  sizes: Sizes;
}

interface Sizes {
  thumb: Thumb;
  large: Thumb;
  small: Thumb;
  medium: Thumb;
}

interface Thumb {
  w: number;
  h: number;
  resize: string;
}

interface Entities {
  url: Url2;
  description: Description;
}

interface Description {
  urls: any[];
}

interface Url2 {
  urls: Url[];
}

interface Url {
  url: string;
  expanded_url: string;
  display_url: string;
  indices: number[];
}
