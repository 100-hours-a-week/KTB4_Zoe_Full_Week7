import { h } from "../lib/vdom.js";

export function LikeButton(isLiked, likeCount, onClick) {
    return h(
        "button",
        {
            id: "like-button",
            class: "counter like-button",
            type: "button",
            "data-liked": isLiked,
            onClick
        },
        h("span",{class: "counter__label"},"좋아요"),
        h("span",{id: "like-count"},likeCount),
    );
}
