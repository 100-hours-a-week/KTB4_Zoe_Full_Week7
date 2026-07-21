import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { useAsyncAction } from "@/hooks/useAsyncAction";

export type PostEditorValues = {
  title: string;
  content: string;
  image?: File;
};

type PostEditorFormProps = {
  title: string;
  submitText: string;
  initialValues?: Partial<PostEditorValues> & { imageName?: string };
  helper?: string;
  onSubmit: (values: PostEditorValues) => Promise<void>;
  onDraftSave?: (values: PostEditorValues) => Promise<void>;
};

export function createPostFormData(values: PostEditorValues) {
  const formData = new FormData();
  formData.append("title", values.title.trim());
  formData.append("content", values.content.trim());
  if (values.image) formData.append("images", values.image);
  return formData;
}

export function PostEditorForm({
  title,
  submitText,
  initialValues,
  helper,
  onSubmit,
  onDraftSave,
}: PostEditorFormProps) {
  const [values, setValues] = useState<PostEditorValues>({
    title: initialValues?.title ?? "",
    content: initialValues?.content ?? "",
  });
  const [fileName, setFileName] = useState(initialValues?.imageName ?? "파일을 선택해주세요.");
  const submitAction = useAsyncAction();
  const draftAction = useAsyncAction();
  const latestValuesRef = useRef(values);

  useEffect(() => {
    setValues({
      title: initialValues?.title ?? "",
      content: initialValues?.content ?? "",
    });
    setFileName(initialValues?.imageName ?? "파일을 선택해주세요.");
  }, [initialValues?.content, initialValues?.imageName, initialValues?.title]);

  useEffect(() => {
    latestValuesRef.current = values;
  }, [values]);

  useEffect(() => {
    if (!onDraftSave) return;

    const timerId = window.setInterval(() => {
      const currentValues = latestValuesRef.current;
      if (currentValues.title.trim() || currentValues.content.trim() || currentValues.image) {
        onDraftSave(currentValues).catch(console.error);
      }
    }, 60_000);

    return () => window.clearInterval(timerId);
  }, [onDraftSave]);

  const isValid = Boolean(values.title.trim() && values.content.trim());

  return (
    <section className="editor-panel">
      <div className="editor-heading">
        <h1>{title}</h1>
        <p>궁금한 걸 자유롭게 물어보세요</p>
      </div>

      <form
        className="editor-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!isValid) return;
          submitAction.run(() => onSubmit(values));
        }}
      >
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
              onClick={() => draftAction.run(() => onDraftSave(values))}
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
