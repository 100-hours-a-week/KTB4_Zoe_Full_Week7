import { Link, useNavigate } from "react-router-dom";
import { logout } from "@/api/auth";
import { Avatar } from "@/components/Avatar";
import { Logo } from "@/components/Logo";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useAuth } from "@/contexts/AuthContext";

type HeaderProps = {
  backTo?: string;
};

export function Header({ backTo }: HeaderProps) {
  const navigate = useNavigate();
  const { authStatus, user, clearUser } = useAuth();
  const logoutAction = useAsyncAction();

  async function handleLogout() {
    await logoutAction.run(async () => {
      await logout();
      clearUser();
      navigate("/login");
    });
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="header-leading">
          {backTo ? (
            <Link className="back-button" to={backTo} aria-label="이전 페이지로 이동">
              ‹
            </Link>
          ) : null}
          <Logo to="/posts" ariaLabel="Votle 게시글 목록" />
        </div>

        <div className="header-actions">
          {/* v2: search */}
          {/* <div className="search-pill" aria-hidden="true">
            <Icon name="search" />
            <span>검색</span>
          </div> */}

          {authStatus === "authenticated" && user ? (
            <div className="profile-menu">
              <button className="profile-menu-button" type="button" aria-label="프로필 메뉴">
                <Avatar src={user.profileImage} nickname={user.nickname} />
              </button>
              <nav className="profile-menu-panel" aria-label="프로필 메뉴">
                <div className="profile-menu-user">
                  <Avatar src={user.profileImage} nickname={user.nickname} size="sm" />
                  <div>
                    <strong>{user.nickname}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>
                <Link to="/mypage">마이페이지</Link>
                <Link to="/profile/edit">정보 수정하기</Link>
                <button type="button" onClick={handleLogout}>
                  로그아웃하기
                </button>
              </nav>
            </div>
          ) : (
            <nav className="auth-links" aria-label="회원 메뉴">
              <Link to="/login">로그인</Link>
              <Link to="/signup">회원가입</Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
