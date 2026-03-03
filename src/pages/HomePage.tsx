import { useState } from "react";
import styles from "./HomePage.module.css";
import { searchRepos } from "../api/github";
import type { Repo, ApiError } from "../types/github";
import SearchBar from "../components/home/SearchBar";

const HomePage = () => {
  const [keyword, setKeyword] = useState<string>("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  async function handleSearch() {
    setIsLoading(true);
    setError(null);

    const res = await searchRepos(keyword);

    if (res.ok) {
      setRepos(res.data.repos);
    } else {
      setError(res.error);
    }

    setIsLoading(false);
  }

  return (
    <div className={styles.container}>
      {/* 검색창 */}
      <SearchBar
        value={keyword}
        onChange={setKeyword}
        onSubmit={handleSearch}
        disabled={isLoading}
      />

      {/* 에러 */}
      {error && (
        <p>
          [{error.code}] {error.message}
          {error.status ? ` (status: ${error.status})` : ""}
        </p>
      )}

      <ul>
        {repos.map((repo) => (
          <li key={repo.id}>
            {/* target="_blank" : 링크를 새 탭에서 열게 함 */}
            {/* rel="noreferrer" 현재 페이지 주소를 상대 사이트에 안보내게 함 */}
            <a href={repo.url} target="_blank" rel="noreferrer">
              {repo.name}
            </a>

            <div>
              <span>⭐ 별 개수 : {repo.stars}</span>
              <span>🍴 포크 개수 : {repo.forks}</span>
              <span>🐛 이슈 개수 : {repo.openIssues}</span>
              <span>🕒 {repo.pushedAt}</span>
              {repo.language ? <span>💻 {repo.language}</span> : null}
            </div>

            {repo.description ? (
              <p>설명 : {repo.description}</p>
            ) : (
              <p>설명 없음</p>
            )}
          </li>
        ))}
      </ul>

      {/* 빈 상태 */}
      {!isLoading && !error && repos.length === 0 && keyword.trim() !== "" && (
        <p>검색 결과가 없습니다.</p>
      )}
    </div>
  );
};

export default HomePage;
