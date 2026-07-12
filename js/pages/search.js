import { renderHeader } from "../components/Header.js";

renderHeader({
  showProfile: true,
  showProfileMenu: true,
});

const query = new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
const hasDemoResults = query === "선물";

document.body.dataset.state = hasDemoResults ? "results" : "empty";

const queryLabel = document.getElementById("search-query");
if (queryLabel) queryLabel.textContent = query || "검색어";
