import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPost, getPostDraft, savePostDraft } from "@/api/posts";
import { Layout } from "@/components/Layout";
import {
  createPostFormData,
  PostEditorForm,
  type PostEditorValues,
} from "@/components/PostEditorForm";
import { RequireAuth } from "@/components/RequireAuth";
import type { ApiError, PostDraft } from "@/types/domain";

type PostEditorInitialValues = Partial<PostEditorValues> & { imageName?: string };

function getDraftInitialValues(draft: PostDraft | null): PostEditorInitialValues {
  if (!draft) return {};

  const pollOptions = draft.poll?.options.map((option) => ({
    optionId: option.option_id,
    content: option.content,
  })) ?? draft.poll_options?.map((content) => ({ content }))
    ?? draft.pollOptions?.map((content) => ({ content }));

  return {
    title: draft.title ?? "",
    content: draft.content ?? "",
    pollOptions,
  };
}

export function PostCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const shouldLoadDraft = (location.state as { loadDraft?: boolean } | null)?.loadDraft === true;
  const [helper, setHelper] = useState("");
  const [draftHelper, setDraftHelper] = useState("");
  const [initialValues, setInitialValues] = useState<PostEditorInitialValues>({});
  const [isDraftLoading, setIsDraftLoading] = useState(shouldLoadDraft);

  useEffect(() => {
    if (!shouldLoadDraft) {
      setInitialValues({});
      setDraftHelper("");
      setIsDraftLoading(false);
      return;
    }

    let isActive = true;
    setIsDraftLoading(true);

    getPostDraft()
      .then((response) => {
        if (isActive) setInitialValues(getDraftInitialValues(response.data));
      })
      .catch((error) => {
        const apiError = error as ApiError;
        if (isActive && apiError.status !== 404) {
          setDraftHelper("임시 글을 불러오지 못했어요. 새 글로 작성할 수 있습니다.");
        }
      })
      .finally(() => {
        if (isActive) setIsDraftLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [shouldLoadDraft]);

  async function handleSubmit(values: PostEditorValues) {
    try {
      await createPost(createPostFormData(values));
      navigate("/posts");
    } catch (error) {
      setHelper(error instanceof Error ? error.message : "게시글 작성에 실패했습니다.");
    }
  }

  async function handleDraftSave(values: PostEditorValues) {
    if (!values.title.trim() && !values.content.trim() && !values.image) return;
    const pollOptions = values.pollOptions
      ?.map((option) => option.content.trim())
      .filter(Boolean);

    await savePostDraft({
      title: values.title.trim(),
      content: values.content.trim(),
      ...(pollOptions?.length ? { poll_options: pollOptions } : {}),
    });
  }

  return (
    <RequireAuth>
      <Layout narrow backTo="/posts">
        <PostEditorForm
          title="새 글 쓰기"
          submitText="게시하기"
          description={isDraftLoading ? "임시 글을 불러오는 중이에요" : "궁금한 걸 투표로 물어보세요"}
          enablePoll
          initialValues={initialValues}
          helper={helper || draftHelper}
          onSubmit={handleSubmit}
          onDraftSave={handleDraftSave}
        />
      </Layout>
    </RequireAuth>
  );
}
