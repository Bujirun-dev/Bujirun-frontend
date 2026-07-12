"use client";

import { useState } from "react";
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
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    onClose();
  };

  const handleKakaoShare = () => {
    const shared = shareInviteLink({ title, description, imageUrl, inviteUrl });
    if (shared) {
      onClose();
      return;
    }
    // 카카오톡 공유 설정 전이면 링크 복사로 대체
    handleCopyLink();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="공유하기" hideActions childrenVariant="plain">
        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleKakaoShare}
            className="flex items-center gap-3 rounded-xl bg-system-navbg px-3.5 py-3 text-left active:opacity-70"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FEE500] text-base">
              💬
            </span>
            <span className="flex flex-col">
              <span className="font-ssurround text-sm font-bold text-text-heading">카카오톡</span>
              <span className="text-xs font-medium text-sub-gray">카카오톡으로 공유하기</span>
            </span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-3 rounded-xl bg-system-navbg px-3.5 py-3 text-left active:opacity-70"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-main-blue/10 text-base">
              🔗
            </span>
            <span className="flex flex-col">
              <span className="font-ssurround text-sm font-bold text-text-heading">링크 복사</span>
              <span className="text-xs font-medium text-sub-gray">링크를 복사해서 공유하기</span>
            </span>
          </button>

          <Card
            variant="glass-sm"
            className="mt-1 rounded-xl px-4 py-3 flex flex-col gap-1 text-left"
          >
            <p className="font-semibold text-sm text-text-heading">{title}</p>
            <p className="text-xs text-sub-gray line-clamp-2">{description}</p>
            <p className="text-xs font-medium text-main-blue">{getShortUrl(inviteUrl)}</p>
          </Card>
        </div>
      </Modal>

      <Toast isVisible={copied} message="링크가 복사되었어요 !" onHide={() => setCopied(false)} />
    </>
  );
}
