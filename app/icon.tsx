import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
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
            width: 14,
            height: 9,
            background: "rgba(255,255,255,0.95)",
            borderRadius: 2,
            marginBottom: 1,
          }}
        />
        {/* Desk */}
        <div
          style={{
            width: 22,
            height: 3,
            background: "white",
            borderRadius: 1.5,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
