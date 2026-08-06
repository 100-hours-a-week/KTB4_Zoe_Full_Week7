import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Toast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";

export type PostEditorPollOption = {
  optionId?: number;
  content: string;
};

export type PostEditorValues = {
  title: string;
  content: string;
  image?: File;
  pollOptions?: PostEditorPollOption[];
};

type PostEditorFormProps = {
  title: string;
  submitText: string;
  initialValues?: Partial<PostEditorValues> & { imageName?: string };
  description?: string;
  enablePoll?: boolean;
  helper?: string;
  toastMessage?: string | null;
  onSubmit: (values: PostEditorValues) => Promise<void>;
  onDraftSave?: (values: PostEditorValues) => Promise<void>;
};

function createBasePostFormData(values: PostEditorValues) {
  const formData = new FormData();
  formData.append("title", values.title.trim());
  formData.append("content", values.content.trim());
  if (values.image) formData.append("images", values.image);
  return formData;
}

export function createPostFormData(values: PostEditorValues) {
  const formData = createBasePostFormData(values);
  values.pollOptions?.forEach((option) => formData.append("poll_options", option.content.trim()));
  return formData;
}

export function createPostUpdateFormData(values: PostEditorValues, includePoll = true) {
  const formData = createBasePostFormData(values);
  if (includePoll && values.pollOptions) {
    formData.append(
      "poll",
      new Blob(
        [JSON.stringify({
          options: values.pollOptions.map((option) => ({
            ...(option.optionId == null ? {} : { option_id: option.optionId }),
            content: option.content.trim(),
          })),
        })],
        { type: "application/json" },
      ),
    );
  }
  return formData;
}

export function PostEditorForm({
  title,
  submitText,
  initialValues,
  description = "궁금한 걸 자유롭게 물어보세요",
  enablePoll = false,
  helper,
  toastMessage,
  onSubmit,
  onDraftSave,
}: PostEditorFormProps) {
  const [values, setValues] = useState<PostEditorValues>({
    title: initialValues?.title ?? "",
    content: initialValues?.content ?? "",
    pollOptions: enablePoll
      ? initialValues?.pollOptions ?? [{ content: "" }, { content: "" }]
      : undefined,
  });
  const [fileName, setFileName] = useState(initialValues?.imageName ?? "파일을 선택해주세요.");
  const submitAction = useAsyncAction();
  const draftAction = useAsyncAction();
  const latestValuesRef = useRef(values);
  const autoSaveToastTimeoutRef = useRef<number | null>(null);
  const [autoSaveToastMessage, setAutoSaveToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setValues({
      title: initialValues?.title ?? "",
      content: initialValues?.content ?? "",
      pollOptions: enablePoll
        ? initialValues?.pollOptions ?? [{ content: "" }, { content: "" }]
        : undefined,
    });
    setFileName(initialValues?.imageName ?? "파일을 선택해주세요.");
  }, [enablePoll, initialValues?.content, initialValues?.imageName, initialValues?.pollOptions, initialValues?.title]);

  useEffect(() => {
    latestValuesRef.current = values;
  }, [values]);

  useEffect(() => () => {
    if (autoSaveToastTimeoutRef.current !== null) {
      window.clearTimeout(autoSaveToastTimeoutRef.current);
    }
  }, []);

  function showAutoSaveToast() {
    setAutoSaveToastMessage("임시저장 완료");
    if (autoSaveToastTimeoutRef.current !== null) {
      window.clearTimeout(autoSaveToastTimeoutRef.current);
    }
    autoSaveToastTimeoutRef.current = window.setTimeout(() => {
      setAutoSaveToastMessage(null);
      autoSaveToastTimeoutRef.current = null;
    }, 1_800);
  }

  function handleDraftButtonClick() {
    if (!onDraftSave) return;
    if (!values.title.trim() && !values.content.trim() && !values.image) return;

    void draftAction.run(async () => {
      await onDraftSave(values);
      showAutoSaveToast();
    });
  }

  useEffect(() => {
    if (!onDraftSave) return;

    const timerId = window.setInterval(() => {
      const currentValues = latestValuesRef.current;
      if (currentValues.title.trim() || currentValues.content.trim() || currentValues.image) {
        onDraftSave(currentValues)
          .then(showAutoSaveToast)
          .catch(console.error);
      }
    }, 60_000);

    return () => window.clearInterval(timerId);
  }, [onDraftSave]);

  const pollOptions = values.pollOptions ?? [];
  const isPollValid = !enablePoll || (
    pollOptions.length >= 2 &&
    pollOptions.length <= 5 &&
    pollOptions.every((option) => option.content.trim().length >= 1 && option.content.trim().length <= 30)
  );
  const isValid = Boolean(values.title.trim() && values.content.trim() && isPollValid);

  function updatePollOption(index: number, content: string) {
    setValues((prev) => ({
      ...prev,
      pollOptions: (prev.pollOptions ?? []).map((option, optionIndex) =>
        optionIndex === index ? { ...option, content } : option,
      ),
    }));
  }

  function addPollOption() {
    setValues((prev) => ({ ...prev, pollOptions: [...(prev.pollOptions ?? []), { content: "" }] }));
  }

  function removePollOption(index: number) {
    setValues((prev) => ({
      ...prev,
      pollOptions: (prev.pollOptions ?? []).filter((_, optionIndex) => optionIndex !== index),
    }));
  }

  return (
    <section className="editor-panel">
      <div className="editor-heading">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <form
        className="editor-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!isValid) return;
          submitAction.run(() => onSubmit(values));
        }}
      >
        {toastMessage ? (
          <Toast
            message={toastMessage}
            variant="error"
            icon="alert"
            className="editor-toast"
          />
        ) : null}
        {autoSaveToastMessage ? (
          <Toast
            message={autoSaveToastMessage}
            icon="successCheck"
            className="editor-toast editor-toast--success"
          />
        ) : null}
        <div className="editor-card">
          <input
            className="editor-title-input"
            maxLength={26}
            placeholder="제목을 입력하세요. (최대 26글자)"
            value={values.title}
            onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
          />
          <textarea
            className="editor-textarea"
            placeholder="본문을 입력하세요."
            value={values.content}
            onChange={(event) => setValues((prev) => ({ ...prev, content: event.target.value }))}
          />
          {enablePoll ? (
            <section className="poll-editor" aria-label="투표 항목">
              <div className="poll-editor-heading">
                <strong>투표 항목</strong>
                <span>(최대 5개)</span>
              </div>
              <div className="poll-option-list">
                {pollOptions.map((option, index) => (
                  <div className="poll-option-row" key={`poll-option-${index}`}>
                    <span className="poll-option-number">{index + 1}</span>
                    <input
                      className="poll-option-input"
                      maxLength={30}
                      placeholder="투표 항목을 입력하세요."
                      value={option.content}
                      onChange={(event) => updatePollOption(index, event.target.value)}
                    />
                    <button
                      className="poll-option-remove"
                      type="button"
                      aria-label={`${index + 1}번 투표 항목 삭제`}
                      disabled={pollOptions.length <= 2}
                      onClick={() => removePollOption(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="poll-option-add"
                type="button"
                disabled={pollOptions.length >= 5}
                onClick={addPollOption}
              >
                <span aria-hidden="true">＋</span>
                항목 추가
              </button>
            </section>
          ) : null}
          {helper ? <p className="helper helper--error">{helper}</p> : null}
          <div className="file-field">
            <label className="file-button">
              파일 선택
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setValues((prev) => ({ ...prev, image: file }));
                  setFileName(file?.name ?? "파일을 선택해주세요.");
                }}
              />
            </label>
            <span>{fileName}</span>
          </div>
        </div>

        <div className="editor-actions">
          {onDraftSave ? (
            <Button
              type="button"
              variant="ghost"
              isLoading={draftAction.showLoading}
              loadingLabel="임시저장 중"
              onClick={handleDraftButtonClick}
            >
              임시저장
            </Button>
          ) : null}
          <Button
            type="submit"
            disabled={!isValid || submitAction.isRunning}
            isLoading={submitAction.showLoading}
            loadingLabel={`${submitText} 처리 중`}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </section>
  );
}
