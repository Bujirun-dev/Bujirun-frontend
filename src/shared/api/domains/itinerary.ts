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

export function deleteItinerary(id: string) {
  return apiClient.delete(`/api/itineraries/${id}`);
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
// 재정렬된 spots/routes를 그대로 응답으로 돌려준다.
// 다른 API와 달리 success/message/data 래퍼 없이 결과가 바로 내려온다.
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

// group-itinerary-controller: 그룹원들의 투표/선호를 모아 일정을 생성
export function generateGroupItinerary(groupId: string, body: OpBody<"generate">) {
  return apiClient
    .post<OpResponse<"generate">>(`/api/itineraries/group/${groupId}/generate`, body)
    .then((res) => unwrap(res));
}

// A/B/C안 중 하나에 투표
export function castVote(sessionId: string, body: OpBody<"castVote">) {
  return apiClient
    .post<OpResponse<"castVote">>(`/api/itineraries/vote-sessions/${sessionId}/votes`, body)
    .then((res) => unwrap(res));
}

// 투표 현황(안별 득표수/총 투표수) 조회
export function getVoteStatus(sessionId: string) {
  return apiClient
    .get<OpResponse<"getStatus">>(`/api/itineraries/vote-sessions/${sessionId}`)
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
    .post<OpResponse<"generateItinerary">>("/api/itineraries/generate", body)
    .then((res) => unwrap(res));
}
