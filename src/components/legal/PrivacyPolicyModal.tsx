"use client";

import { Modal } from "@/components/ui/Modal";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 핵심 항목 요약 - 백엔드 보관/삭제 로직(User.anonymize, AccountPurgeScheduler) 기준으로 검증됨.
// 로직이 바뀌면(예: S3 사진 실제 삭제, providerId 배치 정리, 일정/찜 삭제 정책 변경) 이 문구도 같이 업데이트해야 함.
const POLICY_SECTIONS = [
  {
    title: "1. 수집하는 개인정보 항목",
    content:
      "[회원가입 및 로그인] 카카오 계정 고유 식별자(ID), 닉네임, 프로필 사진, 이메일\n[서비스 이용 과정] GPS 위치정보(방문 인증 시), 여행 일정 및 코스, 방문 인증 기록 및 사진, 찜·도감 수집 데이터",
  },
  {
    title: "2. 개인정보 및 위치정보의 이용 목적",
    content:
      "• 카카오 간편 로그인을 통한 회원 식별 및 계정 관리\n• 사용자 취향(스와이프) 분석 기반 맞춤형 여행 일정 자동 추천\n• GPS 기반 도감 방문 인증 및 대중교통 경로 안내\n• 그룹원 간 투표 기반 공동 일정 결정 지원\n• 서비스 품질 개선 및 부산 관광 활성화를 위한 통계 분석",
  },
  {
    title: "3. 개인정보의 보유 및 이용 기간",
    content:
      "• 기본 원칙: 회원 탈퇴 시 지체 없이 파기합니다.\n• 탈퇴 유예 및 복구(30일): 의도치 않은 탈퇴로 인한 데이터 손실 방지를 위해 GPS 방문 인증 기록 및 사진, 여행 기록은 탈퇴 신청일로부터 30일간 보관 후 파기되며, 이 기간 내 재가입 시 계정이 복구됩니다. 카카오 계정과의 연동은 탈퇴 즉시 해제됩니다.\n• 공동 여행 데이터 보존: 함께 여행한 그룹원의 일정 화면 유지 및 서비스 통계 목적으로 닉네임, 여행 일정, 찜·도감 수집 기록은 탈퇴 후에도 비식별 상태로 보관될 수 있습니다.",
  },
  {
    title: "4. 개인정보의 파기 절차 및 방법",
    content:
      "보유 기간이 만료되거나 처리 목적이 달성된 개인정보는 복구할 수 없는 방법으로 지체 없이 파기합니다.",
  },
  {
    title: "5. 개인정보의 제3자 제공 및 통계 데이터 활용",
    content:
      "• '부지런'은 이용자의 사전 동의 없이 개인정보를 제3자에게 제공하지 않습니다.\n• 단, 부산시 관광 정책 수립 지원 등 통계 목적의 경우 특정 개인을 식별할 수 없도록 비식별화 처리된 데이터에 한하여 활용될 수 있습니다.",
  },
  {
    title: "6. 이용자의 권리 및 행사 방법",
    content:
      "이용자는 서비스 내 [마이페이지 > 회원 탈퇴]를 통해 언제든지 개인정보의 수집·이용 동의를 철회하고 계정 삭제를 요청할 수 있습니다.",
  },
];

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="약관 및 개인정보 처리방침"
      hideActions
      childrenVariant="plain"
      className="max-h-[75dvh]"
    >
      <div className="flex w-full flex-col gap-4 overflow-y-auto pr-1">
        {POLICY_SECTIONS.map(({ title, content }) => (
          <div key={title} className="flex flex-col gap-1.5">
            <h3 className="text-sm font-bold text-text-heading">{title}</h3>
            <p className="whitespace-pre-line text-xs leading-relaxed text-sub-darkgray">
              {content}
            </p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
