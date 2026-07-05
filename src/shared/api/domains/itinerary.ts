import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/response";
import type { OpBody, OpResponse } from "@/shared/api/types";

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

// itinerary-generate-controller: 스와이프 선호 기반 개인 일정 생성
export function generateItinerary(body: OpBody<"generateItinerary">) {
  return apiClient
    .post<OpResponse<"generateItinerary">>("/api/itineraries/generate", body)
    .then((res) => unwrap(res));
}
