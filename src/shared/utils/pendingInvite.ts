const PENDING_INVITE_KEY = "bujirun_pending_invite";

export interface PendingInvite {
  code: string;
  count?: string;
  days?: string;
  startDate?: string;
  endDate?: string;
  // 여행 시작/종료 시각. 이게 초대 링크로 전달되지 않으면 초대받은 멤버는 결과(투표)
  // 화면에서 기본값(10:00/17:00)을 쓰게 되어 방장 화면과 시간이 달라진다.
  startTime?: string;
  endTime?: string;
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

// 초대 흐름에서 /join으로 되돌아갈 때 붙일 쿼리. 필드가 늘어날 때마다 세 군데(콜백,
// 회원가입 완료 모달, 초대 링크)를 따로 고치다 빠뜨리는 일이 없도록 한곳에 모아둔다.
export function buildPendingInviteQuery(invite: PendingInvite): string {
  const params = new URLSearchParams();
  if (invite.count) params.set("count", invite.count);
  if (invite.days) params.set("days", invite.days);
  if (invite.startDate) params.set("startDate", invite.startDate);
  if (invite.endDate) params.set("endDate", invite.endDate);
  if (invite.startTime) params.set("startTime", invite.startTime);
  if (invite.endTime) params.set("endTime", invite.endTime);
  return params.toString();
}
