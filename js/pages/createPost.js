import { ROUTES, navigateTo } from "../router.js";
import { apiClient } from "../api/client.js";
import { createFormData } from "../utils/formData.js";
import { bindInputsToButton } from "../utils/bindInputsToButton.js";
import { handleCreatePostError } from "../errors/postErrors.js";
import { renderHeader } from "../components/Header.js";
import { createButtonLoading } from "../utils/delayedLoading.js";

renderHeader({
    backHref: "./posts.html",
    backLabel: "게시글 목록으로 이동",
    showProfile: true,
});

const titleInput = document.getElementById("post-title");
const contentInput = document.getElementById("post-content");
const ImageInput = document.getElementById("post-image");

const postHelper = document.getElementById("editor-helper");
const imageHelper = document.getElementById("file-url");

const createForm = document.getElementById("create-form");
const confirmButton = document.getElementById("confirm-button");
const draftButton = document.getElementById("draft-button");
const submitButtonLoading = createButtonLoading(confirmButton, {
    label: "게시글 등록 중",
});
const draftButtonLoading = createButtonLoading(draftButton, {
    label: "임시저장 중",
});
let isSubmitting = false;
let isSavingDraft = false;

function updateEditorHelperState() {
    postHelper.hidden = titleInput.value.trim() && contentInput.value.trim();
}

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
const updateConfirmButtonState = bindInputsToButton(
  [titleInput, contentInput],
  confirmButton,
  () => {
    updateEditorHelperState();
    return titleInput.value.trim() && contentInput.value.trim();
  }
);

function createPostFormData() {
    return createFormData({
        title: titleInput.value.trim(),
        content: contentInput.value.trim(),
        images: ImageInput.files[0],
    });
}

function hasDraftContent() {
    return Boolean(titleInput.value.trim() || contentInput.value.trim() || ImageInput.files[0]);
}

async function saveDraft({ silent = false } = {}) {
    if (isSavingDraft || !hasDraftContent()) return;

    isSavingDraft = true;
    if (!silent) draftButtonLoading.start();

    try {
        await apiClient("/posts/drafts", "PUT", createPostFormData());
    } catch (error) {
        if (!silent) {
            postHelper.hidden = false;
            postHelper.textContent = error.message ?? "임시저장에 실패했습니다.";
        }
    } finally {
        isSavingDraft = false;
        if (!silent) draftButtonLoading.stop();
    }
}

//요청
createForm.addEventListener("submit", async(event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = createPostFormData();

    try{
        isSubmitting = true;
        submitButtonLoading.start();
        await apiClient("/posts", "POST", formData);

        navigateTo(ROUTES.posts);
    }catch(error){
        handleCreatePostError(error, {
            postHelper,
            updateButtonState: updateConfirmButtonState,
        });
    } finally {
        isSubmitting = false;
        submitButtonLoading.stop();
        updateConfirmButtonState();
    }
    
})

draftButton.addEventListener("click", () => {
    saveDraft();
});

window.setInterval(() => {
    saveDraft({ silent: true });
}, 60_000);
