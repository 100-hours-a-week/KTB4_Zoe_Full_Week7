import { apiClient } from "../api/client.js";
import { PostCard } from "../components/PostCard.js";
import { PostListSkeleton, PostCardSkeleton } from "../components/Skeletons.js";
import { createInfiniteScroll } from "../utils/infiniteScroll.js";
import { renderHeader } from "../components/Header.js";
import { getCurrentUserId } from "../utils/authStorage.js";
import { h, render } from "../lib/vdom.js";
import { createDelayedLoading } from "../utils/delayedLoading.js";

document.body.dataset.auth = getCurrentUserId() === null ? "guest" : "user";

renderHeader({
    showProfile: true,
    showProfileMenu: true,
});

const postList = document.querySelector(".post-list");
const sortButtons = document.querySelectorAll("[data-post-sort]");

const POST_PAGE_SIZE = 20;

let nextCursor = null;
let hasNextPost = true;
let isPostLoading = false;
let isPostObserverStarted = false;

let renderedPosts = [];
let currentSort = "latest";

const listSkeleton = createDelayedLoading({
    onShow: () => {
        postList.setAttribute("aria-busy", "true");
        postList.innerHTML = PostListSkeleton();
    },
    onHide: () => {
        postList.removeAttribute("aria-busy");
    },
});

const nextPageSkeleton = createDelayedLoading({
    onShow: () => {
        postList.insertAdjacentHTML(
            "beforeend",
            `<div class="post-list__next-skeleton" role="status" aria-label="게시글을 더 불러오는 중" aria-busy="true">${PostCardSkeleton()}</div>`
        );
    },
    onHide: () => {
        postList.querySelector(".post-list__next-skeleton")?.remove();
    },
});

const infiniteScroll = createInfiniteScroll({
    anchor: postList,
    onLoadMore: () => loadPosts({append: true}),
});

function PostList(posts) {
    return h(
        "div",
        { class: "post-list__items" },
        ...posts.map((post) => PostCard(post))
    );
}

function getVisiblePosts() {
    if (currentSort !== "popular") return renderedPosts;

    return [...renderedPosts].sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0));
}

function renderPosts(posts, { append = false } = {}) {
    renderedPosts = append ? [...renderedPosts, ...posts] : posts;
    render(PostList(getVisiblePosts()), postList);
}

function getPostsPath() {
    const params = new URLSearchParams({ size: String(POST_PAGE_SIZE) });

    if (nextCursor !== null) {
        params.set("cursor", String(nextCursor));
    }

    return `/posts?${params.toString()}`;
}

async function loadPosts({ append = false } = {}) {
    if (isPostLoading || !hasNextPost) return;

    isPostLoading = true;
    const loadingController = append ? nextPageSkeleton : listSkeleton;
    loadingController.start();

    try{
        const response = await apiClient(getPostsPath());
        const data = response.data;
        const posts = data.posts ?? data;

        loadingController.stop();
        renderPosts(posts, { append });

        nextCursor = data.next_cursor ?? null;
        hasNextPost = Boolean(data.has_next);
    }catch(error){
        loadingController.stop();
        console.error(error);
    }finally{
        isPostLoading = false;
    }
}

async function init() {
    await loadPosts();
    infiniteScroll.start();
}

document.addEventListener("DOMContentLoaded", init);

sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentSort = button.dataset.postSort;
        sortButtons.forEach((item) => {
            item.classList.toggle("pill-tab--active", item === button);
            item.setAttribute("aria-pressed", String(item === button));
        });
        render(PostList(getVisiblePosts()), postList);
    });
});
