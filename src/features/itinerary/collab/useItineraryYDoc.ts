"use client";

import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useAuthStore } from "@/shared/stores/useAuthStore";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

// 부지런-node(Yjs WebSocket 서버) room 이름 = itinerary UUID.
// 서버가 UUID 형식이 아닌 room은 즉시 연결을 끊는다.
export function useItineraryYDoc(itineraryId: string | null) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [doc] = useState(() => new Y.Doc());
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const providerRef = useRef<WebsocketProvider | null>(null);

  useEffect(() => {
    if (!itineraryId || !accessToken) return;

    const wsUrl = process.env.NEXT_PUBLIC_YJS_WS_URL ?? "ws://localhost:1234";
    const provider = new WebsocketProvider(wsUrl, itineraryId, doc, {
      params: { token: accessToken },
    });
    providerRef.current = provider;

    const handleStatus = ({ status }: { status: ConnectionStatus }) => setStatus(status);
    provider.on("status", handleStatus);

    return () => {
      provider.off("status", handleStatus);
      provider.destroy();
      providerRef.current = null;
    };
  }, [itineraryId, accessToken, doc]);

  // provider는 렌더링에 필요 없는 외부 연결 핸들이라 ref로만 노출한다 (필요 시 getProvider() 호출 시점에 읽는다).
  return { doc, status, getProvider: () => providerRef.current };
}
