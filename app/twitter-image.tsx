import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

export default function TwitterImage() {
  const bg = "#0B0B0C";
  const gold = "#C8A96A";
  const gold2 = "#E7D39A";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: 72,
          backgroundColor: bg,
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(231,211,154,0.18) 0%, rgba(11,11,12,0) 55%), radial-gradient(circle at 75% 55%, rgba(200,169,106,0.12) 0%, rgba(11,11,12,0) 55%)",
          color: "white",
          gap: 28,
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 28,
            backgroundColor: bg,
            border: `10px solid ${gold}`,
            boxShadow: "0 25px 60px rgba(0,0,0,0.55)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 74,
              height: 74,
              borderRadius: 999,
              border: `12px solid ${gold2}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 52,
              height: 14,
              borderRadius: 999,
              backgroundColor: gold2,
              right: 18,
              bottom: 26,
              transform: "rotate(45deg)",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 68,
              lineHeight: 1,
              letterSpacing: -1,
              fontWeight: 700,
            }}
          >
            Quickfund
          </div>
          <div
            style={{
              fontSize: 28,
              marginTop: 14,
              color: "rgba(255,255,255,0.78)",
              maxWidth: 900,
            }}
          >
            Credit transparent, reponse sous 24h, decisions expliquees.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

