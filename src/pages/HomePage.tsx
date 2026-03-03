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
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  async function handleSearch() {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setHasSearched(true);
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

      <RepoList
        repos={repos}
        isLoading={isLoading}
        error={error}
        hasSearched={hasSearched}
      />
    </div>
  );
};

export default HomePage;
