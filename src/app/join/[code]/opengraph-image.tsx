import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getInviteCopy, getInvitePreview } from "./invitePreview";

export const alt = "부지런 여행 일정 초대";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const preview = await getInvitePreview(code);
  const copy = getInviteCopy(preview);
  const [font, character] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/DXMSubtitlesM-KSCpc-EUC-H.ttf")),
    readFile(join(process.cwd(), "src/assets/character/sea.png")),
  ]);
  const characterData = character.buffer.slice(
    character.byteOffset,
    character.byteOffset + character.byteLength,
  ) as ArrayBuffer;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #ecf5ff 0%, #ffffff 58%, #ffeef3 100%)",
        color: "#253047",
        fontFamily: "DXSubtitles",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          right: -80,
          top: -110,
          borderRadius: 999,
          background: "rgba(151, 193, 255, 0.35)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 310,
          height: 310,
          left: -100,
          bottom: -145,
          borderRadius: 999,
          background: "rgba(255, 179, 199, 0.35)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 760,
          padding: "72px 0 72px 82px",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#4da6ff", marginBottom: 28 }}>
          BUJIRUN · 여행 일정 초대
        </div>
        <div style={{ display: "flex", fontSize: 54, lineHeight: 1.25, marginBottom: 24 }}>
          {copy.title}
        </div>
        <div style={{ display: "flex", fontSize: 28, lineHeight: 1.45, color: "#667085" }}>
          {copy.description}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 48,
          bottom: -28,
          width: 390,
          height: 390,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={characterData as unknown as string}
          alt=""
          width={390}
          height={292}
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "DXSubtitles", data: font, weight: 400, style: "normal" }],
    },
  );
}
