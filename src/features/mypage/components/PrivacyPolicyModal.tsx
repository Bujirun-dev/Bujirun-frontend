"use client";

import { Modal } from "@/components/ui/Modal";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 핵심 항목만 요약 - 전문은 추후 별도 페이지/외부 링크로 연결 예정
const POLICY_SECTIONS = [
  {
    title: "수집하는 개인정보",
    content: "카카오 계정 정보(닉네임, 프로필), GPS 위치 정보, 여행 기록 및 방문 사진",
  },
  {
    title: "이용 목적",
    content: "맞춤 일정 추천, 도감 방문 인증, 서비스 품질 개선을 위한 통계 분석",
  },
  {
    title: "보관 기간",
    content: "회원 탈퇴 시 즉시 파기하며, 관련 법령에 따라 일부 정보는 별도 보관될 수 있습니다",
  },
  {
    title: "제3자 제공",
    content: "부산시 관광 정책 수립을 위해 비식별화된 이동·방문 데이터가 활용될 수 있습니다",
  },
];

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="약관 및 개인정보 활용"
      hideActions
      childrenVariant="plain"
      className="max-h-[75dvh]"
    >
      <div className="flex w-full flex-col gap-4">
        {POLICY_SECTIONS.map(({ title, content }) => (
          <div key={title} className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-text-heading">{title}</h3>
            <p className="text-xs leading-relaxed text-sub-darkgray">{content}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
