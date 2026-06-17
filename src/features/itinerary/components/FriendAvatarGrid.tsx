import Image from "next/image";
import { cn } from "@/shared/utils";

interface Friend {
  imageUrl?: string;
}

interface FriendAvatarGridProps {
  friends: Friend[];
  total: number;
  avatarSize?: number;
  className?: string;
}

export function FriendAvatarGrid({
  friends,
  total,
  avatarSize = 64,
  className,
}: FriendAvatarGridProps) {
  const slots = Array.from({ length: total });

  return (
    <div className={cn("grid grid-cols-3 gap-3 justify-items-center", className)}>
      {slots.map((_, i) => {
        const friend = friends[i];
        return (
          <div
            key={i}
            className={cn(
              "rounded-full overflow-hidden",
              !friend && "border-2 border-dashed border-sub-lightgray bg-transparent"
            )}
            style={{ width: avatarSize, height: avatarSize }}
          >
            {friend?.imageUrl && (
              <div className="relative w-full h-full">
                <Image src={friend.imageUrl} alt={`friend-${i}`} fill className="object-cover" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
