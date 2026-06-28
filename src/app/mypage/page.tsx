import { MypageProfile } from "@/features/mypage/components";
import { MypageMenuList } from "@/features/mypage/components";

export default function MypagePage() {
  return (
    <div className="flex flex-col gap-5 px-[24px] pt-[24px] pb-[24px]">
      <MypageProfile />
      <MypageMenuList />
    </div>
  );
}
