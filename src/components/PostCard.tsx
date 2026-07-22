import { Link } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import type { Post } from "@/types/domain";
import { countFormat, getPostId } from "@/utils/format";

function getWriter(post: Post) {
  return post.writer ?? {};
}

export function PostCard({ post }: { post: Post }) {
  const writer = getWriter(post);
  const postId = getPostId(post);
  const createdAt = post.created_at ?? post.createdAt ?? "";
  const likeCount = post.like_count ?? post.likeCount ?? 0;
  const commentCount = post.comment_count ?? post.commentCount ?? 0;
  const viewCount = post.view_count ?? post.viewCount ?? 0;

  return (
    <Link className="post-card" to={`/posts/${postId}`}>
      <div className="post-card-head">
        <Avatar src={writer.profile_image ?? writer.profileImage} nickname={writer.nickname} size="sm" />
        <div className="post-author">
          <strong>{writer.nickname ?? "사용자"}</strong>
          <span>{createdAt}</span>
        </div>
        {/* v2: vote status */}
        {/* <span className="status-badge status-badge--active">투표중</span> */}
      </div>
      <h2>{post.title}</h2>
      <p>{post.content ?? ""}</p>
      <div className="post-stats">
        <span><Icon name="heart" size="sm" /> {countFormat(likeCount)}</span>
        <span><Icon name="comment" size="sm" /> {countFormat(commentCount)}</span>
        <span><Icon name="eye" size="sm" /> {countFormat(viewCount)}</span>
        {/* v2: vote participation count */}
        {/* <strong><Icon name="participationActive" size="sm" /> {countFormat(Math.max(likeCount + commentCount, 0))}명 참여</strong> */}
      </div>
    </Link>
  );
}
