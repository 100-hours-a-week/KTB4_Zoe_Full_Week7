import { h } from "../lib/vdom.js";
import { BASE_URL } from "../config.js";
import { countFormat } from "../utils/countFormat.js";

export function PostCard(post) {
    return h(
      "a",
      {
        class: "post-card",
        href: `./post-detail.html?id=${post.post_id}`,
      },
      h("h3", {class: "post-card__title"}, post.title),
      h(
        "div",
        {class: "post-card__meta"},
        h(
          "div",
          {class: "post-card__stats"},
          h("span", null, `좋아요 ${countFormat(post.like_count)}` ),
          h("span", null, `댓글 ${countFormat(post.comment_count)}`),
          h("span", null, `조회수 ${countFormat(post.view_count)}`)
        ),
        h("div", null, post.created_at),
      ),
      h(
        "div",
        {class: "post-card__author"},
        h("img", {class:"avatar", src: `${BASE_URL}${post.writer.profile_image}`}),
        h("span", null, post.writer.nickname)
      )
    )
}