import type { CSSProperties } from "react";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { RadioButton } from "@/components/RadioButton";
import { countFormat } from "@/utils/format";

export type VoteCardOption = {
  id: number | string;
  label: string;
};

export type VoteCardResult = {
  optionId: number | string;
  voteRate: string | number;
  voteCount?: number;
};

type VoteCardProps = {
  options: VoteCardOption[];
  variant?: "detail" | "list";
  selectedOptionId?: number | string | null;
  onSelect?: (optionId: number | string) => void;
  onResultSelect?: (optionId: number | string) => void;
  onSubmit?: () => void;
  submitDisabled?: boolean;
  readOnly?: boolean;
  showSubmit?: boolean;
  results?: VoteCardResult[];
  submitLoading?: boolean;
  participationCount?: number;
};

export function VoteCard({
  options,
  variant = "detail",
  selectedOptionId = null,
  onSelect,
  onResultSelect,
  onSubmit,
  submitDisabled,
  readOnly = false,
  showSubmit,
  results = [],
  submitLoading = false,
  participationCount,
}: VoteCardProps) {
  const shouldShowSubmit = showSubmit ?? variant === "detail";
  const shouldShowResults = results.length > 0;
  const resultByOptionId = new Map(results.map((result) => [result.optionId, result]));
  const maxVoteCount = Math.max(...results.map((result) => result.voteCount ?? Number(result.voteRate)), 0);

  return (
    <section
      className={`vote-card vote-card--${variant}`}
      aria-label="투표"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <div className="vote-options">
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const result = resultByOptionId.get(option.id);

          if (shouldShowResults && result) {
            const voteRate = Math.min(Math.max(Number(result.voteRate) || 0, 0), 100);
            const voteCount = result.voteCount ?? Number(result.voteRate);
            const isLeading = maxVoteCount > 0 && voteCount === maxVoteCount;
            const displayedVoteRate = voteRate === 0 ? "0" : result.voteRate;

            return (
              <button
                className={`vote-result-option ${isLeading ? "is-leading" : ""} ${voteRate >= 100 ? "is-full" : ""}`}
                type="button"
                aria-pressed={isSelected}
                disabled={isSelected || submitLoading || !onResultSelect}
                key={`${option.id}-${selectedOptionId ?? "none"}-${result.voteRate}-${result.voteCount ?? "none"}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onResultSelect?.(option.id);
                }}
              >
                <span
                  className="vote-result-fill"
                  style={{ "--vote-rate": `${voteRate}%` } as CSSProperties}
                />
                <strong className={isSelected ? "is-selected" : ""}>
                  {isSelected ? <Icon name="check" size="sm" className="vote-result-check" /> : null}
                  {option.label}
                </strong>
                <b>{displayedVoteRate}%</b>
              </button>
            );
          }

          const optionClassName = isSelected ? "vote-option-button is-selected" : "vote-option-button";
          const optionContent = (
            <>
              <RadioButton checked={isSelected} />
              <span className="vote-option-label">{option.label}</span>
            </>
          );

          if (readOnly) {
            return <div className={optionClassName} key={option.id}>{optionContent}</div>;
          }

          return (
            <button
              className={optionClassName}
              type="button"
              aria-pressed={isSelected}
              key={option.id}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onSelect?.(option.id);
              }}
            >
              {optionContent}
            </button>
          );
        })}
      </div>
      {shouldShowSubmit ? (
        <Button
          className="vote-submit-button"
          type="button"
          disabled={submitDisabled ?? selectedOptionId == null}
          isLoading={submitLoading}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onSubmit?.();
          }}
        >
          투표하기
        </Button>
      ) : null}
      {participationCount != null ? (
        <div className="vote-participation">
          <Icon name="participationClosed" size="sm" />
          {countFormat(participationCount)}명 참여
        </div>
      ) : null}
    </section>
  );
}
