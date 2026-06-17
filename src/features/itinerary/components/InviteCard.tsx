import { cn } from "@/shared/utils";
import { Card } from "@/components";
import { FriendAvatarGrid } from "./FriendAvatarGrid";

interface Friend {
  imageUrl?: string;
}

interface InviteCardProps {
  friends: Friend[];
  total: number;
  onInvite?: () => void;
  className?: string;
}

export function InviteCard({ friends, total, onInvite, className }: InviteCardProps) {
  return (
    <Card
      variant="glass-lg"
      className={cn("flex flex-col items-center gap-4 px-6 py-6", className)}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="font-paperlogy font-semibold text-[14px] text-text-heading leading-relaxed">
          친구들이 모두 모이면{"\n"}일정을 짜러 갈 수 있어요 🐾
        </p>
        <p className="font-paperlogy text-[13px] text-sub-gray">
          ({friends.length}/{total})
        </p>
      </div>

      <FriendAvatarGrid friends={friends} total={total} avatarSize={56} />

      <button onClick={onInvite}>
        <span className="font-paperlogy text-[13px] text-sub-deepblue underline underline-offset-2">
          친구 초대하기
        </span>
      </button>
    </Card>
  );
}
