import { ROUTES, getQueryParam, navigateTo } from "../router.js";
import { apiClient } from "../api/client.js";
import { createFormData } from "../utils/formData.js";
import { getPostEditData } from "../utils/postEditStorage.js";
import { renderHeader } from "../components/Header.js";

const postId = getQueryParam("id");

renderHeader({
  backId: "post-detail-link",
  backHref: postId ? ROUTES.postDetail(postId) : "./post-detail.html",
  backLabel: "게시글 상세로 이동",
  showProfile: true,
});

const titleInput = document.getElementById("post-title");
const contentInput = document.getElementById("post-content");
const ImageInput = document.getElementById("post-image");

const postHelper = document.getElementById("editor-helper");
const imageHelper = document.getElementById("file-url");

const postDetailLink = document.getElementById("post-detail-link");
const createForm = document.getElementById("edit-form");
const confirmButton = document.getElementById("confirm-button");


if (postId) {
    postDetailLink.href = ROUTES.postDetail(postId);
}

function fillPostForm(post) {
  titleInput.value = post.title ?? "";
  contentInput.value = post.content ?? "";

  imageHelper.textContent = post.image_urls?.length
    ? post.image_urls.map((url) => url.split("/").pop()).join(", ")
    : "파일을 선택해주세요.";

  updateConfirmButtonState();
}

async function loadPostEditData() {
  const savedPost = getPostEditData(postId);

  if (savedPost) {
    fillPostForm(savedPost);
    return;
  }

  const response = await apiClient(`/posts/${postId}`);
  fillPostForm(response.data);
}

loadPostEditData();

//선택한 이미지 url
ImageInput.addEventListener("change", () => {    
    const file = ImageInput.files[0];

    if (!file) {
        imageHelper.textContent = "파일을 선택해주세요.";
        return;
    }

    imageHelper.textContent = file.name;
})

//제목과 내용 모두 작성해야 버튼이 활성화
function updateEditorHelperState() {
    postHelper.hidden = titleInput.value.trim() && contentInput.value.trim();
}

function updateConfirmButtonState() {
    const isValid = titleInput.value.trim() && contentInput.value.trim();

    confirmButton.disabled = !isValid;
    updateEditorHelperState();
}

[titleInput, contentInput].forEach((input) => {
  input.addEventListener("input", updateConfirmButtonState);
});

//요청
createForm.addEventListener("submit", async(event) => {
    event.preventDefault();

    const formData = createFormData({
            title: titleInput.value.trim(),
            content: contentInput.value.trim(),
            images: ImageInput.files[0],
        });

    try{
        await apiClient(`/posts/${postId}`, "PUT", formData);

        navigateTo(ROUTES.postDetail(postId));
    }catch(error){
        console.log(error.data);
        updateConfirmButtonState();
    }
    
})
