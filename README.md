<div align="center">
  <img width="128" height="128" alt="Votle logo" src="./src/assets/votle-logo.svg" />
</div>

<p align="center">
  질문을 게시하고 다양한 의견을 투표로 확인하는 커뮤니티 서비스<br/>
  Votle 프론트엔드 레포지토리입니다.
</p>


> ⚠️ 원활한 실행을 위해 연결 가능한 Votle 백엔드 API가 필요합니다.

---

## 📌 Overview

**Votle**은 게시글에 투표를 더해 다양한 의견을 쉽고 빠르게 모을 수 있는 커뮤니티 서비스입니다.<br/>
사용자는 게시글을 작성하고 투표를 생성하거나, 다른 사용자의 투표에 참여하고 댓글로 의견을 나눌 수 있습니다.

- 게시글과 투표를 한 화면에서 확인
- 투표 참여 후 항목별 결과와 참여 인원 확인
- 댓글과 좋아요를 통한 게시글 상호작용
- 마이페이지에서 작성·참여·좋아요 활동 관리
- 세션 기반 인증과 CSRF 보호를 적용한 API 연동

## 🛠 Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- PostCSS / Autoprefixer

### API & State

- Fetch API 기반 공통 API 클라이언트
- React Context 기반 인증 상태 관리
- Custom Hooks 기반 비동기 액션, 무한 스크롤, 투표·댓글 상태 관리

### Deployment

- Docker 멀티 스테이지 빌드
- Nginx 정적 파일 서버

## ⚙️ Core Features

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

## 🏗 Architecture

> React Router 기반 페이지 라우팅 + Context 기반 인증 상태 관리  
> `apiClient`를 통한 백엔드 API 통신 및 세션·CSRF 토큰 처리  
> Vite 개발 서버 프록시 + Docker/Nginx 프로덕션 배포

```text
Browser
  ↓
React Router
  ↓
Pages / Components
  ↓
Custom Hooks / AuthContext
  ↓
apiClient (Fetch, credentials, CSRF, token refresh)
  ↓
Votle Backend API
```

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

## 🧠 VDOM Deep Dive

React를 사용하면서 추상적으로만 이해했던 VDOM의 동작을 직접 확인하기 위해, 별도의 [VDOM 구현 브랜치](https://github.com/100-hours-a-week/KTB4_Zoe_Full_Week7/tree/vdom)를 만들었습니다.
학습용으로 작은 VDOM을 직접 구현하고, 좋아요 버튼과 게시글 카드에 적용하면서 **VNode 생성 → 실제 DOM 변환 → 이벤트 연결 → Diff → DOM 업데이트**의 전체 흐름을 확인했습니다.

### VDOM이란?

VDOM(Virtual DOM)은 실제 DOM을 바로 조작하는 대신, UI를 JavaScript 객체 형태의 **Virtual Node(VNode)**로 표현하는 방식입니다.
상태가 변경되면 새로운 VNode를 만들고 이전 VNode와 비교한 뒤, 실제 DOM에서 변경이 필요한 부분만 업데이트합니다.

이 과정을 통해 애플리케이션 코드는 “어떤 DOM API를 호출할지”보다 “현재 UI가 어떤 모습이어야 하는지”에 집중할 수 있습니다.

### 직접 구현한 VNode 구조

`h()` 함수는 태그 이름, 속성, 자식 노드를 받아 다음과 같은 VNode를 생성합니다.

```js
{
  type: "button",
  props: {
    id: "like-button",
    class: "counter like-button",
    onClick: handleLike
  },
  children: [
    { type: "span", props: {}, children: ["좋아요"] },
    { type: "span", props: {}, children: [0] }
  ]
}
```

이 구조에서는 DOM 요소 자체가 아니라 UI를 표현하는 데이터가 먼저 만들어집니다. `LikeButton()`과 `PostCard()`도 실제 DOM을 반환하지 않고 `h()`로 구성한 VNode를 반환하도록 작성했습니다.

### 구현 과정

#### 1. VNode를 실제 DOM으로 변환

`createElement()`는 VNode를 재귀적으로 순회하면서 실제 DOM을 생성합니다.

- 문자열과 숫자는 텍스트 노드로 변환
- VNode의 `type`으로 HTML 요소 생성
- `props`를 DOM 속성으로 적용
- `children`에 같은 변환 과정을 재귀적으로 적용

그 후 `render()`가 생성된 DOM을 루트 컨테이너에 삽입해 화면에 표시합니다.

#### 2. 이벤트 핸들러 연결

모든 속성을 `setAttribute()`로 처리하면 함수 형태의 이벤트 핸들러가 정상적으로 동작하지 않습니다.
따라서 `on`으로 시작하면서 값이 함수인 속성은 `onclick`, `onchange`와 같은 DOM 이벤트 프로퍼티에 직접 연결했습니다.

```js
if (name.startsWith("on") && typeof value === "function") {
  element[name.toLowerCase()] = value;
}
```

속성 갱신 시에는 새 이벤트 핸들러를 교체하고, 이전 VNode에만 존재하는 이벤트 핸들러는 `null`로 초기화해 오래된 핸들러가 남지 않도록 처리했습니다.

#### 3. Diff 알고리즘 구현

`updateElement()`는 이전 VNode와 새로운 VNode를 비교해 다음과 같은 상황을 처리합니다.

| 비교 상황 | 실제 DOM 처리 |
|------|------|
| 새 노드가 없고 이전 노드만 존재 | 기존 DOM 노드 제거 |
| 새 노드만 존재 | DOM 노드 생성 및 삽입 |
| 문자열·숫자 값이 변경됨 | 텍스트 노드 교체 |
| 노드의 JavaScript 타입 또는 태그가 다름 | 기존 노드를 새 노드로 교체 |
| 같은 태그의 노드 | 속성 비교 후 자식 노드 재귀 비교 |

같은 태그라면 DOM 전체를 다시 만들지 않고 `updateAttributes()`로 변경된 속성만 반영합니다. 자식 노드는 공통 범위를 먼저 비교한 뒤, 삭제되는 노드는 인덱스가 밀리지 않도록 뒤에서부터 제거하고 새로운 노드는 마지막에 추가했습니다.

#### 4. 구현 중 발견한 엣지 케이스

- 숫자 `0`은 유효한 텍스트 노드이므로 `if (!newNode)`처럼 falsy 여부로 노드 존재를 판단하면 안 됩니다. `null`과 `undefined`를 기준으로 노드의 부재를 판단해야 합니다.
- 자식 Diff를 재귀 호출할 때 현재 자식의 인덱스를 전달하지 않으면 모든 비교가 첫 번째 DOM 노드를 대상으로 실행됩니다.
- 이전 상태를 추측해 이전 VNode를 만들면 실제 화면과 비교 기준이 달라질 수 있습니다. 실제로 렌더링한 VNode를 저장해 다음 Diff의 이전 값으로 사용해야 합니다.
- 이전 VNode에만 존재하는 속성을 제거하지 않으면 화면에 오래된 속성이 남습니다. 새 props에 없는 이전 props와 이벤트 핸들러를 함께 정리해야 합니다.
- 태그가 변경된 경우에는 기존 DOM을 재사용할 수 없으므로 해당 위치의 노드를 통째로 교체해야 합니다.

### 학습 결과와 한계

이번 구현을 통해 React의 렌더링을 단순화된 형태로 따라가며, 상태 변경이 곧바로 전체 DOM 교체를 의미하지 않는 이유를 코드 수준에서 이해할 수 있었습니다.
특히 VNode를 저장하고 다음 렌더링 결과와 비교하는 구조를 만들면서, 선언적 UI와 DOM 업데이트 사이의 연결을 구체적으로 확인했습니다.

다만 이 구현은 VDOM의 핵심 원리를 학습하기 위한 버전입니다. React와 같은 키 기반 자식 재조정, 컴포넌트 생명주기, 배치 업데이트, 스케줄링과 동시성 렌더링까지 포함하지는 않습니다.

### 참고 자료

- [VDOM 구현 브랜치 바로가기](https://github.com/100-hours-a-week/KTB4_Zoe_Full_Week7/tree/vdom)
- [React 쓰면서 VDOM diff 과정 설명 못 했던 사람? (저요…) - Velog](https://velog.io/@yereong/vdom1)

## 🚀 Quick Start

### 1. 설치

```bash
npm ci
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성합니다.

```env
VITE_API_BASE_URL=/api
```

`VITE_API_BASE_URL`을 생략하면 `/api`가 기본값으로 사용됩니다. 개발 환경에서 `/api` 요청은 `vite.config.ts`에 설정된 백엔드 주소로 프록시됩니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버는 [http://localhost:5173](http://localhost:5173)에서 실행됩니다.

### 4. 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 🐳 Docker

```bash
docker build -t votle-frontend .
docker run --rm -p 8080:80 votle-frontend
```

브라우저에서 [http://localhost:8080](http://localhost:8080)으로 접속합니다.

API 주소를 빌드 시 지정할 수 있습니다.

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com/api \
  -t votle-frontend .
```

컨테이너의 `/health` 경로는 상태 확인용으로 사용할 수 있습니다.

## 📂 Project Structure

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

## 📈 Result

- 게시글 중심의 투표 커뮤니티 화면 구현
- 커서 기반 게시글 목록 및 마이페이지 활동 조회 구현
- 로그인 상태에 따른 페이지 접근 및 사용자 액션 제어
- 투표 결과 시각화와 댓글 상호작용 UI 구현
- Docker와 Nginx를 활용한 정적 프론트엔드 배포 구성

## 🤔 Retrospective

- 반복되는 API 요청 로직을 `apiClient`로 통합해 인증·오류 처리를 일관되게 관리했습니다.
- 투표, 댓글, 무한 스크롤처럼 상태 변화가 많은 기능은 Custom Hook으로 분리했습니다.
- API 응답 필드의 호환성을 고려해 도메인 타입에서 여러 응답 형태를 안전하게 처리하도록 구성했습니다.
- 세션 만료와 네트워크 오류를 사용자에게 안내하고, 인증 상태가 자연스럽게 초기화되도록 했습니다.

## 👩🏻‍💻 Contribution

- React + TypeScript 기반 페이지 및 컴포넌트 개발
- 게시글 작성·수정·상세·투표 기능 구현
- 로그인·회원가입·세션 갱신 및 접근 제어 구현
- 댓글·좋아요·마이페이지 기능 구현
- Docker/Nginx 기반 프로덕션 배포 설정

## 📜 Available Scripts

| 명령어 | 설명 |
|------|------|
| `npm run dev` | Vite 개발 서버 실행 |
| `npm run build` | TypeScript 검사 및 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 로컬 확인 |
