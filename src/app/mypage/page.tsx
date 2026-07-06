import { MypageProfile } from "@/features/mypage/components";
import { MypageMenuList } from "@/features/mypage/components";
import { AccountFooter } from "@/features/mypage/components";

export default function MypagePage() {
  return (
    <div className="flex min-h-full flex-col gap-5 pt-[24px] pb-[24px]">
      <MypageProfile />
      <MypageMenuList />
      <div className="mt-auto">
        <AccountFooter />
      </div>
    </div>
  );
}
