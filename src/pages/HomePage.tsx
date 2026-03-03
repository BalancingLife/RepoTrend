import { useState } from "react";
import styles from "./HomePage.module.css";
import { searchRepos } from "../api/github";
import type { Repo, ApiError } from "../types/github";
import SearchBar from "../components/home/SearchBar";
import RepoList from "../components/RepoList";

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

      <RepoList repos={repos} />

      {/* 빈 상태 */}
      {!isLoading && !error && repos.length === 0 && keyword.trim() !== "" && (
        <p>검색 결과가 없습니다.</p>
      )}
    </div>
  );
};

export default HomePage;
