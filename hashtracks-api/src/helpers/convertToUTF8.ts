// Types
import { Response, Request } from 'express'

/**
 * Takes the the requests body as a buffer and converts it to a UTF-8 string by default and apply that
 * content to the given requests body. This is technically a middleware
 * @param req
 * @param _
 * @param buf
 * @param encoding
 */
const convertToUTF8 = (req: Request, _: Response, buf: Buffer, encoding: BufferEncoding): void => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || `utf8`)
  }
}

export default convertToUTF8
