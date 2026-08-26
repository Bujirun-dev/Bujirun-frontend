"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Modal, LoadingBoundary } from "@/components";
import { PROFILE_IMAGES } from "@/components/profile/profileImages";
import { groupApi } from "@/shared/api/domains";

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
      title="함께하는 친구"
      hideActions
      childrenVariant="plain"
    >
      <LoadingBoundary isLoading={isLoading} message="멤버를 불러오는 중이에요">
        <div className="flex w-full mt-2 flex-wrap justify-center gap-y-4">
          {members?.map((member, i) => (
            <div key={member.userId} className="flex flex-col items-center gap-1.5">
              <div className="relative size-[64px] shrink-0 overflow-hidden rounded-full bg-sub-lightblue">
                <Image
                  src={PROFILE_IMAGES[i % PROFILE_IMAGES.length].src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                  aria-hidden
                />
              </div>

              <div className="flex max-w-full flex-col items-center gap-1">
                <span className="max-w-full truncate text-xs font-semibold text-text-primary">
                  {member.nickname ?? "친구"}
                </span>

                {member.isLeader && (
                  <span className="rounded-md bg-system-navbg px-1.5 py-0.5 text-2xs font-semibold text-sub-deepblue">
                    방장
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </LoadingBoundary>
    </Modal>
  );
}
