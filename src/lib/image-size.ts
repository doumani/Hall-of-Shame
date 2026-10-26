import fs from "fs"
import path from "path"

/** Reads the pixel size of a local archive image. Used only to frame portraits and landscapes. */
export function localImageSize(url: string) {
  if (!url.startsWith("/")) return null
  const file = path.join(process.cwd(), "public", url)
  if (!fs.existsSync(file)) return null

  const buffer = fs.readFileSync(file)
  if (buffer.length > 24 && buffer[0] === 0x89 && buffer[1] === 0x50) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
  }

  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null
  let offset = 2
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return null
    const marker = buffer[offset + 1]
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      }
    }
    const size = buffer.readUInt16BE(offset + 2)
    if (size < 2) return null
    offset += 2 + size
  }
  return null
}
