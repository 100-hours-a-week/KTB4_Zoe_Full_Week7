import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { MyPage } from "@/pages/MyPage";
import { PasswordEditPage } from "@/pages/PasswordEditPage";
import { PostCreatePage } from "@/pages/PostCreatePage";
import { PostDetailPage } from "@/pages/PostDetailPage";
import { PostEditPage } from "@/pages/PostEditPage";
import { PostsPage } from "@/pages/PostsPage";
import { ProfileEditPage } from "@/pages/ProfileEditPage";
import { SignupPage } from "@/pages/SignupPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/posts" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/posts" element={<PostsPage />} />
      <Route path="/posts/new" element={<PostCreatePage />} />
      <Route path="/posts/:postId" element={<PostDetailPage />} />
      <Route path="/posts/:postId/edit" element={<PostEditPage />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/profile/edit" element={<ProfileEditPage />} />
      <Route path="/password/edit" element={<PasswordEditPage />} />
      <Route path="*" element={<Navigate to="/posts" replace />} />
    </Routes>
  );
}
