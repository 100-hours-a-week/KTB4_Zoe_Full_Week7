import type React from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "@/api/auth";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { InputField } from "@/components/InputField";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useDebouncedValidation } from "@/hooks/useDebouncedValidation";
import { Toast } from "@/components/Toast";
import type { ApiError } from "@/types/domain";
import {
  validateEmail,
  validateNickname,
  validatePassword,
  validatePasswordConfirm,
  validateProfileImage,
} from "@/utils/validators";

type SignupHelpers = {
  profileImage: string | null;
};

const INITIAL_HELPERS: SignupHelpers = {
  profileImage: null,
};

export function SignupPage() {
  const navigate = useNavigate();
  const signupAction = useAsyncAction();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [helpers, setHelpers] = useState<SignupHelpers>(INITIAL_HELPERS);
  const [toast, setToast] = useState<string | null>(null);
  const nicknameValidation = useDebouncedValidation(() => validateNickname(nickname), [nickname]);
  const emailValidation = useDebouncedValidation(() => validateEmail(email), [email]);
  const passwordValidation = useDebouncedValidation(() => validatePassword(password), [password]);
  const passwordConfirmValidation = useDebouncedValidation(
    () => validatePasswordConfirm(password, passwordConfirm),
    [password, passwordConfirm],
  );

  const isValid = useMemo(
    () => {
      const hasRequiredInput =
        Boolean(nickname.trim()) &&
        Boolean(email.trim()) &&
        Boolean(password.trim()) &&
        Boolean(passwordConfirm.trim());

      return (
        hasRequiredInput &&
        nicknameValidation.isValid &&
        emailValidation.isValid &&
        passwordValidation.isValid &&
        passwordConfirmValidation.isValid
      );
    },
    [
      email,
      emailValidation.isValid,
      helpers.profileImage,
      nickname,
      nicknameValidation.isValid,
      password,
      passwordConfirm,
      passwordConfirmValidation.isValid,
      passwordValidation.isValid,
      profileImage,
    ],
  );

  function validateForm() {
    const nicknameError = nicknameValidation.validateNow();
    const emailError = emailValidation.validateNow();
    const passwordError = passwordValidation.validateNow();
    const passwordConfirmError = passwordConfirmValidation.validateNow();
    const nextHelpers = {
      profileImage: validateProfileImage(profileImage),
    };
    setHelpers(nextHelpers);
    return !nextHelpers.profileImage && !nicknameError && !emailError && !passwordError && !passwordConfirmError;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("email", email.trim());
    formData.append("password", password.trim());
    formData.append("nickname", nickname.trim());
    if (profileImage) formData.append("profileImage", profileImage);

    await signupAction.run(async () => {
      try {
        await signup(formData);
        navigate("/login");
      } catch (error) {
        const apiError = error as ApiError;
        setToast(apiError.message || "회원가입에 실패했습니다.");
        window.setTimeout(() => setToast(null), 1800);
        if (apiError.code === "email_already_exists") emailValidation.setMessage(apiError.message);
        if (apiError.code === "nickname_already_exists") nicknameValidation.setMessage(apiError.message);
        if (apiError.code === "validation_failed") passwordValidation.setMessage(apiError.message);
      }
    });
  }

  return (
    <main className="auth-page">
      <section className="signup-shell">
        <div className="page-heading">
          <h1>회원가입</h1>
          <p>1분이면 충분해요. 지금 투표에 참여해보세요.</p>
        </div>

        <form className="auth-card signup-card" onSubmit={handleSubmit}>
          <label className="profile-upload">
            <div className="form-label">
              프로필 사진
            </div>
            <span className="profile-preview">
              {preview ? (
                <img src={preview} alt="프로필 미리보기" />
              ) : (
                <Icon name="camera" size="xl" className="profile-preview-icon" />
              )}
            </span>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setProfileImage(file);
                setPreview(file ? URL.createObjectURL(file) : "");
                setHelpers((prev) => ({ ...prev, profileImage: validateProfileImage(file) }));
              }}
            />
          </label>
          {helpers.profileImage ? <p className="helper helper--error">{helpers.profileImage}</p> : null}

          <InputField
            id="nickname"
            label="닉네임"
            value={nickname}
            placeholder="달콤한초코"
            onChange={(event) => {
              const nextNickname = event.target.value;
              setNickname(nextNickname);
              nicknameValidation.markChanged();
            }}
            onBlur={() => {
              nicknameValidation.validateNow();
            }}
            helper={nicknameValidation.message ?? ""}
          />
          <InputField
            id="email"
            label="이메일"
            value={email}
            placeholder="hello@votle.kr"
            onChange={(event) => {
              const nextEmail = event.target.value;
              setEmail(nextEmail);
              emailValidation.markChanged();
            }}
            onBlur={() => {
              emailValidation.validateNow();
            }}
            helper={emailValidation.message ?? ""}
          />
          <InputField
            id="password"
            label="비밀번호"
            type="password"
            value={password}
            placeholder="••••••••••"
            onChange={(event) => {
              const nextPassword = event.target.value;
              setPassword(nextPassword);
              passwordValidation.markChanged();
              if (passwordConfirmValidation.touched) passwordConfirmValidation.markChanged();
            }}
            onBlur={() => {
              passwordValidation.validateNow();
            }}
            helper={passwordValidation.message ?? ""}
            success={passwordValidation.isValid && password ? "사용 가능한 안전한 비밀번호예요" : ""}
          />
          <InputField
            id="passwordConfirm"
            label="비밀번호 확인"
            type="password"
            value={passwordConfirm}
            placeholder="••••••••••"
            onChange={(event) => {
              const nextPasswordConfirm = event.target.value;
              setPasswordConfirm(nextPasswordConfirm);
              passwordConfirmValidation.markChanged();
            }}
            onBlur={() => {
              passwordConfirmValidation.validateNow();
            }}
            helper={passwordConfirmValidation.message ?? ""}
            success={passwordConfirmValidation.isValid && passwordConfirm ? "비밀번호가 일치해요" : ""}
          />


          <Button
            type="submit"
            block
            disabled={!isValid || signupAction.isRunning}
            isLoading={signupAction.showLoading}
            loadingLabel="회원가입 처리 중"
          >
            가입하기
          </Button>
        </form>
        <Toast message={toast} variant="error" />
      </section>
    </main>
  );
}
