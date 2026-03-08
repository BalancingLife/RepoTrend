import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./HomePage.module.css";
import SearchBar from "../components/home/SearchBar";
import RepoList from "../components/RepoList";
import { useInfiniteRepos } from "../hooks/useInfiniteRepos";
import type { ApiError } from "../types/github";

const HomePage = () => {
  const [searchInputValue, setSearchInputValue] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const isSearchSubmitted = searchQuery !== "";

  const perPage = 10;
  const sort = "forks";
  const order = "desc";

  const { repos, status, errorMsg, hasNext, isLoadingMore, loadMore } =
    useInfiniteRepos({
      searchQuery,
      perPage,
      sort,
      order,
    });

  const isSearching = status === "loading" && !isLoadingMore;

  const error: ApiError | null = useMemo(() => {
    if (!errorMsg) return null;
    return { code: "HTTP", message: errorMsg };
  }, [errorMsg]);

  /* 센티넬 */
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 최신 상태값 ref (Observer 콜백에서 stale 방지)
  const hasNextRef = useRef(hasNext);
  const isLoadingMoreRef = useRef(isLoadingMore);
  const statusRef = useRef(status);
  const isSearchSubmittedRef = useRef(isSearchSubmitted);

  useEffect(() => {
    hasNextRef.current = hasNext;
    isLoadingMoreRef.current = isLoadingMore;
    statusRef.current = status;
    isSearchSubmittedRef.current = isSearchSubmitted;
  }, [hasNext, isLoadingMore, status, isSearchSubmitted]);

  async function handleSearch() {
    if (!searchInputValue.trim()) return;

    setSearchQuery(searchInputValue.trim());
  }

  // loadMore도 ref로 (콜백 stale 방지)
  const loadMoreRef = useRef(loadMore);
  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  //  IntersectionObserver 설치
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      console.log("observer fired", entries[0]?.isIntersecting);

      const entry = entries[0];
      if (!entry?.isIntersecting) return;

      if (!isSearchSubmittedRef.current) return;
      if (statusRef.current === "error") return;
      if (!hasNextRef.current) return;
      if (isLoadingMoreRef.current) return;

      loadMoreRef.current();
    });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.brand}>
          <a
            href="/"
            className={styles.brandLink}
            aria-label="RepoTrend 홈으로"
          >
            <img
              src="/images/RepoTrend-logo.png"
              width="100"
              height="100"
              alt="RepoTrend 로고"
              className={styles.brandLogo}
            />
            <div className={styles.brandText}>
              <span className={styles.brandName}>RepoTrend</span>
              <span className={styles.brandSubtitle}>
                GitHub repo trends by keyword
              </span>
            </div>
          </a>
        </header>

        <main className={styles.bodyArea}>
          <SearchBar
            value={searchInputValue}
            onChange={setSearchInputValue}
            onSubmit={handleSearch}
            disabled={isSearching}
          />

          <RepoList
            repos={repos}
            isLoading={isSearching}
            error={error}
            isSearchSubmitted={isSearchSubmitted}
          />

          {isSearchSubmitted && isLoadingMore && (
            <div className={styles.loadMoreHint}>불러오는 중...</div>
          )}

          <div ref={sentinelRef} className={styles.sentinel} />
        </main>
      </div>
    </div>
  );
};

export default HomePage;
