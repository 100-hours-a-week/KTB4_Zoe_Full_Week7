import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePassword } from "@/api/auth";
import { Button } from "@/components/Button";
import { InputField } from "@/components/InputField";
import { Layout } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { Toast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useDebouncedValidation } from "@/hooks/useDebouncedValidation";
import { validatePassword, validatePasswordConfirm } from "@/utils/validators";

export function PasswordEditPage() {
  const navigate = useNavigate();
  const action = useAsyncAction();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const passwordValidation = useDebouncedValidation(() => validatePassword(password), [password]);
  const passwordConfirmValidation = useDebouncedValidation(
    () => validatePasswordConfirm(password, passwordConfirm),
    [password, passwordConfirm],
  );

  const isValid = passwordValidation.isValid && passwordConfirmValidation.isValid;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const passwordError = passwordValidation.validateNow();
    const passwordConfirmError = passwordConfirmValidation.validateNow();
    if (passwordError || passwordConfirmError) return;

    await action.run(async () => {
      try {
        await updatePassword(password.trim());
        setPassword("");
        setPasswordConfirm("");
        passwordValidation.reset();
        passwordConfirmValidation.reset();
        setToast("수정 완료");
        window.setTimeout(() => setToast(null), 1800);
      } catch (error) {
        passwordValidation.setMessage(error instanceof Error ? error.message : "비밀번호를 변경하지 못했습니다.");
      }
    });
  }

  return (
    <RequireAuth>
      <Layout narrow backTo="/profile/edit">
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="page-heading">
            <h1>비밀번호 변경</h1>
            <p>새 비밀번호를 입력해주세요.</p>
          </div>
          <InputField
            id="password"
            label="새 비밀번호"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              passwordValidation.markChanged();
              if (passwordConfirmValidation.touched) passwordConfirmValidation.markChanged();
            }}
            onBlur={passwordValidation.validateNow}
            helper={passwordValidation.message ?? ""}
          />
          <InputField
            id="passwordConfirm"
            label="비밀번호 확인"
            type="password"
            value={passwordConfirm}
            onChange={(event) => {
              setPasswordConfirm(event.target.value);
              passwordConfirmValidation.markChanged();
            }}
            onBlur={passwordConfirmValidation.validateNow}
            helper={passwordConfirmValidation.message ?? ""}
          />
          <Button
            type="submit"
            block
            disabled={!isValid || action.isRunning}
            isLoading={action.showLoading}
            loadingLabel="비밀번호 수정 중"
          >
            수정하기
          </Button>
          <Button type="button" variant="ghost" block onClick={() => navigate("/profile/edit")}>
            취소
          </Button>
        </form>
        <Toast message={toast} />
      </Layout>
    </RequireAuth>
  );
}
