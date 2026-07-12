import { h } from "../lib/vdom.js";
import { BASE_URL } from "../config.js";
import { countFormat } from "../utils/countFormat.js";

export function PostCard(post) {
    const writer = post.writer ?? {};
    const profileImage = writer.profile_image ?? writer.profileImage;
    const avatar = profileImage
      ? h("img", {class: "avatar", src: profileImage.startsWith("http") ? profileImage : `${BASE_URL}${profileImage}`, alt: `${writer.nickname ?? "사용자"} 프로필 이미지`})
      : h("span", {class: "avatar", "aria-hidden": "true"}, (writer.nickname ?? "사").slice(0, 1));
    const postId = post.post_id ?? post.id;
    const createdAt = post.created_at ?? post.createdAt ?? "";

    return h(
      "a",
      {
        class: "post-card",
        href: `./post-detail.html?id=${postId}`,
      },
      h(
        "div",
        {class: "post-card__author"},
        avatar,
        h(
          "div",
          {class: "post-card__author-info"},
          h("span", {class: "post-card__author-name"}, writer.nickname ?? "사용자"),
          h("time", {class: "post-card__time"}, createdAt)
        )
      ),
      h("h3", {class: "post-card__title"}, post.title),
      h("p", {class: "post-card__body"}, post.content ?? ""),
      h(
        "div",
        {class: "post-card__meta"},
        h(
          "div",
          {class: "post-card__stats"},
          h("span", null, `좋아요 ${countFormat(post.like_count)}` ),
          h("span", null, `댓글 ${countFormat(post.comment_count)}`),
          h("span", null, `조회수 ${countFormat(post.view_count)}`)
        )
      )
    )
}
