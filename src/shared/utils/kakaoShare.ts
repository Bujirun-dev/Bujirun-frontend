declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (settings: Record<string, unknown>) => void;
      };
    };
  }
}

// 카카오 디벨로퍼스 콘솔에서 "카카오톡 공유" 활성화 + Web 플랫폼 도메인 등록 + JS 키 발급이 끝나야 동작한다.
// 그 전까지는 window.Kakao가 없거나 초기화가 안 되어 있으니 항상 false를 반환해 호출부가 클립보드 복사로 대체하게 한다.
export function initKakaoShare() {
  if (typeof window === "undefined" || !window.Kakao) return;
  if (window.Kakao.isInitialized()) return;

  const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!jsKey) return;

  window.Kakao.init(jsKey);
}

interface ShareInviteLinkParams {
  title: string;
  description: string;
  inviteUrl: string;
}

// 카카오톡 공유 카드로 전송을 시도한다. SDK가 준비돼 있지 않으면 false를 반환한다.
export function shareInviteLink({ title, description, inviteUrl }: ShareInviteLinkParams): boolean {
  if (typeof window === "undefined" || !window.Kakao?.isInitialized()) return false;

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title,
      description,
      imageUrl: `${window.location.origin}/icons/icon-512.png`,
      link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl },
    },
    buttons: [
      {
        title: "참여하기",
        link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl },
      },
    ],
  });
  return true;
}
