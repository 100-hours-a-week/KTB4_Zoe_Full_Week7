import type React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "@/api/auth";
import { Button } from "@/components/Button";
import { InputField } from "@/components/InputField";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useDebouncedValidation } from "@/hooks/useDebouncedValidation";
import type { ApiError } from "@/types/domain";
import { validateEmail, validatePassword } from "@/utils/validators";

export function LoginPage() {
  const navigate = useNavigate();
  const { setUserFromResponse } = useAuth();
  const loginAction = useAsyncAction();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailValidation = useDebouncedValidation(() => validateEmail(email), [email]);
  const passwordValidation = useDebouncedValidation(() => validatePassword(password), [password]);

  const isValid = emailValidation.isValid && passwordValidation.isValid;

  function validateForm() {
    const emailError = emailValidation.validateNow();
    const passwordError = passwordValidation.validateNow();
    return !emailError && !passwordError;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validateForm()) return;

    await loginAction.run(async () => {
      try {
        const response = await login(email, password);
        setUserFromResponse(response.data);
        navigate("/posts");
      } catch (error) {
        const apiError = error as ApiError;
        passwordValidation.setMessage(
          apiError.status === 401 || apiError.code === "authentication_failed"
            ? "아이디 또는 비밀번호를 확인해주세요"
            : apiError.message,
        );
      }
    });
  }

  return (
    <main className="auth-page">
      <section className="auth-shell login-shell">
        <Logo size="large" />
        <p>의견이 모이면 답이 보여요</p>

        <form className="auth-card login-card" onSubmit={handleSubmit}>
          <InputField
            id="email"
            label="이메일"
            placeholder="hello@votle.kr"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              emailValidation.markChanged();
            }}
            onBlur={emailValidation.validateNow}
            helper={emailValidation.message ?? ""}
          />
          <InputField
            id="password"
            label="비밀번호"
            type="password"
            placeholder="••••••••••"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              passwordValidation.markChanged();
            }}
            onBlur={passwordValidation.validateNow}
            helper={passwordValidation.message ?? ""}
          />
          <Button
            type="submit"
            block
            disabled={!isValid || loginAction.isRunning}
            isLoading={loginAction.showLoading}
            loadingLabel="로그인 처리 중"
          >
            로그인
          </Button>
        </form>

        <p className="auth-footer">
          아직 회원이 아니신가요? <Link to="/signup">회원가입</Link>
        </p>
      </section>
    </main>
  );
}
