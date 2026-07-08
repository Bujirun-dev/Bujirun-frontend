const PENDING_INVITE_KEY = "bujirun_pending_invite";

export interface PendingInvite {
  code: string;
  count?: string;
  days?: string;
  startDate?: string;
  endDate?: string;
}

// 초대 링크(/join/[code])로 들어온 비로그인 유저가 로그인·회원가입을 마치고
// 다시 초대 참여 흐름으로 복귀할 수 있도록 코드와 방 정보(count/days)를 잠깐 저장해둔다.
export function savePendingInvite(invite: PendingInvite) {
  window.localStorage.setItem(PENDING_INVITE_KEY, JSON.stringify(invite));
}

export function consumePendingInvite(): PendingInvite | null {
  const raw = window.localStorage.getItem(PENDING_INVITE_KEY);
  if (!raw) return null;
  window.localStorage.removeItem(PENDING_INVITE_KEY);
  try {
    return JSON.parse(raw) as PendingInvite;
  } catch {
    return null;
  }
}
