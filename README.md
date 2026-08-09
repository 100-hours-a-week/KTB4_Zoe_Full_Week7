<div align="center">
  <img width="128" height="128" alt="Votle logo" src="./src/assets/votle-logo.svg" />
</div>

<p align="center">
  질문을 게시하고 다양한 의견을 투표로 확인하는 커뮤니티 서비스<br/>
  Votle 프론트엔드 레포지토리입니다.
</p>


> [서비스 바로가기](http://votle.kro.kr/posts)

---

# Overview
<div align="center">
  <img height="300" alt="image" src="https://github.com/user-attachments/assets/c3e319f6-09c9-4e78-b7f8-5e943c156a75" />
  <img height="300" alt="image" src="https://github.com/user-attachments/assets/81f32a22-bb05-47a3-8d27-ea7652c21713" />
  <img height="300" alt="image" src="https://github.com/user-attachments/assets/6ac80eaf-3062-4976-81bd-c6e3df5583ef" />
</div>

**Votle**은 게시글에 투표를 더해 다양한 의견을 쉽고 빠르게 모을 수 있는 커뮤니티 서비스입니다.<br/>
사용자는 게시글을 작성하고 투표를 생성하거나, 다른 사용자의 투표에 참여하고 댓글로 의견을 나눌 수 있습니다.

- 게시글과 투표를 한 화면에서 확인
- 투표 참여 후 항목별 결과와 참여 인원 확인
- 댓글과 좋아요를 통한 게시글 상호작용
- 마이페이지에서 작성·참여·좋아요 활동 관리
- 세션 기반 인증과 CSRF 보호를 적용한 API 연동

# Tech Stack


- React 18
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- PostCSS / Autoprefixer


# Core Features

| 기능 | 설명 |
|------|------|
| 🔐 인증 | 회원가입, 로그인, 로그아웃, 세션 갱신 |
| 📝 게시글 | 게시글 작성·조회·수정·삭제 및 이미지 첨부 |
| 💾 임시 저장 | 작성 중인 게시글과 투표 항목 임시 저장 |
| 🗳️ 투표 | 투표 생성·참여·결과 확인, 2~5개 항목 지원 |
| ❤️ 좋아요 | 게시글 좋아요 등록·취소 및 개수 확인 |
| 💬 댓글 | 댓글 작성·수정·삭제 |
| 👤 마이페이지 | 작성한 글, 참여한 투표, 좋아요한 글과 사용자 통계 확인 |
| ⚙️ 계정 관리 | 프로필 수정, 비밀번호 변경, 회원 탈퇴 |

# Architecture

<img width="3685" height="1559" alt="image" src="https://github.com/user-attachments/assets/8c3fba84-11fb-47cd-b583-f4b13c847938" />


### 주요 경로

| 경로 | 설명 |
|------|------|
| `/posts` | 게시글 목록 |
| `/posts/:postId` | 게시글 상세, 투표, 댓글 |
| `/posts/new` | 게시글 작성 |
| `/posts/:postId/edit` | 게시글 수정 |
| `/login` | 로그인 |
| `/signup` | 회원가입 |
| `/mypage` | 마이페이지 |
| `/profile/edit` | 프로필 수정 및 회원 탈퇴 |
| `/password/edit` | 비밀번호 변경 |

# VDOM Deep Dive

React를 사용하면서 추상적으로만 이해했던 VDOM의 동작을 직접 확인하기 위해, 별도의 [VDOM 구현 브랜치](https://github.com/100-hours-a-week/KTB4_Zoe_Full_Week7/tree/vdom)를 만들었습니다.
학습용으로 작은 VDOM을 직접 구현하고, 좋아요 버튼과 게시글 카드에 적용하면서 **VNode 생성 → 실제 DOM 변환 → 이벤트 연결 → Diff → DOM 업데이트**의 전체 흐름을 확인했습니다.

### 참고 자료

- [VDOM 구현 브랜치 바로가기](https://github.com/100-hours-a-week/KTB4_Zoe_Full_Week7/tree/vdom)
- [React 쓰면서 VDOM diff 과정 설명 못 했던 사람? (저요…) - Velog](https://velog.io/@yereong/vdom1)



# Project Structure

```text
src/
├── api/          # 인증, 사용자, 게시글, 댓글 API
├── assets/       # 로고, 아이콘, 이미지 리소스
├── components/   # 공통 UI 및 도메인 컴포넌트
├── contexts/     # 인증 Context
├── hooks/        # 비동기 액션, 무한 스크롤, 투표·댓글 훅
├── pages/        # 라우트별 페이지
├── types/        # 도메인 및 API 타입
├── utils/        # 유효성 검사, 포맷, 스토리지 유틸리티
├── App.tsx       # 라우트 정의
└── main.tsx      # 애플리케이션 진입점
```

# Retrospective

- 반복되는 API 요청 로직을 `apiClient`로 통합해 인증·오류 처리를 일관되게 관리했습니다.
- 투표, 댓글, 무한 스크롤처럼 상태 변화가 많은 기능은 Custom Hook으로 분리했습니다.
- API 응답 필드의 호환성을 고려해 도메인 타입에서 여러 응답 형태를 안전하게 처리하도록 구성했습니다.
- 세션 만료와 네트워크 오류를 사용자에게 안내하고, 인증 상태가 자연스럽게 초기화되도록 했습니다.

