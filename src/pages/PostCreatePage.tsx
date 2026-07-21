import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost, savePostDraft } from "@/api/posts";
import { Layout } from "@/components/Layout";
import { createPostFormData, PostEditorForm, type PostEditorValues } from "@/components/PostEditorForm";
import { RequireAuth } from "@/components/RequireAuth";

export function PostCreatePage() {
  const navigate = useNavigate();
  const [helper, setHelper] = useState("");

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
    await savePostDraft(createPostFormData(values));
  }

  return (
    <RequireAuth>
      <Layout narrow backTo="/posts">
        <PostEditorForm
          title="새 글 쓰기"
          submitText="게시하기"
          helper={helper}
          onSubmit={handleSubmit}
          onDraftSave={handleDraftSave}
        />
      </Layout>
    </RequireAuth>
  );
}
