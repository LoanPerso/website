import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          backgroundColor: bg,
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(231,211,154,0.18) 0%, rgba(11,11,12,0) 55%), radial-gradient(circle at 70% 60%, rgba(200,169,106,0.12) 0%, rgba(11,11,12,0) 55%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 140,
              height: 140,
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
                width: 78,
                height: 78,
                borderRadius: 999,
                border: `12px solid ${gold2}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 54,
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
                fontSize: 70,
                lineHeight: 1,
                letterSpacing: -1,
                fontWeight: 700,
              }}
            >
              Quickfund
            </div>
            <div
              style={{
                fontSize: 30,
                marginTop: 14,
                color: "rgba(255,255,255,0.78)",
                maxWidth: 820,
              }}
            >
              Credit transparent. Reponse garantie en 24h. Decisions expliquees.
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 54,
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          {["20EUR minimum", "100% online", "0 frais caches"].map((s) => (
            <div
              key={s}
              style={{
                padding: "12px 16px",
                borderRadius: 999,
                border: "1px solid rgba(200,169,106,0.35)",
                backgroundColor: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.88)",
                fontSize: 22,
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}

