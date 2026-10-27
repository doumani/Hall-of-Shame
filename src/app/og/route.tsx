import { ImageResponse } from "next/og"

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0A1628",
        color: "#F5F0E6",
        padding: "72px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: 48, height: 3, background: "#8E2430", marginRight: 18 }} />
        <div style={{ fontSize: 22, letterSpacing: 5 }}>HALL OF SHAME</div>
      </div>
      <div style={{ display: "flex", fontSize: 76, lineHeight: 1.02, maxWidth: 900 }}>
        The plays baseball cannot forget.
      </div>
      <div style={{ display: "flex", fontSize: 26, color: "#F5F0E6" }}>
        A catalog of classic major-league blunders
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}
