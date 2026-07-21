import { apiClient } from "../api/client.js";
import { getQueryParam, ROUTES, navigateTo } from "../router.js";
import { BASE_URL } from "../config.js";
import { getErrorMessage } from "../errors/messages.js";
import { countFormat } from "../utils/countFormat.js";
import { getComments, createComment, updateComment, deleteComment } from "../api/comments.js";
import { Comment } from "../components/Comment.js";
import { createConfirmModal } from "../components/ConfirmModal.js";
import { bindInputsToButton } from "../utils/bindInputsToButton.js";
import { getCurrentUserId, isOwner } from "../utils/authStorage.js";
import { savePostEditData } from "../utils/postEditStorage.js";
import { renderHeader } from "../components/Header.js";
import { CommentListSkeleton, PostDetailSkeleton } from "../components/Skeletons.js";
import { createButtonLoading, createDelayedLoading } from "../utils/delayedLoading.js";

const postId = getQueryParam("id");
const currentUserId = getCurrentUserId();

document.body.dataset.auth = currentUserId === null ? "guest" : "user";

renderHeader({
    backHref: "./posts.html",
    backLabel: "게시글 목록으로 이동",
    showProfile: true,
    showProfileMenu: true,
});

const postDetailWrapper = document.querySelector(".post-detail-wrapper");
const postDetail = document.querySelector(".post-detail");

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
postDetail.hidden = true;

//좋아요 여부
let isLiked = false;
let currentLikeCount = 0;
let editingCommentId = null;
const COMMENT_PAGE_SIZE = 20;
let currentCommentPage = 0;
let hasNextComment = true;
let isCommentLoading = false;
let isCommentObserverStarted = false;
let commentLoadingMode = "initial";
let isCommentSubmitting = false;
let isLikeSubmitting = false;

const postSkeleton = createDelayedLoading({
    onShow: () => {
        postDetailWrapper.querySelector(".post-detail--skeleton")?.remove();
        postDetail.insertAdjacentHTML("beforebegin", PostDetailSkeleton());
    },
    onHide: () => {
        postDetailWrapper.querySelector(".post-detail--skeleton")?.remove();
    },
});

const commentSkeleton = createDelayedLoading({
    onShow: () => {
        commentList.setAttribute("aria-busy", "true");

        if (commentLoadingMode === "next") {
            commentList.insertAdjacentHTML("beforeend", CommentListSkeleton(1));
            return;
        }

        commentList.innerHTML = CommentListSkeleton();
    },
    onHide: () => {
        commentList.removeAttribute("aria-busy");
        commentList.querySelectorAll(".comment-list__skeleton").forEach((element) => element.remove());
    },
});

const commentButtonLoading = createButtonLoading(commentButton, {
    label: "댓글 처리 중",
});

const likeButtonLoading = createButtonLoading(likeButton, {
    label: "좋아요 처리 중",
});

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function updateLikeButtonState() {
    likeButton.dataset.liked = String(isLiked);
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
    const ownsPost = isOwner(getPostWriterId(post));

    postActions.hidden = !ownsPost;
    document.body.dataset.owner = ownsPost ? "mine" : "other";
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

function renderPostError(error) {
    const message = getErrorMessage(error, "게시글을 불러오지 못했습니다.");

    postDetail.hidden = true;
    postDetailWrapper.querySelector(".post-detail-error")?.remove();
    postDetail.insertAdjacentHTML("beforebegin", `
        <section class="post-detail-error" role="alert">
            <p class="post-detail-error__message">${escapeHtml(message)}</p>
            <button class="button button--pill" type="button" data-post-retry>다시 시도</button>
        </section>
    `);
}

function renderCommentError(error) {
    const message = getErrorMessage(error, "댓글을 불러오지 못했습니다.");

    commentList.innerHTML = `
        <section class="comment-list__error" role="alert">
            <p class="form__helper">${escapeHtml(message)}</p>
            <button class="button button--pill-sm button--ghost" type="button" data-comment-retry>다시 시도</button>
        </section>
    `;
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
    try {
        const commentResponse = await getComments(postId, 1, COMMENT_PAGE_SIZE);
        fetchComments(commentResponse.data.comments);
        updateCommentPagination(commentResponse.data.pagination, 1);
    } catch (error) {
        console.error(error);
    }
}

async function loadComments({ page = currentCommentPage + 1, append = false } = {}) {
    if (isCommentLoading || !hasNextComment) return;

    isCommentLoading = true;
    commentLoadingMode = append ? "next" : "initial";
    commentSkeleton.start();

    try {
        const commentResponse = await getComments(postId, page, COMMENT_PAGE_SIZE);
        commentSkeleton.stop();
        fetchComments(commentResponse.data.comments, { append });
        updateCommentPagination(commentResponse.data.pagination, page);
    } catch (error) {
        commentSkeleton.stop();
        if (!append) renderCommentError(error);
    } finally {
        isCommentLoading = false;
    }
}

// Promise.allSettled로 api waterfall 방지
// 게시글 로딩 실패시에는 게시글 목록으로 이동
// 댓글 로딩 실패시에는 게시글만 렌더링, 댓글 영역은 에러처리
async function init() {

  if (!postId) {
    renderPostError(new Error("post_not_found"));
    return;
  }

  postSkeleton.start();
  const postRequest = apiClient(`/posts/${postId}`);
  const commentsRequest = loadComments({ page: 1 });

  postRequest
    .then((postResponse) => {
        postSkeleton.stop();
        fetchPost(postResponse.data);
        postDetail.hidden = false;
    })
    .catch((error) => {
        postSkeleton.stop();
        renderPostError(error);
    });

  commentsRequest.then(() => {
    if (!isCommentObserverStarted && hasNextComment) startCommentObserver();
  });

  await Promise.allSettled([postRequest, commentsRequest]);
}
document.addEventListener('DOMContentLoaded', init);

const updateCommentButtonState = bindInputsToButton([commentInput], commentButton);

//댓글 등록 이벤트
commentButton.addEventListener("click", async(e)=>{
    e.preventDefault();
    if (isCommentSubmitting) return;

    const content = commentInput.value.trim();
    if (!content) return;

    isCommentSubmitting = true;
    commentButtonLoading.start();

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
    } finally {
        isCommentSubmitting = false;
        commentButtonLoading.stop();
        updateCommentButtonState();
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
    if (isLikeSubmitting) return;

    const nextLiked = !isLiked;
    const method = nextLiked ? "POST" : "DELETE";
    isLikeSubmitting = true;
    likeButtonLoading.start();

    try{
        const response = await apiClient(`/likes/posts/${postId}`, method);

        isLiked = response.data.is_liked;
        currentLikeCount = response.data.like_count;
        updateLikeButtonState();
    }catch(e){
        console.error(e);
    } finally {
        isLikeSubmitting = false;
        likeButtonLoading.stop();
    }
})

postDetailWrapper.addEventListener("click", (event) => {
    if (!event.target.closest("[data-post-retry]")) return;

    postDetailWrapper.querySelector(".post-detail-error")?.remove();
    init();
});

commentList.addEventListener("click", (event) => {
    if (!event.target.closest("[data-comment-retry]")) return;

    reloadComments();
});

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
