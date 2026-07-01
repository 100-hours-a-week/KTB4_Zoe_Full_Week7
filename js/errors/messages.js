export const ERROR_MESSAGES = {
  authentication_required: "로그인이 필요합니다.",
  access_denied: "권한이 없습니다.",
  post_not_found: "게시글을 찾을 수 없습니다.",
  comment_not_found: "댓글을 찾을 수 없습니다.",
  validation_failed: "입력값을 확인해주세요.",
  authentication_failed: "아이디 또는 비밀번호를 확인해주세요.",
  email_already_exists: "중복된 이메일입니다.",
  nickname_already_exists: "중복된 닉네임입니다.",
  post_create_failed: "게시글 작성 중 오류가 발생했습니다.",
  comment_create_failed: "댓글 작성 중 오류가 발생했습니다.",
  parent_comment_mismatch: "같은 게시글의 댓글에만 답글을 작성할 수 있습니다.",
};

export function getErrorMessage(error, fallbackMessage = "요청 처리 중 오류가 발생했습니다.") {
  return ERROR_MESSAGES[error.message] ?? fallbackMessage;
}
