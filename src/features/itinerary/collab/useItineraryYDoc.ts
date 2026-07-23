"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { reissueAccessToken } from "@/shared/api/client";
import { getJwtExpiryMs } from "@/shared/utils/jwt";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

// node는 연결 시 1회만 토큰을 검증해서, 만료 후 401을 브라우저가 읽어내는 방식으로는
// 재연결을 안정적으로 못 잡는다 — 만료 이만큼 전에 미리 재발급 + 재연결한다.
const REFRESH_BUFFER_MS = 60_000;

// doc은 호출부(useCollaborativeItinerary)가 만들어 넘긴다 — flush 로직이 그 doc을
// onBeforeDisconnect 콜백 시점보다 먼저 참조할 수 있어야 해서, 이 훅 안에서 새로 만들면
// 순환 참조가 생긴다.
//
// 부지런-node(Yjs WebSocket 서버) room 이름 = itinerary UUID.
// 서버가 UUID 형식이 아닌 room은 즉시 연결을 끊는다.
//
// onBeforeDisconnect: 소켓을 끊기(destroy) 직전에 동기적으로 한 번 호출된다. 이탈 시
// "PATCH 저장 → disconnect" 순서를 지키기 위한 훅 포인트 — 매 렌더 최신 콜백을 ref로
// 들고 있다가(=stale closure 방지) cleanup에서 그 ref를 호출한다.
export function useItineraryYDoc(
  itineraryId: string | null,
  doc: Y.Doc,
  onBeforeDisconnect?: () => void,
) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasToken = accessToken !== null;
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const providerRef = useRef<WebsocketProvider | null>(null);
  const onBeforeDisconnectRef = useRef(onBeforeDisconnect);

  useEffect(() => {
    onBeforeDisconnectRef.current = onBeforeDisconnect;
  });

  // 연결 생성/파괴는 itineraryId와 "토큰 유무"에만 반응한다. 토큰 값 자체가 바뀔 때마다
  // (선제 재발급 등) provider를 통째로 새로 만들면 매번 연결이 끊겼다 열리므로, 토큰 값
  // 변화는 아래 별도 effect에서 기존 provider에 반영한다.
  useEffect(() => {
    if (!itineraryId || !hasToken) return;

    const wsUrl = process.env.NEXT_PUBLIC_YJS_WS_URL ?? "ws://localhost:1234";
    const provider = new WebsocketProvider(wsUrl, itineraryId, doc, {
      params: { token: accessToken ?? "" },
    });
    providerRef.current = provider;

    const handleStatus = ({ status }: { status: ConnectionStatus }) => setStatus(status);
    provider.on("status", handleStatus);

    return () => {
      onBeforeDisconnectRef.current?.();
      provider.off("status", handleStatus);
      provider.destroy();
      providerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itineraryId, hasToken, doc]);

  // 토큰 값이 바뀔 때마다(자체 선제 재발급이든 다른 곳에서의 재발급이든) 기존 소켓을 죽이지
  // 않고 params만 갱신한 뒤 가볍게 재연결한다. y-websocket의 disconnect/connect는 destroy와
  // 달리 doc/awareness 바인딩을 유지한 채 다음 연결부터 새 params를 적용한다.
  useEffect(() => {
    const provider = providerRef.current;
    if (!provider || !accessToken) return;
    if (provider.params.token === accessToken) return;
    provider.params = { token: accessToken };
    provider.disconnect();
    provider.connect();
  }, [accessToken]);

  // 토큰 만료 전에 선제적으로 재발급한다. 성공하면 store가 갱신되고, 위 effect가 그 변화를
  // 감지해 재연결까지 처리한다. 재발급 실패(로그아웃 등)면 그냥 멈춘다.
  useEffect(() => {
    if (!accessToken) return;
    const expiryMs = getJwtExpiryMs(accessToken);
    if (expiryMs === null) return;

    const delay = Math.max(0, expiryMs - Date.now() - REFRESH_BUFFER_MS);
    const timer = setTimeout(() => {
      reissueAccessToken();
    }, delay);

    return () => clearTimeout(timer);
  }, [accessToken]);

  // provider는 렌더링에 필요 없는 외부 연결 핸들이라 ref로만 노출한다 (필요 시 getProvider() 호출 시점에 읽는다).
  // useCallback으로 참조를 고정해 이 함수를 deps로 쓰는 상위 훅의 effect가 매 렌더 재실행되지 않게 한다.
  const getProvider = useCallback(() => providerRef.current, []);

  return { status, getProvider };
}
