import { Link } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { Layout } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";

export function MyPage() {
  const { user } = useAuth();

  return (
    <RequireAuth>
      <Layout narrow>
        <section className="mypage-panel" aria-labelledby="mypage-title">
          <h1 className="sr-only" id="mypage-title">마이페이지</h1>

          <div className="mypage-profile-card">
            <Avatar src={user?.profileImage} nickname={user?.nickname} size="lg" />
            <div className="mypage-profile-info">
              <strong>{user?.nickname}</strong>
              <span>{user?.email} · 2024년 3월 가입</span>
              <dl className="mypage-stats">
                <div>
                  <dt>작성글</dt>
                  <dd>12</dd>
                </div>
                <div>
                  <dt>참여 투표</dt>
                  <dd>48</dd>
                </div>
                <div>
                  <dt>받은 좋아요</dt>
                  <dd>302</dd>
                </div>
              </dl>
            </div>
            <Link className="mypage-edit-link" to="/profile/edit">정보 수정</Link>
          </div>

          <nav className="mypage-tabs" aria-label="마이페이지 탭">
            <button className="active" type="button">내가 쓴 글</button>
            <button type="button">참여한 투표</button>
            <button type="button">좋아요한 글</button>
          </nav>

          <div className="mypage-activity-list">
            <Link className="mypage-activity-card" to="/posts/1">
              <div className="mypage-card-meta">
                <span className="mypage-card-status mypage-card-status--active">투표중</span>
                <span>10분 전</span>
              </div>
              <strong>주말에 갑자기 시간이 생겼다면?</strong>
              <p>좋아요 124 <span>댓글 38</span> <span>512명 참여</span></p>
            </Link>
            <Link className="mypage-activity-card" to="/posts/2">
              <div className="mypage-card-meta">
                <span className="mypage-card-status">마감</span>
                <span>2일 전</span>
              </div>
              <strong>점심 메뉴, 한식 vs 양식?</strong>
              <p>좋아요 62 <span>댓글 15</span> <span>430명 참여</span></p>
            </Link>
          </div>
        </section>
      </Layout>
    </RequireAuth>
  );
}
