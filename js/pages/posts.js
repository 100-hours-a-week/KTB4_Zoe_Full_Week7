import { apiClient } from "../api/client.js";
import { PostCard } from "../components/PostCard.js";
import { createInfiniteScroll } from "../utils/infiniteScroll.js";
import { renderHeader } from "../components/Header.js";
import { getCurrentUserId } from "../utils/authStorage.js";
import { h, render } from "../lib/vdom.js";

document.body.dataset.auth = getCurrentUserId() === null ? "guest" : "user";

renderHeader({
    showProfile: true,
    showProfileMenu: true,
});

const sortButtons = document.querySelectorAll("[data-post-sort]");

const postList = document.querySelector(".post-list");
const postSearch = document.querySelector("#post-search");
const postSearchClear = document.querySelector("#post-search-clear");
let currentPostList;
const POST_PAGE_SIZE = 20;

let nextCursor = null;
let hasNextPost = true;
let isPostLoading = false;
let isPostObserverStarted = false;

let renderedPosts = [];
let currentSort = "latest";
let currentQuery = "";

const infiniteScroll = createInfiniteScroll({
    anchor: postList,
    onLoadMore: () => loadPosts({append: true}),
});

function clearSearch() {
    postSearch.value = "";
    currentQuery = "";
    postSearchClear.hidden = true;
    renderPosts(renderedPosts);
    postSearch.focus();
}

function PostList(posts, query, onClearSearch) {
    if (posts.length === 0) {
        return h(
            "div",
            { class: "post-list__empty" },
            h(
                "p",
                { role: "status" },
                query
                    ? `"${query}"에 해당하는 게시글이 없습니다.`
                    : "아직 등록된 게시글이 없습니다."
            ),
            query
                ? h(
                    "button",
                    {
                        type: "button",
                        class: "post-list__clear",
                        onClick: onClearSearch,
                    },
                    "검색 초기화"
                )
                : null
        );
    }

    return h(
        "div",
        query
            ? { class: "post-list__items", "data-query": query }
            : { class: "post-list__items" },
        h(
            "p",
            { class: "post-list__summary", "aria-live": "polite" },
            query
                ? `${posts.length}개의 검색 결과`
                : `게시글 ${posts.length}개`
        ),
        ...posts.map((post) => PostCard(post))
    );
}

function getVisiblePosts() {
    const query = currentQuery.trim().toLocaleLowerCase("ko-KR");
    const filteredPosts = query
        ? renderedPosts.filter((post) => {
            const writer = post.writer ?? {};
            return [post.title, post.content, writer.nickname]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLocaleLowerCase("ko-KR").includes(query)
                );
        })
        : [...renderedPosts];

    if (currentSort === "latest") {
        return filteredPosts.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    }

    return filteredPosts.sort(
        (a, b) => (b.like_count ?? 0) - (a.like_count ?? 0)
    );
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

sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentSort = button.dataset.postSort;
        sortButtons.forEach((item) => {
            item.classList.toggle("pill-tab--active", item === button);
            item.setAttribute("aria-pressed", String(item === button));
        });
        renderPosts(renderedPosts);
    });
});

postSearch.addEventListener("input", () => {
    currentQuery = postSearch.value;
    postSearchClear.hidden = currentQuery.length === 0;
    renderPosts(renderedPosts);
});

postSearchClear.addEventListener("click", clearSearch);
