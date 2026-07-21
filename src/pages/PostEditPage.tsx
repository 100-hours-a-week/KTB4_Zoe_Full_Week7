import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getPost, updatePost } from "@/api/posts";
import { Layout } from "@/components/Layout";
import { createPostFormData, PostEditorForm, type PostEditorValues } from "@/components/PostEditorForm";
import { RequireAuth } from "@/components/RequireAuth";
import type { Post } from "@/types/domain";
import { clearSavedPostForEdit, getSavedPostForEdit } from "@/utils/postEditStorage";

export function PostEditPage() {
  const { postId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState<Post | null>(
    (location.state as { post?: Post } | null)?.post ?? getSavedPostForEdit(postId),
  );
  const [helper, setHelper] = useState("");

  useEffect(() => {
    if (post) return;
    getPost(postId)
      .then((response) => setPost(response.data))
      .catch((error) => setHelper(error instanceof Error ? error.message : "게시글을 불러오지 못했습니다."));
  }, [post, postId]);

  async function handleSubmit(values: PostEditorValues) {
    try {
      await updatePost(postId, createPostFormData(values));
      clearSavedPostForEdit(postId);
      navigate(`/posts/${postId}`);
    } catch (error) {
      setHelper(error instanceof Error ? error.message : "게시글 수정에 실패했습니다.");
    }
  }

  return (
    <RequireAuth>
      <Layout narrow backTo={`/posts/${postId}`}>
        <PostEditorForm
          title="글 수정"
          submitText="수정 완료"
          initialValues={{
            title: post?.title ?? "",
            content: post?.content ?? "",
            imageName:
              (post?.image_urls ?? post?.imageUrls)?.map((url) => url.split("/").pop()).join(", ") ||
              "파일을 선택해주세요.",
          }}
          helper={helper}
          onSubmit={handleSubmit}
        />
      </Layout>
    </RequireAuth>
  );
}
