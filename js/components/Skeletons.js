function skeletonLine(className = "") {
  return `<span class="skeleton-line ${className}" aria-hidden="true"></span>`;
}

function skeletonAvatar(className = "") {
  return `<span class="skeleton-avatar ${className}" aria-hidden="true"></span>`;
}

export function PostCardSkeleton() {
  return `
    <article class="post-card post-card--skeleton">
      <div class="post-card__author">
        ${skeletonAvatar()}
        <div class="post-card__author-info">
          ${skeletonLine("skeleton-line--name")}
          ${skeletonLine("skeleton-line--time")}
        </div>
      </div>
      ${skeletonLine("skeleton-line--title")}
      ${skeletonLine("skeleton-line--body")}
      ${skeletonLine("skeleton-line--body skeleton-line--short")}
      <div class="post-card__meta">
        ${skeletonLine("skeleton-line--meta")}
      </div>
    </article>
  `;
}

export function PostListSkeleton(count = 4) {
  return `
    <div class="post-list__skeleton" role="status" aria-label="게시글 목록을 불러오는 중" aria-busy="true">
      ${Array.from({ length: count }, () => PostCardSkeleton()).join("")}
    </div>
  `;
}

export function PostDetailSkeleton() {
  return `
    <article class="post-detail post-detail--skeleton" role="status" aria-label="게시글을 불러오는 중" aria-busy="true">
      <header class="post-detail__header">
        <div class="post-detail__author">
          ${skeletonAvatar("skeleton-avatar--md")}
          <div class="post-detail__meta">
            ${skeletonLine("skeleton-line--name")}
            ${skeletonLine("skeleton-line--time")}
          </div>
        </div>
      </header>
      ${skeletonLine("skeleton-line--detail-title")}
      ${skeletonLine("skeleton-line--detail-body")}
      ${skeletonLine("skeleton-line--detail-body")}
      ${skeletonLine("skeleton-line--detail-body skeleton-line--short")}
      <div class="post-detail__counters">
        ${skeletonLine("skeleton-line--button")}
      </div>
    </article>
  `;
}

export function CommentSkeleton() {
  return `
    <article class="comment comment--skeleton">
      <div class="comment__row">
        <div class="author">
          ${skeletonAvatar("skeleton-avatar--sm")}
          <div class="author__meta">
            ${skeletonLine("skeleton-line--name")}
            ${skeletonLine("skeleton-line--time")}
          </div>
        </div>
      </div>
      ${skeletonLine("skeleton-line--comment")}
      ${skeletonLine("skeleton-line--comment skeleton-line--short")}
    </article>
  `;
}

export function CommentListSkeleton(count = 3) {
  return `
    <div class="comment-list__skeleton" role="status" aria-label="댓글을 불러오는 중" aria-busy="true">
      ${Array.from({ length: count }, () => CommentSkeleton()).join("")}
    </div>
  `;
}
