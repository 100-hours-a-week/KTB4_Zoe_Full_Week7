export function PostListSkeleton({ count = 3, compact = false }: { count?: number; compact?: boolean }) {
  return (
    <div className="skeleton-stack" role="status" aria-label="게시글 목록을 불러오는 중" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <article className="post-card skeleton-card" key={index}>
          <div className="post-card-head">
            <span className="skeleton-avatar" />
            <div>
              <span className="skeleton-line w-24" />
              <span className="skeleton-line w-16 mt-2" />
            </div>
          </div>
          <span className="skeleton-line h-5 w-2/3 mt-5" />
          <span className="skeleton-line w-full mt-4" />
          {!compact ? <span className="skeleton-line w-3/5 mt-3" /> : null}
        </article>
      ))}
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <article className="detail-card skeleton-card" role="status" aria-label="게시글을 불러오는 중" aria-busy="true">
      <div className="post-card-head">
        <span className="skeleton-avatar skeleton-avatar-lg" />
        <div>
          <span className="skeleton-line w-28" />
          <span className="skeleton-line w-40 mt-2" />
        </div>
      </div>
      <span className="skeleton-line h-7 w-2/3 mt-8" />
      <span className="skeleton-line w-full mt-7" />
      <span className="skeleton-line w-4/5 mt-3" />
      <span className="skeleton-box mt-8" />
    </article>
  );
}

export function CommentListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="skeleton-stack" role="status" aria-label="댓글을 불러오는 중" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <article className="comment-row" key={index}>
          <span className="skeleton-avatar" />
          <div className="comment-bubble w-full">
            <span className="skeleton-line w-28" />
            <span className="skeleton-line w-2/3 mt-3" />
          </div>
        </article>
      ))}
    </div>
  );
}
