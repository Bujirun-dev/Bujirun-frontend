import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/response";
import type { OpBody, OpQuery, OpResponse } from "@/shared/api/types";

export const keys = {
  all: ["travel-logs"] as const,
  mine: () => [...keys.all, "me"] as const,
  public: (query?: OpQuery<"getPublicLogs">) => [...keys.all, "public", query ?? {}] as const,
  bySpot: (spotId: string) => [...keys.all, "spot", spotId] as const,
  detail: (id: string) => [...keys.all, "detail", id] as const,
};

export function createLog(body: OpBody<"create">) {
  return apiClient.post<OpResponse<"create">>("/api/logs", body).then((res) => unwrap(res));
}

export function getLog(id: string) {
  return apiClient.get<OpResponse<"getDetail">>(`/api/logs/${id}`).then((res) => unwrap(res));
}

export function updateLog(id: string, body: OpBody<"update">) {
  return apiClient.patch<OpResponse<"update">>(`/api/logs/${id}`, body).then((res) => unwrap(res));
}

export function deleteLog(id: string) {
  return apiClient.delete(`/api/logs/${id}`);
}

export function getMyLogs() {
  return apiClient.get<OpResponse<"getMyLogs">>("/api/logs/me").then((res) => unwrap(res));
}

export function getPublicLogs(query?: OpQuery<"getPublicLogs">) {
  return apiClient
    .get<OpResponse<"getPublicLogs">>("/api/logs/public", { params: query })
    .then((res) => unwrap(res));
}

export function getLogsBySpot(spotId: string) {
  return apiClient
    .get<OpResponse<"getLogsBySpot">>(`/api/logs/spot/${spotId}`)
    .then((res) => unwrap(res));
}

export function addPhoto(logId: string, itemId: string, body: OpBody<"addPhoto">) {
  return apiClient
    .post<OpResponse<"addPhoto">>(`/api/logs/${logId}/items/${itemId}/photos`, body)
    .then((res) => unwrap(res));
}

export function deletePhoto(logId: string, itemId: string, photoId: string) {
  return apiClient.delete(`/api/logs/${logId}/items/${itemId}/photos/${photoId}`);
}

export function setRepresentativePhoto(logId: string, itemId: string, photoId: string) {
  return apiClient
    .patch<
      OpResponse<"setRepresentative">
    >(`/api/logs/${logId}/items/${itemId}/photos/${photoId}/representative`)
    .then((res) => unwrap(res));
}

export function addHashtag(logId: string, itemId: string, body: OpBody<"addHashtag">) {
  return apiClient
    .post<OpResponse<"addHashtag">>(`/api/logs/${logId}/items/${itemId}/hashtags`, body)
    .then((res) => unwrap(res));
}

export function deleteHashtag(logId: string, itemId: string, hashtagId: string) {
  return apiClient.delete(`/api/logs/${logId}/items/${itemId}/hashtags/${hashtagId}`);
}
