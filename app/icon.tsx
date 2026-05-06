import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: "linear-gradient(135deg, #1B2A3B 0%, #2DD4BF 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Monitor */}
        <div
          style={{
            width: 20,
            height: 13,
            background: "rgba(255,255,255,0.95)",
            borderRadius: 3,
            marginBottom: 2,
          }}
        />
        {/* Desk */}
        <div
          style={{
            width: 32,
            height: 4,
            background: "white",
            borderRadius: 2,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
