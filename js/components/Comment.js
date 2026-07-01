import { BASE_URL } from "../config.js";
import { isOwner } from "../utils/authStorage.js";

export function Comment(comment) {
    const canEdit = isOwner(comment.user_id);
    const profileImage = comment.profile_image
      ? `<img src="${BASE_URL}${comment.profile_image}" class="avatar" alt="${comment.nickname} 프로필 이미지" />`
      : `<span class="avatar">?</span>`;

    return `
        <article class="comment" data-comment-id="${comment.comment_id}">
            <div class="comment__row">
              <div class="author">
                ${profileImage}
                <div class="author__meta">
                  <strong class="author__name">${comment.nickname}</strong>
                  <time class="author__date">${comment.created_at}</time>
                </div>
              </div>
              ${
                canEdit
                  ? `
                    <div class="post-detail__actions">
                      <button class="text-button" type="button" data-action="edit">수정</button>
                      <button class="text-button" type="button" data-action="delete">삭제</button>
                    </div>
                  `
                  : ""
              }
            </div>
            <p class="comment__body">${comment.content}</p>
          </article>
        `;
}
