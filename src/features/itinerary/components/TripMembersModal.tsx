"use client";

import { useQuery } from "@tanstack/react-query";
import { Modal, LoadingState, EmptyState } from "@/components";
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
      {isLoading ? (
        <LoadingState message="멤버를 불러오는 중이에요" />
      ) : !members || members.length === 0 ? (
        <EmptyState title="아직 참여한 친구가 없어요" size="sm" />
      ) : (
        <ul className="flex w-full flex-col gap-2">
          {members.map((member) => (
            <li
              key={member.userId}
              className="flex items-center justify-between rounded-lg bg-system-navbg px-4 py-2.5"
            >
              <span className="text-md font-medium text-text-primary">
                {member.nickname ?? "친구"}
              </span>
              {member.isLeader && (
                <span className="rounded-md bg-main-blue/10 px-2 py-0.5 text-xs font-semibold text-main-blue">
                  방장
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
