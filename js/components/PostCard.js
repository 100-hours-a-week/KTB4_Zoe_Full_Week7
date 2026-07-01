import { BASE_URL } from "../config.js";
import { countFormat } from "../utils/countFormat.js";

export function PostCard(post) {
    return `
        <a class="post-card" href="./post-detail.html?id=${post.post_id}">
            <h3 class="post-card__title">${post.title}</h3>
            <div class="post-card__meta">
              <div class="post-card__stats">
                <span>좋아요 ${countFormat(post.like_count)}</span>
                <span>댓글 ${countFormat(post.comment_count)}</span>
                <span>조회수 ${countFormat(post.view_count)}</span>
              </div>
              <div>${post.created_at}</div>
            </div>
            <div class="post-card__author">
              <img class="avatar" src=${BASE_URL}${post.writer.profile_image}></img>
              <span>${post.writer.nickname}</span>
            </div>
        </a>
    `
}