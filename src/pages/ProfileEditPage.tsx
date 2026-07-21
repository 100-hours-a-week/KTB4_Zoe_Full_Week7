import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteUser, updateUser } from "@/api/users";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { InputField } from "@/components/InputField";
import { Layout } from "@/components/Layout";
import { Modal } from "@/components/Modal";
import { RequireAuth } from "@/components/RequireAuth";
import { Toast } from "@/components/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useDebouncedValidation } from "@/hooks/useDebouncedValidation";
import { validateNickname } from "@/utils/validators";

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { user, setUserFromResponse, clearUser } = useAuth();
  const updateAction = useAsyncAction();
  const withdrawAction = useAsyncAction();
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const nicknameValidation = useDebouncedValidation(() => validateNickname(nickname), [nickname], {
    initialMessage: user?.nickname ? validateNickname(user.nickname) : null,
  });
  const isValid = nicknameValidation.isValid;

  useEffect(() => {
    const nextNickname = user?.nickname ?? "";
    setNickname(nextNickname);
    nicknameValidation.reset(nextNickname ? validateNickname(nextNickname) : null);
  }, [nicknameValidation.reset, user?.nickname]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const error = nicknameValidation.validateNow();
    if (error) return;

    const formData = new FormData();
    formData.append("nickname", nickname.trim());
    if (image) formData.append("profileImage", image);

    await updateAction.run(async () => {
      try {
        const response = await updateUser(formData);
        setUserFromResponse(response.data);
        setToast("수정 완료");
        window.setTimeout(() => setToast(null), 1800);
      } catch (error) {
        nicknameValidation.setMessage(error instanceof Error ? error.message : "회원 정보를 수정하지 못했습니다.");
      }
    });
  }

  async function handleWithdraw() {
    await withdrawAction.run(async () => {
      await deleteUser();
      clearUser();
      navigate("/login");
    });
  }

  return (
    <RequireAuth>
      <Layout narrow>
        <section className="profile-edit-page">
          <div className="profile-edit-heading">
            <h1>정보 수정</h1>
            <p>프로필과 계정 정보를 관리하세요</p>
          </div>

          <form id="profile-edit-form" className="profile-edit-form" onSubmit={handleSubmit}>
            <label className="profile-image-edit">
              <Avatar src={preview || user?.profileImage} nickname={nickname} size="lg" />
              <span>사진 변경</span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setImage(file);
                  setPreview(file ? URL.createObjectURL(file) : "");
                }}
              />
            </label>
            <InputField
              id="nickname"
              label="닉네임"
              value={nickname}
              onChange={(event) => {
                setNickname(event.target.value);
                nicknameValidation.markChanged();
              }}
              onBlur={nicknameValidation.validateNow}
              helper={nicknameValidation.message ?? ""}
            />
            <InputField id="email" label="이메일" value={user?.email ?? ""} readOnly />
            <p className="profile-email-hint">이메일은 변경할 수 없어요</p>
            <button className="profile-password-link" type="button" onClick={() => navigate("/password/edit")}>
              <span>비밀번호 변경</span>
              <span aria-hidden="true">›</span>
            </button>
          </form>

          <div className="profile-edit-footer">
            <button className="danger-link" type="button" onClick={() => setWithdrawOpen(true)}>
              회원 탈퇴
            </button>
            <div className="profile-edit-actions">
              <Button type="button" variant="ghost" onClick={() => navigate("/mypage")}>
                취소
              </Button>
              <Button
                type="submit"
                form="profile-edit-form"
                disabled={!isValid || updateAction.isRunning}
                isLoading={updateAction.showLoading}
                loadingLabel="회원 정보 저장 중"
              >
                저장하기
              </Button>
            </div>
          </div>
        </section>
        <Toast message={toast} />
        <Modal
          open={withdrawOpen}
          title="회원탈퇴 하시겠습니까?"
          description="작성된 게시글과 댓글은 삭제됩니다."
          confirmText="탈퇴하기"
          danger
          isLoading={withdrawAction.showLoading}
          onClose={() => setWithdrawOpen(false)}
          onConfirm={handleWithdraw}
        />
      </Layout>
    </RequireAuth>
  );
}
