import { apiClient } from "../api/client.js";
import { PostCard } from "../components/PostCard.js";
import { clearCurrentUser } from "../utils/authStorage.js";
import { renderHeader } from "../components/Header.js";

renderHeader({
    showProfile: true,
    showProfileMenu: true,
});

const postList = document.getElementById("post-list");
const logoutLink = document.querySelector('.profile-menu__link[href="../index.html"]');
const postSentinel = document.createElement("div");
postSentinel.className = "infinite-scroll-sentinel";
postList.after(postSentinel);

const POST_PAGE_SIZE = 20;

let nextCursor = null;
let hasNextPost = true;
let isPostLoading = false;
let isPostObserverStarted = false;

function renderPosts(posts, { append = false } = {}) {
    const postMarkup = posts.map((post) => PostCard(post)).join("");

    if (append) {
        postList.insertAdjacentHTML("beforeend", postMarkup);
        return;
    }

    postList.innerHTML = postMarkup;
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

    try{
        const response = await apiClient(getPostsPath());
        const data = response.data;
        const posts = data.posts ?? data;

        renderPosts(posts, { append });

        nextCursor = data.next_cursor ?? null;
        hasNextPost = Boolean(data.has_next);
    }catch(error){
        console.error(error);
    }finally{
        isPostLoading = false;
    }
}

async function init() {
    await loadPosts();
    startPostObserver();
}

document.addEventListener("DOMContentLoaded", init);

const postObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;

    loadPosts({ append: true });
}, {
    rootMargin: "240px",
});

function startPostObserver() {
    if (isPostObserverStarted) return;

    isPostObserverStarted = true;
    postObserver.observe(postSentinel);
}

logoutLink?.addEventListener("click", () => {
    clearCurrentUser();
});
