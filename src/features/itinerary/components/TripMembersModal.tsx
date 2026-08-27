"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Modal, LoadingBoundary } from "@/components";
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
    <Modal isOpen={isOpen} onClose={onClose} title="여행 멤버" hideActions childrenVariant="plain">
      <LoadingBoundary isLoading={isLoading} message="멤버를 불러오는 중이에요">
        <div className="flex w-full flex-col items-center gap-y-4">
          {members &&
            buildAvatarRows(members.length).map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-x-4">
                {row.map((i) => {
                  const member = members[i];

                  const profileImageUrl = member.profileImageUrl?.trim();

                  const profileImageSrc =
                    profileImageUrl &&
                    (profileImageUrl.startsWith("http://") ||
                      profileImageUrl.startsWith("https://") ||
                      profileImageUrl.startsWith("/"))
                      ? profileImageUrl
                      : PROFILE_IMAGES[i % PROFILE_IMAGES.length].src;

                  return (
                    <div
                      key={member.userId}
                      className="flex w-[64px] flex-col items-center gap-1.5"
                    >
                      <div className="flex size-[64px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-sub-lightblue">
                        <div className="relative size-[75px] shrink-0">
                          <Image
                            src={profileImageSrc}
                            alt=""
                            fill
                            sizes="75px"
                            className="object-cover"
                            aria-hidden
                          />
                        </div>
                      </div>

                      <span className="flex max-w-full items-baseline justify-center gap-0.5 truncate text-sm font-semibold text-text-primary">
                        {member.isLeader && (
                          <span aria-label="방장" className="text-xs leading-none">
                            👑
                          </span>
                        )}
                        <span className="truncate">{member.nickname ?? "친구"}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
        </div>
      </LoadingBoundary>
    </Modal>
  );
}
