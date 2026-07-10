import { apiClient } from "../api/client.js";
import { PostCard } from "../components/PostCard.js";
import { clearCurrentUser } from "../utils/authStorage.js";
import { createInfiniteScroll } from "../utils/infiniteScroll.js";
import { renderHeader } from "../components/Header.js";

renderHeader({
    showProfile: true,
    showProfileMenu: true,
});

const postList = document.getElementById("post-list");
const logoutLink = document.querySelector('.profile-menu__link[href="../index.html"]');

const POST_PAGE_SIZE = 20;

let nextCursor = null;
let hasNextPost = true;
let isPostLoading = false;
let isPostObserverStarted = false;

function renderPosts(posts, { append = false } = {}) {
    const postMarkup = posts.map((post) => PostCard(post)).join("");

const infiniteScroll = createInfiniteScroll({
    anchor: postList,
    onLoadMore: () => loadPosts({append: true}),
});

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
    infiniteScroll.start();
}

document.addEventListener("DOMContentLoaded", init);


logoutLink?.addEventListener("click", () => {
    clearCurrentUser();
});
