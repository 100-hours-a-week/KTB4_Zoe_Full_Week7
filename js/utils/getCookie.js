export function getCookie(name) {
  const cookies = document.cookie.split("; ");

  const cookie = cookies.find((row) => row.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split("=")[1]);
}