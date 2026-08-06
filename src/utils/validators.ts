export function validateEmail(email: string) {
  if (!email.trim()) return "이메일을 입력해주세요.";

  const emailRegex = /^[A-Za-z0-9@.]+$/;
  const emailFormatRegex = /^[A-Za-z0-9]+@[A-Za-z0-9]+\.[A-Za-z.]+$/;

  if (!emailRegex.test(email) || !emailFormatRegex.test(email)) {
    return "올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
  }

  return "";
}

export function validatePassword(password: string) {
  if (!password.trim()) return "비밀번호를 입력해주세요";

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;

  if (!passwordRegex.test(password)) {
    return "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
  }

  return "";
}

export function validatePasswordConfirm(password: string, passwordConfirm: string) {
  if (!passwordConfirm.trim()) return "비밀번호를 한번더 입력해주세요";
  if (password !== passwordConfirm) return "비밀번호가 다릅니다.";
  return "";
}

export function validateNickname(nickname: string) {
  if (!nickname.trim()) return "닉네임을 입력해주세요.";
  if (/\s/.test(nickname)) return "띄어쓰기를 없애주세요";
  if (nickname.length > 10) return "닉네임은 최대 10자 까지 작성 가능합니다.";
  return "";
}

export function validateProfileImage(profileImage: File | null) {
  if (!profileImage) return null;
  if (!profileImage.type.startsWith("image/")) return "이미지 파일만 등록할 수 있습니다.";
  return "";
}
