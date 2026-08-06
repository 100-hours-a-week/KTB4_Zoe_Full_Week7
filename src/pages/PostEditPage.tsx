import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getPost, savePostDraft, updatePost } from "@/api/posts";
import { Layout } from "@/components/Layout";
import {
  createPostUpdateFormData,
  PostEditorForm,
  type PostEditorValues,
} from "@/components/PostEditorForm";
import { RequireAuth } from "@/components/RequireAuth";
import type { ApiError, Post } from "@/types/domain";
import { countFormat } from "@/utils/format";

export function PostEditPage() {
  const { postId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState<Post | null>(
    (location.state as { post?: Post } | null)?.post ?? null,
  );
  const [helper, setHelper] = useState("");
  const [pollLocked, setPollLocked] = useState(false);

  useEffect(() => {
    if (post) return;
    getPost(postId)
      .then((response) => setPost(response.data))
      .catch((error) => setHelper(error instanceof Error ? error.message : "게시글을 불러오지 못했습니다."));
  }, [post, postId]);

  async function handleSubmit(values: PostEditorValues) {
    setHelper("");
    setPollLocked(false);
    try {
      const originalPollOptions = post?.poll?.options ?? [];
      const pollChanged = values.pollOptions?.length !== originalPollOptions.length || values.pollOptions?.some(
        (option, index) => {
          const originalOption = originalPollOptions[index];
          return (
            !originalOption ||
            option.optionId !== originalOption.option_id ||
            option.content.trim() !== originalOption.content.trim()
          );
        },
      );
      await updatePost(postId, createPostUpdateFormData(values, Boolean(pollChanged)));
      navigate(`/posts/${postId}`);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.code === "poll_options_locked" || apiError.status === 409) {
        setPollLocked(true);
        return;
      }
      setHelper(error instanceof Error ? error.message : "게시글 수정에 실패했습니다.");
    }
  }

  async function handleDraftSave(values: PostEditorValues) {
    if (!values.title.trim() && !values.content.trim() && !values.image) return;

    const draftPostId = post?.post_id ?? post?.id ?? Number(postId);
    if (!Number.isFinite(draftPostId)) return;

    const pollOptions = values.pollOptions
      ?.map((option) => option.content.trim())
      .filter(Boolean);

    await savePostDraft({
      post_id: draftPostId,
      title: values.title.trim(),
      content: values.content.trim(),
      ...(pollOptions?.length ? { poll_options: pollOptions } : {}),
    });
  }

  return (
    <RequireAuth>
      <Layout narrow backTo={`/posts/${postId}`}>
        <PostEditorForm
          title="글 수정"
          submitText="수정 완료"
          enablePoll={Boolean(post?.poll)}
          initialValues={{
            title: post?.title ?? "",
            content: post?.content ?? "",
            imageName:
              (post?.image_urls ?? post?.imageUrls)?.map((url) => url.split("/").pop()).join(", ") ||
              "파일을 선택해주세요.",
            pollOptions: post?.poll?.options.map((option) => ({
              optionId: option.option_id,
              content: option.content,
            })),
          }}
          helper={helper}
          toastMessage={pollLocked
            ? `이미 ${countFormat(post?.poll?.total_vote_count ?? 0)}명이 투표에 참여했어요. 투표 항목 수정은 제한됩니다.`
            : null}
          onSubmit={handleSubmit}
          onDraftSave={handleDraftSave}
        />
      </Layout>
    </RequireAuth>
  );
}
