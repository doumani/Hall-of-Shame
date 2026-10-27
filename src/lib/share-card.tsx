import { readFile } from "node:fs/promises"
import path from "node:path"
import type { ReactElement } from "react"

const navy = "#0A1628"
const cream = "#F5F0E6"
const cardinal = "#8E2430"
const frame = "#102038"

export type ShareFont = {
  name: string
  data: ArrayBuffer
  weight: 600
  style: "normal"
}

let fonts: Promise<ShareFont[] | undefined> | null = null

function toArrayBuffer(buffer: Buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
}

export function loadShareFonts() {
  fonts ??= Promise.all([
    readFile(path.join(process.cwd(), "src/fonts/Fraunces-600.ttf")),
    readFile(path.join(process.cwd(), "src/fonts/SourceSans3-600.ttf")),
  ])
    .then(([serif, sans]) => [
      { name: "Fraunces", data: toArrayBuffer(serif), weight: 600 as const, style: "normal" as const },
      { name: "Source Sans 3", data: toArrayBuffer(sans), weight: 600 as const, style: "normal" as const },
    ])
    .catch((error: unknown) => {
      console.error("Share card: fonts could not be read", error)
      fonts = null
      return undefined
    })
  return fonts
}

export async function shareCardPhoto(url: string | undefined) {
  if (!url?.startsWith("/")) return null
  const ext = path.extname(url).toLowerCase()
  const mime = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : null
  if (!mime) return null

  try {
    const buffer = await readFile(path.join(process.cwd(), "public", url))
    if (buffer.length > 1_500_000) return null
    return `data:${mime};base64,${buffer.toString("base64")}`
  } catch {
    return null
  }
}

function titleSize(title: string, withPhoto: boolean) {
  if (withPhoto) {
    if (title.length > 42) return 46
    if (title.length > 26) return 56
    return 68
  }
  if (title.length > 48) return 56
  if (title.length > 28) return 72
  return 86
}

function brief(summary: string) {
  if (summary.length <= 150) return summary
  return `${summary.slice(0, 147).trimEnd()}…`
}

export function shareCardElement({
  title,
  year,
  summary,
  average,
  votes,
  photo,
}: {
  title: string
  year: number
  summary: string
  average: number | null
  votes: number
  photo: string | null
}): ReactElement {
  const textWidth = photo ? 620 : 1000

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: navy,
        color: cream,
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 42, height: 3, background: cardinal, marginRight: 16 }} />
          <div
            style={{
              display: "flex",
              fontFamily: "Source Sans 3",
              fontSize: 22,
              letterSpacing: 4,
            }}
          >
            HALL OF SHAME
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: textWidth }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Source Sans 3",
              fontSize: 26,
              letterSpacing: 3,
              color: "rgba(245,240,230,0.72)",
            }}
          >
            {String(year)}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Fraunces",
              fontSize: titleSize(title, Boolean(photo)),
              lineHeight: 1.02,
              marginTop: 16,
              width: textWidth,
            }}
          >
            {title}
          </div>
        </div>
        {average === null ? (
          <div
            style={{
              display: "flex",
              width: textWidth,
              fontFamily: "Source Sans 3",
              fontSize: 28,
              lineHeight: 1.35,
              color: "rgba(245,240,230,0.78)",
            }}
          >
            {brief(summary)}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Fraunces",
                fontSize: 104,
                lineHeight: 0.85,
              }}
            >
              {average.toFixed(1)}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginLeft: 22,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontFamily: "Source Sans 3",
                  fontSize: 22,
                  letterSpacing: 4,
                }}
              >
                SHAME
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 8,
                  fontFamily: "Source Sans 3",
                  fontSize: 22,
                  color: "rgba(245,240,230,0.72)",
                }}
              >
                {votes === 1 ? "1 vote" : `${votes} votes`}
              </div>
            </div>
          </div>
        )}
      </div>
      {photo ? (
        <div style={{ display: "flex", alignItems: "center", padding: "48px 48px 48px 0" }}>
          <div
            style={{
              display: "flex",
              width: 390,
              height: 534,
              background: frame,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Satori requires explicit image dimensions. */}
            <img src={photo} alt="" width={390} height={534} style={{ objectFit: "contain" }} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
