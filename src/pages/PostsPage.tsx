import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts } from "@/api/posts";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Layout } from "@/components/Layout";
import { LoginPromptModal } from "@/components/LoginPromptModal";
import { PostCard } from "@/components/PostCard";
import { PostListSkeleton } from "@/components/skeletons/Skeletons";
import { useAuth } from "@/contexts/AuthContext";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { Post } from "@/types/domain";

const PAGE_SIZE = 20;

export function PostsPage() {
  const navigate = useNavigate();
  const { authStatus } = useAuth();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | number | null>(null);
  const [hasNext, setHasNext] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const showInitialSkeleton = useDelayedLoading(isInitialLoading);
  const showNextSkeleton = useDelayedLoading(isNextLoading);

  const loadFirstPage = useCallback(async () => {
    setIsInitialLoading(true);
    setError("");
    try {
      const response = await getPosts(PAGE_SIZE);
      setPosts(response.data.posts ?? []);
      setNextCursor(response.data.next_cursor ?? null);
      setHasNext(Boolean(response.data.has_next));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "게시글을 불러오지 못했습니다.");
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  const loadNextPage = useCallback(async () => {
    if (isNextLoading || !hasNext || nextCursor == null) return;

    setIsNextLoading(true);
    try {
      const response = await getPosts(PAGE_SIZE, nextCursor);
      setPosts((prev) => [...prev, ...(response.data.posts ?? [])]);
      setNextCursor(response.data.next_cursor ?? null);
      setHasNext(Boolean(response.data.has_next));
    } finally {
      setIsNextLoading(false);
    }
  }, [hasNext, isNextLoading, nextCursor]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  useInfiniteScroll(sentinelRef, loadNextPage, hasNext && !isInitialLoading);

  function handleCreateClick() {
    if (authStatus === "unknown") return;
    if (authStatus === "guest") {
      setLoginPromptOpen(true);
      return;
    }
    navigate("/posts/new");
  }

  return (
    <Layout>
      <section className="feed-section">
        <div className="feed-toolbar">
          <div className="segmented">
            <button className="active" type="button">최신순</button>
            <button type="button">인기순</button>
          </div>
          <Button type="button" onClick={handleCreateClick}>
            <Icon name="write" />
            글쓰기
          </Button>
        </div>

        {showInitialSkeleton ? <PostListSkeleton /> : null}
        {!isInitialLoading && error ? (
          <section className="error-state" role="alert">
            <p>{error}</p>
            <Button type="button" variant="ghost" onClick={loadFirstPage}>다시 시도</Button>
          </section>
        ) : null}
        {!isInitialLoading && !error && posts.length === 0 ? (
          <section className="empty-state">등록된 게시글이 없어요</section>
        ) : null}
        {!isInitialLoading && !error ? (
          <div className="post-list">
            {posts.map((post) => (
              <PostCard post={post} key={`${post.post_id ?? post.id}`} />
            ))}
          </div>
        ) : null}
        {showNextSkeleton ? <PostListSkeleton count={1} compact /> : null}
        <div ref={sentinelRef} />
      </section>
      <LoginPromptModal open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} />
    </Layout>
  );
}
