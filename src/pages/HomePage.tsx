import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./HomePage.module.css";
import SearchBar from "../components/home/SearchBar";
import RepoList from "../components/RepoList";
import { useInfiniteRepos } from "../hooks/useInfiniteRepos";
import type { ApiError } from "../types/github";

const HomePage = () => {
  // 입력창에 타이핑 중인 값
  const [draft, setDraft] = useState<string>("");
  // 실제로 검색에 사용되는 값(Submit 시 확정)
  const [keyword, setKeyword] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const perPage = 10;
  const sort = "forks";
  const order = "desc";

  const { repos, status, errorMsg, hasNext, isLoadingMore, loadMore } =
    useInfiniteRepos({
      keyword,
      perPage,
      sort,
      order,
    });

  const isInitialLoading = status === "loading" && !isLoadingMore;
  const isSearching = isInitialLoading; // 검색 버튼 disabled는 “첫 로딩”에만

  // RepoList가 ApiError를 받는 구조라면, errorMsg를 ApiError로 맞춰서 전달
  const error: ApiError | null = useMemo(() => {
    if (!errorMsg) return null;
    return { code: "HTTP", message: errorMsg }; // 단순 매핑(원하면 더 정교하게)
  }, [errorMsg]);

  async function handleSearch() {
    const trimmed = draft.trim();

    if (!trimmed) return;

    setHasSearched(true);
    setKeyword(trimmed); // 이 순간 훅이 RESET + 1 페이지 로딩
  }

  /* 센티넬 */
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 최신 상태값 ref (Observer 콜백에서 stale 방지)
  const hasNextRef = useRef(hasNext);
  const isLoadingMoreRef = useRef(isLoadingMore);
  const statusRef = useRef(status);
  const hasSearchedRef = useRef(hasSearched);

  useEffect(() => {
    hasNextRef.current = hasNext;
    isLoadingMoreRef.current = isLoadingMore;
    statusRef.current = status;
    hasSearchedRef.current = hasSearched;
  }, [hasNext, isLoadingMore, status, hasSearched]);

  // ✅ loadMore도 ref로 (콜백 stale 방지)
  const loadMoreRef = useRef(loadMore);
  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  // ✅ IntersectionObserver 설치
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      console.log("observer fired", entries[0]?.isIntersecting);

      const entry = entries[0];
      if (!entry?.isIntersecting) return;

      // 호출 조건 엄격히
      if (!hasSearchedRef.current) return;
      if (statusRef.current === "error") return;
      if (!hasNextRef.current) return;
      if (isLoadingMoreRef.current) return;

      loadMoreRef.current();
    });

    observer.observe(el);
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
            value={draft}
            onChange={setDraft}
            onSubmit={handleSearch}
            disabled={isSearching}
          />

          <RepoList
            repos={repos}
            isLoading={isInitialLoading}
            error={error}
            hasSearched={hasSearched}
          />

          {/* 하단: append 로딩 표시 (리스트는 그대로) */}
          {hasSearched && isLoadingMore && (
            <div className={styles.loadMoreHint}>불러오는 중...</div>
          )}

          {/*  센티넬: RepoList 맨 아래에 두기 */}
          <div ref={sentinelRef} className={styles.sentinel} />
        </main>
      </div>
    </div>
  );
};

export default HomePage;
