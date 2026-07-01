import { apiClient } from "../api/client.js";
import { getQueryParam, ROUTES, navigateTo } from "../router.js";
import { BASE_URL } from "../config.js";
import { handlePostDetailError, handleCommentError } from "../errors/postDetailErrors.js";
import { countFormat } from "../utils/countFormat.js";
import { getComments, createComment, updateComment, deleteComment } from "../api/comments.js";
import { Comment } from "../components/Comment.js";
import { createConfirmModal } from "../components/ConfirmModal.js";
import { bindInputsToButton } from "../utils/bindInputsToButton.js";
import { isOwner } from "../utils/authStorage.js";
import { savePostEditData } from "../utils/postEditStorage.js";
import { renderHeader } from "../components/Header.js";

const postId = getQueryParam("id");

renderHeader({
    backHref: "./posts.html",
    backLabel: "게시글 목록으로 이동",
    showProfile: true,
    showProfileMenu: true,
});

//게시글 상세 영역
const title = document.getElementById("title");

const authorName = document.getElementById("author-name");
const authorProfile = document.getElementById("author-profile");
const created = document.getElementById("created-at");

const image = document.getElementById("image");
const content = document.getElementById("content");
const postActions = document.getElementById("post-actions");
const postEditLink = document.getElementById("post-edit-link");
const postDeleteButton = document.getElementById("post-delete-button");

const likeCount = document.getElementById("like-count");
const likeButton = document.getElementById("like-button");
const viewCount = document.getElementById("view-count");
const commentCount = document.getElementById("comment-count");

//댓글 입력 영역
const commentInput = document.getElementById("comment-content");
const commentButton = document.getElementById("comment-button");

//댓글 리스트
const commentList = document.getElementById("comment-list");
const confirmModal = createConfirmModal();
const commentSentinel = document.createElement("div");
commentSentinel.className = "infinite-scroll-sentinel";
commentList.after(commentSentinel);

//좋아요 여부
let isLiked = false;
let currentLikeCount = 0;
let editingCommentId = null;
const COMMENT_PAGE_SIZE = 20;
let currentCommentPage = 0;
let hasNextComment = true;
let isCommentLoading = false;
let isCommentObserverStarted = false;

function updateLikeButtonState() {
    likeButton.dataset.liked = String(isLiked);
    likeButton.style.backgroundColor = isLiked ? "#aca0eb" : "#d9d9d9";
    likeCount.textContent = countFormat(currentLikeCount);
}

function renderPostImage(imageUrls = []) {
    const firstImageUrl = imageUrls[0];

    if (!firstImageUrl) {
        image.removeAttribute("src");
        image.hidden = true;
        return;
    }

    image.src = BASE_URL + firstImageUrl;
    image.hidden = false;
}

function getPostWriterId(post) {
    return post.writer?.user_id ?? post.writer?.id ?? post.user_id ?? post.userId ?? post.author_id ?? post.authorId;
}

function updatePostActionsVisibility(post) {
    postActions.hidden = !isOwner(getPostWriterId(post));
}

//게시글 fetch
function fetchPost(post) {
    title.textContent = post.title;
    authorName.textContent = post.writer.nickname;
    authorProfile.src = BASE_URL + post.writer.profile_image;
    created.textContent = post.created_at;

    renderPostImage(post.image_urls);
    content.textContent = post.content;
    updatePostActionsVisibility(post);
    postEditLink.href = `./post-edit.html?id=${postId}`;
    savePostEditData({
        post_id: post.post_id ?? post.id ?? postId,
        title: post.title,
        content: post.content,
        image_urls: post.image_urls ?? [],
    });

    currentLikeCount = post.like_count;
    isLiked = Boolean(post.is_liked ?? post.liked ?? false);
    updateLikeButtonState();
    viewCount.textContent = countFormat(post.view_count);
    commentCount.textContent = countFormat(post.comment_count);
}

//댓글 렌더링
function fetchComments(comments, { append = false } = {}) {
    const commentMarkup = comments.map((comment) => Comment(comment)).join("");

    if (append) {
        commentList.insertAdjacentHTML("beforeend", commentMarkup);
        return;
    }

    commentList.innerHTML = commentMarkup;
}

function updateCommentPagination(pagination, requestedPage) {
    currentCommentPage = pagination?.page ?? requestedPage;
    hasNextComment = Boolean(pagination?.has_next);
}

function resetCommentEditor() {
    editingCommentId = null;
    commentInput.value = "";
    commentButton.textContent = "댓글 등록";
    updateCommentButtonState();
}

function startCommentEdit(comment) {
    const commentId = comment?.dataset.commentId;
    const commentContent = comment?.querySelector(".comment__body")?.textContent ?? "";

    if (!commentId) return;

    editingCommentId = commentId;
    commentInput.value = commentContent;
    commentButton.textContent = "댓글 수정";
    updateCommentButtonState();
    commentInput.focus();
}

async function reloadComments() {
    currentCommentPage = 0;
    hasNextComment = true;
    commentList.innerHTML = "";
    await loadComments({ page: 1 });
}

async function loadComments({ page = currentCommentPage + 1, append = false } = {}) {
    if (isCommentLoading || !hasNextComment) return;

    isCommentLoading = true;

    try {
        const commentResponse = await getComments(postId, page, COMMENT_PAGE_SIZE);
        fetchComments(commentResponse.data.comments, { append });
        updateCommentPagination(commentResponse.data.pagination, page);
    } finally {
        isCommentLoading = false;
    }
}

// Promise.allSettled로 api waterfall 방지
// 게시글 로딩 실패시에는 게시글 목록으로 이동
// 댓글 로딩 실패시에는 게시글만 렌더링, 댓글 영역은 에러처리
async function init() {

  if (!postId) {
    handlePostDetailError(new Error("post_not_found"));
    return;
  }

  const [postResult, commentsResult] = await Promise.allSettled([
    apiClient(`/posts/${postId}`),
    getComments(postId, 1, COMMENT_PAGE_SIZE),
  ]);

  if (postResult.status === "rejected") {
    handlePostDetailError(postResult.reason);
    return;
  }

  fetchPost(postResult.value.data);

  if (commentsResult.status === "fulfilled") {
    fetchComments(commentsResult.value.data.comments);
    updateCommentPagination(commentsResult.value.data.pagination, 1);
    startCommentObserver();
    return;
  }

  handleCommentError(commentsResult.reason, commentList);
}
document.addEventListener('DOMContentLoaded', init);

const updateCommentButtonState = bindInputsToButton([commentInput], commentButton);

//댓글 등록 이벤트
commentButton.addEventListener("click", async(e)=>{
    e.preventDefault();

    const content = commentInput.value.trim();

    try{
        if (editingCommentId) {
            await updateComment(editingCommentId, content);
            await reloadComments();
            resetCommentEditor();
            return;
        }

        await createComment(postId, content);
        commentInput.value = "";
        await reloadComments();
        updateCommentButtonState();
    }catch(e){
        console.error(e);
    }
})

//게시글 삭제 이벤트
postDeleteButton.addEventListener("click", () => {
    confirmModal.open({
        title: "게시글을 삭제하시겠습니까?",
        description: "삭제한 내용은 복구 할 수 없습니다.",
        onConfirm: async () => {
            await apiClient(`/posts/${postId}`, "DELETE");
            navigateTo(ROUTES.posts);
        },
    });
});

//댓글 수정/삭제 이벤트
commentList.addEventListener("click", (event) => {
    const editButton = event.target.closest('[data-action="edit"]');

    if (editButton) {
        startCommentEdit(editButton.closest("[data-comment-id]"));
        return;
    }

    const deleteButton = event.target.closest('[data-action="delete"]');
    if (!deleteButton) return;

    const comment = deleteButton.closest("[data-comment-id]");
    const commentId = comment?.dataset.commentId;
    if (!commentId) return;

    confirmModal.open({
        title: "댓글을 삭제하시겠습니까?",
        description: "삭제한 내용은 복구 할 수 없습니다.",
        onConfirm: async () => {
            await deleteComment(commentId);
            await reloadComments();
            if (editingCommentId === commentId) resetCommentEditor();
        },
    });
});

//좋아요 버튼 이벤트
likeButton.addEventListener("click", async(e) => {
    e.preventDefault();

    const nextLiked = !isLiked;
    const method = nextLiked ? "POST" : "DELETE";

    try{
        await apiClient(`/likes/posts/${postId}`, method);

        isLiked = nextLiked;
        currentLikeCount += nextLiked ? 1 : -1;
        updateLikeButtonState();
    }catch(e){
        console.error(e);
    }
})

const commentObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;

    loadComments({ append: true });
}, {
    rootMargin: "240px",
});

function startCommentObserver() {
    if (isCommentObserverStarted) return;

    isCommentObserverStarted = true;
    commentObserver.observe(commentSentinel);
}
