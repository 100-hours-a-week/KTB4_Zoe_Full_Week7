import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getMyPage, getMyPageActivities } from "@/api/users";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Layout } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { MyPageActivityItem, MyPageProfile, MyPageStats, MyPageTab } from "@/types/domain";
import { countFormat, formatRelativeTime } from "@/utils/format";

const TABS: { value: MyPageTab; label: string }[] = [
  { value: "written", label: "내가 쓴 글" },
  { value: "participated", label: "참여한 투표" },
  { value: "liked", label: "좋아요한 글" },
];

export function MyPage() {
  const { user } = useAuth();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<MyPageProfile | null>(null);
  const [stats, setStats] = useState<MyPageStats | null>(null);
  const [activeTab, setActiveTab] = useState<MyPageTab>("written");
  const [activities, setActivities] = useState<MyPageActivityItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [error, setError] = useState("");
  const [nextError, setNextError] = useState("");
  const [shouldRetryInitial, setShouldRetryInitial] = useState(true);
  const showInitialLoading = useDelayedLoading(isInitialLoading);
  const showNextLoading = useDelayedLoading(isNextLoading);

  const loadInitialPage = useCallback(async () => {
    setIsInitialLoading(true);
    setError("");
    setShouldRetryInitial(true);
    try {
      const response = await getMyPage();
      const { profile: nextProfile, stats: nextStats, activity } = response.data;
      setProfile(nextProfile);
      setStats(nextStats);
      setActiveTab(activity.tab);
      setActivities(activity.items ?? []);
      setNextCursor(activity.next_cursor ?? null);
      setHasNext(Boolean(activity.has_next));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "마이페이지를 불러오지 못했습니다.");
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  const loadActivities = useCallback(async (tab: MyPageTab) => {
    setIsInitialLoading(true);
    setError("");
    setNextError("");
    setShouldRetryInitial(false);
    setActivities([]);
    setNextCursor(null);
    setHasNext(false);
    try {
      const response = await getMyPageActivities(tab);
      setActivities(response.data.items ?? []);
      setNextCursor(response.data.next_cursor ?? null);
      setHasNext(Boolean(response.data.has_next));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "활동 목록을 불러오지 못했습니다.");
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  const loadNextPage = useCallback(async () => {
    if (isNextLoading || !hasNext || nextCursor == null) return;

    setIsNextLoading(true);
    setNextError("");
    try {
      const response = await getMyPageActivities(activeTab, nextCursor);
      setActivities((previous) => [...previous, ...(response.data.items ?? [])]);
      setNextCursor(response.data.next_cursor ?? null);
      setHasNext(Boolean(response.data.has_next));
    } catch (loadError) {
      setNextError(loadError instanceof Error ? loadError.message : "활동을 더 불러오지 못했습니다.");
    } finally {
      setIsNextLoading(false);
    }
  }, [activeTab, hasNext, isNextLoading, nextCursor]);

  useEffect(() => {
    loadInitialPage();
  }, [loadInitialPage]);

  useInfiniteScroll(sentinelRef, loadNextPage, hasNext && !isInitialLoading && !isNextLoading && !nextError);

  function handleTabChange(tab: MyPageTab) {
    if (tab === activeTab || isInitialLoading) return;
    setActiveTab(tab);
    loadActivities(tab);
  }

  const displayNickname = profile ? profile.nickname : user?.nickname;
  const displayEmail = profile ? profile.email : user?.email;
  const displayProfileImage = profile ? profile.profile_image : user?.profileImage;

  return (
    <RequireAuth>
      <Layout narrow>
        <section className="mypage-panel" aria-labelledby="mypage-title">
          <h1 className="sr-only" id="mypage-title">마이페이지</h1>

          <div className="mypage-profile-card">
            <Avatar src={displayProfileImage} nickname={displayNickname} size="lg" />
            <div className="mypage-profile-info">
              <strong>{displayNickname}</strong>
              <span>{displayEmail}</span>
              {stats ? (
                <dl className="mypage-stats">
                  <div>
                    <dt>작성글</dt>
                    <dd>{countFormat(stats.post_count)}</dd>
                  </div>
                  <div>
                    <dt>참여 투표</dt>
                    <dd>{countFormat(stats.poll_participation_count)}</dd>
                  </div>
                  <div>
                    <dt>받은 좋아요</dt>
                    <dd>{countFormat(stats.received_like_count)}</dd>
                  </div>
                </dl>
              ) : null}
            </div>
            <Link className="mypage-edit-link" to="/profile/edit">정보 수정</Link>
          </div>

          <nav className="mypage-tabs" aria-label="마이페이지 탭">
            {TABS.map((tab) => (
              <button
                className={activeTab === tab.value ? "active" : ""}
                type="button"
                aria-selected={activeTab === tab.value}
                disabled={isInitialLoading}
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {showInitialLoading ? (
            <section className="empty-state" role="status" aria-live="polite">활동을 불러오는 중...</section>
          ) : null}
          {!isInitialLoading && error ? (
            <section className="error-state" role="alert">
              <p>{error}</p>
              <Button type="button" variant="ghost" onClick={shouldRetryInitial ? loadInitialPage : () => loadActivities(activeTab)}>
                다시 시도
              </Button>
            </section>
          ) : null}
          {!isInitialLoading && !error && activities.length === 0 ? (
            <section className="empty-state">아직 활동 내역이 없어요</section>
          ) : null}
          {!isInitialLoading && !error && activities.length > 0 ? (
            <div className="mypage-activity-list">
              {activities.map((activity) => (
                <Link className="mypage-activity-card" to={`/posts/${activity.post_id}`} key={activity.post_id}>
                  <div className="mypage-card-meta">
                    <time dateTime={activity.activity_at.replace(" ", "T")}>
                      {formatRelativeTime(activity.activity_at)}
                    </time>
                  </div>
                  <strong>{activity.title}</strong>
                  <p>
                    <span><Icon name="heart" size="sm" /> {countFormat(activity.like_count)}</span>
                    <span><Icon name="comment" size="sm" /> {countFormat(activity.comment_count)}</span>
                    {activity.participant_count > 0 ? (
                      <span><Icon name="participationActive" size="sm" /> {countFormat(activity.participant_count)}명 참여</span>
                    ) : null}
                  </p>
                </Link>
              ))}
            </div>
          ) : null}
          {showNextLoading ? <div className="empty-state" role="status" aria-live="polite">더 불러오는 중...</div> : null}
          {!isNextLoading && nextError ? (
            <section className="error-state" role="alert">
              <p>{nextError}</p>
              <Button type="button" variant="ghost" onClick={loadNextPage}>다시 시도</Button>
            </section>
          ) : null}
          <div ref={sentinelRef} />
        </section>
      </Layout>
    </RequireAuth>
  );
}
