import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { countFormat } from "@/utils/format";

type PostLikeControlProps = {
  likeCount: number;
  isLiked: boolean;
  isRunning: boolean;
  showLoading: boolean;
  onLike: () => void;
};

export function PostLikeControl({
  likeCount,
  isLiked,
  isRunning,
  showLoading,
  onLike,
}: PostLikeControlProps) {
  return (
    <div className="detail-like-control">
      <Button
        type="button"
        variant="ghost"
        disabled={isRunning}
        isLoading={showLoading}
        loadingLabel="좋아요 처리 중"
        onClick={onLike}
        aria-label={`좋아요 ${countFormat(likeCount)}개`}
        aria-pressed={isLiked}
        className={isLiked ? "detail-like-button detail-like-button--liked" : "detail-like-button"}
      >
        {isLiked ? (
          <span className="detail-like-icon" aria-hidden="true">
            <Icon name="heartDetailFilled" size="lg" className="detail-like-icon-fill" />
            <Icon name="heartDetail" size="lg" className="detail-like-icon-outline" />
          </span>
        ) : (
          <Icon name="heartDetail" size="lg" />
        )}
      </Button>
      <span className="detail-like-count">{countFormat(likeCount)}</span>
    </div>
  );
}
