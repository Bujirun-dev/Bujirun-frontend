"use client";

import { useState } from "react";
import Image from "next/image";
import kakaoTalkIcon from "@/assets/icons/itinerary/kakaotalk.png";
import LinkIcon from "@/assets/icons/itinerary/link.svg?svgr";
import { Modal, Card, Toast } from "@/components";
import { shareInviteLink } from "@/shared/utils/kakaoShare";

interface ShareInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  imageUrl: string;
  inviteUrl: string;
}

function getShortUrl(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function ShareInviteModal({
  isOpen,
  onClose,
  title,
  description,
  imageUrl,
  inviteUrl,
}: ShareInviteModalProps) {
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );

  const copyInviteUrl = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = inviteUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        if (!copied) throw new Error("copy failed");
      }
      setToast({ message: "링크가 복사되었어요!", variant: "success" });
      onClose();
    } catch {
      setToast({ message: "링크를 복사하지 못했어요.", variant: "error" });
    }
  };

  const handleCopyLink = () => void copyInviteUrl();

  const handleKakaoShare = async () => {
    const shared = await shareInviteLink({ title, description, imageUrl, inviteUrl });
    if (shared) {
      onClose();
      return;
    }
    // 카카오톡 공유 설정 전이면 링크 복사로 대체
    void copyInviteUrl();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="공유하기" hideActions childrenVariant="plain">
        <div className="flex w-full flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => void handleKakaoShare()}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-system-glassborder bg-main-white px-3 py-2 active:opacity-70"
            >
              <Image
                src={kakaoTalkIcon}
                alt=""
                width={32}
                height={32}
                className="shrink-0"
                aria-hidden
              />
              <span className="text-sm font-semibold text-text-heading">카카오톡</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-system-glassborder bg-main-white px-3 py-2 active:opacity-70"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-system-searchbg">
                <LinkIcon width={14} height={14} className="fill-sub-gray" aria-hidden />
              </span>
              <span className="text-sm font-semibold text-text-heading">링크 복사</span>
            </button>
          </div>

          <Card variant="glass-sm" className="flex flex-col gap-1 rounded-xl px-4 py-3 text-left">
            <p className="font-semibold text-sm text-text-heading">{title}</p>
            <p className="text-xs text-sub-gray line-clamp-2">{description}</p>
            <p className="text-xs font-medium text-main-blue">{getShortUrl(inviteUrl)}</p>
          </Card>
        </div>
      </Modal>

      <Toast
        isVisible={toast !== null}
        onHide={() => setToast(null)}
        message={toast?.message ?? ""}
        variant={toast?.variant}
      />
    </>
  );
}
