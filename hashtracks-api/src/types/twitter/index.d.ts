// TODO: Add definition to the ANY types
declare module 'twitter' {
  export interface TweetObject {
    created_at: Date
    id: number
    id_str: string
    text: string
    display_text_range: number[]
    source: string
    truncated: boolean
    reply_status: TweetObject
    in_reply_to_status_id: number | null
    in_reply_to_status_id_str: string | null
    in_reply_to_user_id: number | null
    in_reply_to_user_id_str: string | null
    in_reply_to_screen_name: string | null
    user: any
    coordinates: number[] | null
    place: null
    is_quote_status: boolean
    quoted_status: TweetObject | null
    quoted_status_id: number | null
    quoted_status_id_str: string | null
    retweeted_status: TweetObject | null
    quote_count: number
    reply_count: number
    retweet_count: number
    entities: any
    extended_entities: any
    favorited: boolean
    retweeted: boolean
    possibly_sensitive: boolean
    lang: string
    extended_tweet: any
  }

  export interface TwitterEvent {
    [key: string]: any
    for_user_id: string
  }

  export interface TwitterCreateEvent extends TwitterEvent {
    user_has_blocked?: string
    tweet_create_events: TweetObject[]
  }

  export interface TwitterDeleteEvent extends TwitterEvent {
    tweet_delete_events: TweetObject[]
  }

  export interface TwitterMediaObject {
    display_url: string
    expanded_url: string
    id: number
    id_str: string
    indices: number[]
    media_url: string
    media_url_https: string
    sizes: {
      thumb: number
      s: {
        w: number
        h: number
        resize: string
      }
      m: {
        w: number
        h: number
        resize: string
      }
      l: {
        w: number
        h: number
        resize: string
      }
    }
    source_status_id: number | null
    source_status_id_str: string | null
    type: string
    url: string
    video_info?: {
      aspect_ratio: unknown[]
      duration_millis: number
      variants: VideoInfoVariants[]
    }
  }

  export interface VideoInfoVariants {
    bitrate: number
    content_type: string
    url: string
  }

  export interface UserRevokeEvent {
    user_event: {
      revoke: {
        date_time: Date
        target: {
          app_id: string
        }
        source: {
          user_id: string
        }
      }
    }
  }

  export interface TwitterUserObject {
    id: number
    twitter_user_id: string
    profile_image_url: string
    name: string
    twitter_handle: string
  }

  export interface TwitterCredentials {
    accessToken: string
    secret: string
  }
}
