import { Link } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import type { Post } from "@/types/domain";
import { getPostId } from "@/utils/format";

type PostDetailHeaderProps = {
  post: Post;
  isOwner: boolean;
  onDelete: () => void;
};

export function PostDetailHeader({ post, isOwner, onDelete }: PostDetailHeaderProps) {
  const writer = post.writer ?? {};

  return (
    <header className="detail-author">
      <Avatar src={writer.profile_image ?? writer.profileImage} nickname={writer.nickname} size="lg" />
      <div>
        <strong>{writer.nickname ?? "사용자"}</strong>
        <span>{post.created_at ?? post.createdAt ?? ""}</span>
      </div>
      <div className="detail-actions">
        <button className="detail-menu-trigger" type="button" aria-label="게시글 메뉴">
          <Icon name="more" size="lg" />
        </button>
        {isOwner ? (
          <div className="detail-menu-panel">
            <Link
              to={`/posts/${getPostId(post)}/edit`}
              state={{ post }}
            >
              <Icon name="edit" size="sm" />
              수정
            </Link>
            <button type="button" onClick={onDelete}>
              <Icon name="trash" size="sm" />
              삭제
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
