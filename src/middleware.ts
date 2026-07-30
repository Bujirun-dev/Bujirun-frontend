import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 로그인 없이 접근 가능한 경로
const PUBLIC_PATHS = ["/login", "/auth/kakao/callback"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // public 경로는 인증 없이 통과
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // refresh_token 쿠키 존재 여부로 로그인 상태 판단 (httpOnly 쿠키, 백엔드에서 발급)
  const hasRefreshToken = request.cookies.has("refresh_token");

  if (!hasRefreshToken) {
    // 비로그인 상태면 /login으로 리다이렉트, 원래 경로는 redirect 파라미터로 전달
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // 정적 파일, 이미지, favicon, API 라우트는 미들웨어 제외
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
