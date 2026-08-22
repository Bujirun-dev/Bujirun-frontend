"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Modal, LoadingState, EmptyState } from "@/components";
import { PROFILE_IMAGES } from "@/components/profile/profileImages";
import { groupApi } from "@/shared/api/domains";
import { buildAvatarRows } from "../utils/avatarLayout";

interface TripMembersModalProps {
  isOpen: boolean;
  groupId: string;
  onClose: () => void;
}

export function TripMembersModal({ isOpen, groupId, onClose }: TripMembersModalProps) {
  const { data: members, isLoading } = useQuery({
    queryKey: groupApi.keys.members(groupId),
    queryFn: () => groupApi.getGroupMembers(groupId),
    enabled: isOpen && !!groupId,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="여행 멤버"
      hideActions
      childrenVariant="plain"
    >
      {isLoading ? (
        <LoadingState message="멤버를 불러오는 중이에요" />
      ) : !members || members.length === 0 ? (
        <EmptyState title="아직 참여한 친구가 없어요" size="sm" />
      ) : (
        <div className="flex w-full flex-col items-center gap-y-4">
          {buildAvatarRows(members.length).map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-x-4">
              {row.map((i) => {
                const member = members[i];
                return (
                  <div key={member.userId} className="flex w-[64px] flex-col items-center gap-1.5">
                    <div className="flex size-[64px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-sub-lightblue">
                      <div className="relative size-[75px] shrink-0">
                        <Image
                          src={member.profileImageUrl || PROFILE_IMAGES[i % PROFILE_IMAGES.length].src}
                          alt=""
                          fill
                          sizes="75px"
                          className="object-cover"
                          aria-hidden
                        />
                      </div>
                    </div>
                    <div className="flex max-w-full flex-col items-center gap-0.5">
                      <span className="max-w-full truncate text-sm font-semibold text-text-primary">
                        {member.nickname ?? "친구"}
                      </span>
                      {member.isLeader && (
                        <span className="rounded-md bg-main-blue/10 px-1.5 py-0.5 text-2xs font-semibold text-main-blue">
                          방장
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
