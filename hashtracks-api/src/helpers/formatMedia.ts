// Types
import { Media } from '@prisma/client'
import { TwitterMediaObject } from 'twitter'

/**
 * Formats a Twitter Media Object given from a user activity event to a usable form
 * @param media
 */
const formatMedia = (media: TwitterMediaObject): Omit<Media, 'id'|'postID'> => ({
  twitterMediaID: media?.id_str,
  type: media?.type,
  imageUrl: media?.media_url_https,
  videoUrl: media?.video_info?.variants[0]?.url ?? null,
})

export default formatMedia
