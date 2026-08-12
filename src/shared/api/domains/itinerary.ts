import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/response";
import type { OpBody, OpResponse } from "@/shared/api/types";

export const keys = {
  all: ["itineraries"] as const,
  lists: () => [...keys.all, "list"] as const,
  detail: (id: string) => [...keys.all, "detail", id] as const,
  groupGenerate: (groupId: string, startDate: string, endDate: string) =>
    [...keys.all, "group-generate", groupId, startDate, endDate] as const,
  voteStatus: (sessionId: string) => [...keys.all, "vote-status", sessionId] as const,
};

export function getItineraries() {
  return apiClient.get<OpResponse<"getList">>("/api/itineraries").then((res) => unwrap(res));
}

export function getItinerary(id: string) {
  return apiClient.get<OpResponse<"getById">>(`/api/itineraries/${id}`).then((res) => unwrap(res));
}

export function createItinerary(body: OpBody<"create_1">) {
  return apiClient
    .post<OpResponse<"create_1">>("/api/itineraries", body)
    .then((res) => unwrap(res));
}

export function updateItinerary(id: string, body: OpBody<"update_1">) {
  return apiClient
    .patch<OpResponse<"update_1">>(`/api/itineraries/${id}`, body)
    .then((res) => unwrap(res));
}

// 개인 일정 전용. 그룹 일정에 호출하면 400("그룹 일정은 삭제 대신 나가기를 사용해주세요.")이 온다.
export function deleteItinerary(id: string) {
  return apiClient.delete(`/api/itineraries/${id}`);
}

// 그룹 일정 나가기. 나가도 다른 그룹원에게는 일정이 그대로 남고, 혼자 남은 상태에서
// 나가면 그룹과 일정이 함께 삭제된다. 개인 일정에 호출하면 400.
export function leaveItinerary(id: string) {
  return apiClient.post(`/api/itineraries/${id}/leave`);
}

export function addDay(itineraryId: string, body: OpBody<"addDay">) {
  return apiClient
    .post<OpResponse<"addDay">>(`/api/itineraries/${itineraryId}/days`, body)
    .then((res) => unwrap(res));
}

export function deleteDay(itineraryId: string, dayId: string) {
  return apiClient.delete(`/api/itineraries/${itineraryId}/days/${dayId}`);
}

// 좌표 기반 동선 재정렬 + 운영시간 반영. PATCH라 서버에 바로 반영되며,
// 재정렬된 spots/routes를 응답으로 돌려준다. 호출부(itinerary/page.tsx)가
// res.data.spots 형태로 쓰므로 unwrap하지 않고 envelope째로 반환한다.
export function optimizeDay(dayId: string, body: OpBody<"optimize">) {
  return apiClient
    .patch<OpResponse<"optimize">>(`/api/itineraries/days/${dayId}/optimize`, body)
    .then((res) => res.data);
}

export function addItem(itineraryId: string, dayId: string, body: OpBody<"addItem">) {
  return apiClient
    .post<OpResponse<"addItem">>(`/api/itineraries/${itineraryId}/days/${dayId}/items`, body)
    .then((res) => unwrap(res));
}

export function updateItem(
  itineraryId: string,
  dayId: string,
  itemId: string,
  body: OpBody<"updateItem">,
) {
  return apiClient
    .patch<
      OpResponse<"updateItem">
    >(`/api/itineraries/${itineraryId}/days/${dayId}/items/${itemId}`, body)
    .then((res) => unwrap(res));
}

export function deleteItem(itineraryId: string, dayId: string, itemId: string) {
  return apiClient.delete(`/api/itineraries/${itineraryId}/days/${dayId}/items/${itemId}`);
}

// 일차(day)에 속한 방문 항목 전체의 순서를 한 번에 원자적으로 반영한다. itemIds는 그 일차에
// 존재하는 항목 id 전체를 원하는 순서대로 담아야 한다(부분 목록 불가) — 항목별 updateItem
// PATCH로 순서를 나눠 반영하면 동시편집 중 서로 다른 클라이언트의 갱신이 뒤섞여 order_index가
// 충돌할 수 있어서(2026-08-12 프로덕션에서 실제 발견) 도입됨. 백엔드 배포 직후라 아직
// `npm run api:types`로 스키마가 재생성되지 않아 body 타입은 수동으로 선언(추후 codegen 후
// OpBody<"reorderItems">로 교체 가능).
export function reorderItems(itineraryId: string, dayId: string, itemIds: string[]) {
  return apiClient.patch(`/api/itineraries/${itineraryId}/days/${dayId}/items/order`, { itemIds });
}

// 사용자가 이동수단을 직접 선택했을 때 실제 경로(역명/노선번호 등)를 재계산해서 돌려받는다.
export function updateTravelMode(
  itineraryId: string,
  dayId: string,
  itemId: string,
  body: OpBody<"updateTravelMode">,
) {
  return apiClient
    .patch<
      OpResponse<"updateTravelMode">
    >(`/api/itineraries/${itineraryId}/days/${dayId}/items/${itemId}/travel-mode`, body)
    .then((res) => unwrap(res));
}

// OpenAI + ODsay + 버스도착정보를 스팟마다 순차 호출해 16~24초까지 걸리므로
// 전역 타임아웃(10초)보다 넉넉하게 잡는다.
const GENERATE_TIMEOUT_MS = 60_000;

// group-itinerary-controller: 그룹원들의 투표/선호를 모아 일정을 생성
export function generateGroupItinerary(groupId: string, body: OpBody<"generate">) {
  return apiClient
    .post<OpResponse<"generate">>(`/api/itineraries/group/${groupId}/generate`, body, {
      timeout: GENERATE_TIMEOUT_MS,
    })
    .then((res) => unwrap(res));
}

// A/B/C안 중 하나에 투표
export function castVote(sessionId: string, body: OpBody<"castVote">) {
  return apiClient
    .post<OpResponse<"castVote">>(`/api/itineraries/vote-sessions/${sessionId}/votes`, body)
    .then((res) => unwrap(res));
}

// 투표 현황(안별 득표수/총 투표수) 조회
// operationId가 스와이프 상태 조회(getStatus)와 겹쳐서 codegen이 getStatus_1로 분리함.
// 백엔드가 operationId를 고유하게 바꿔주면 이 부분도 다시 getStatus로 돌아올 수 있음.
export function getVoteStatus(sessionId: string) {
  return apiClient
    .get<OpResponse<"getStatus_1">>(`/api/itineraries/vote-sessions/${sessionId}`)
    .then((res) => unwrap(res));
}

// 일정 확정 (리더 전용). freePass=true면 투표 결과와 무관하게 selectedPlan으로 즉시 확정.
export function finalizeItinerary(sessionId: string, body: OpBody<"finalize">) {
  return apiClient
    .post<OpResponse<"finalize">>(`/api/itineraries/vote-sessions/${sessionId}/finalize`, body)
    .then((res) => unwrap(res));
}

// itinerary-generate-controller: 스와이프 선호 기반 개인 일정 생성
export function generateItinerary(body: OpBody<"generateItinerary">) {
  return apiClient
    .post<OpResponse<"generateItinerary">>("/api/itineraries/generate", body, {
      timeout: GENERATE_TIMEOUT_MS,
    })
    .then((res) => unwrap(res));
}
