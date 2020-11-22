
declare module 'CustomTypes' {
  import { Response } from "express-serve-static-core"
  import { Media, Post, Webhook } from "@prisma/client"

  export interface FormattedWebhook extends Omit<Webhook, 'id'> { }

  export interface SearchCriteria {
    filter: string
    value: string | number | Date
  }

  export interface CreatePostInput {
    formattedPost: Omit<FormattedPost, 'authorID'>
    for_user_id: string
  }

  export interface CreateClientPost {
    post: FormattedPost
    userID: string
  }
  export interface FormattedPost extends Omit<Post, 'id'> {
    media: Omit<Media, 'id'>[]
  }

  export interface Tasks {
    shouldRegisterWebhook: boolean
    shouldTriggerCRC: boolean
    webhookIDs: string[]
  }

  export interface FormattedUser {
    twitterUserID: string
    profileImageUrl: string
    name: string
    twitterHandle: string
  }

  export interface FormattedCredentials {
    accessToken: string
    accessTokenSecret: string
  }

  export interface CustomClientErrors {
    [key: string]: CustomClientError
    'FORBIDDEN': CustomClientError
    'INVALID_AUTH_HEADER': CustomClientError
    'LOGIN_REQUIRED': CustomClientError
    'MISSING_AUTH_HEADER': CustomClientError
    'NOT_FOUND': CustomClientError
    'BAD_REQUEST': CustomClientError
    'NOT_IMPLEMENTED': CustomClientError
    'UNSUPPORTED_EVENT': CustomClientError
  }
  export interface CustomClientError {
    reason: string
    type: string
    message: string
    status: number
  }

  export interface ClientFacingError {
    error: string
    message: string
  }

  export interface GeneratedError {
    status: number
    type: 'system' | 'client'
    reason: string
    message: string
    _error?: any
  }

  export type CustomClientErrorKeys = keyof CustomClientErrors

  export interface ReturnedPosts {
    post?: PostWithParsedDate | null
    posts?: (PostWithParsedDate | undefined)[]
  }

  export interface PostWithParsedDate extends Omit<Post, 'deconstructedDate'> {
    deconstructedDate: JSON
  }

  export type PostsControllerReturn = Promise<Response<ReturnedPosts> | void>

  export interface DeletedPostsInfo {
    deletedIDs: string[]
    counts: { posts: number, media: number }
  }
}

declare module 'http' {
  interface IncomingMessage {
    rawBody: string
  }
}
