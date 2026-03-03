import styles from "./RepoList.module.css";
import type { Repo } from "../types/github";
import type { ApiError } from "../types/github";
import RepoCard from "./RepoCard";

type Props = {
  repos: Repo[];
  isLoading: boolean;
  error: ApiError | null;
  hasSearched: boolean;
};

export default function RepoList({
  repos,
  isLoading,
  error,
  hasSearched,
}: Props) {
  if (isLoading) return <p className={styles.state}>로딩중...</p>;

  if (error) {
    return (
      <p className={styles.stateError}>
        [{error.code}] {error.message}
        {error.status ? ` (status: ${error.status})` : ""}
      </p>
    );
  }

  if (hasSearched && repos.length === 0) {
    return <p className={styles.state}>검색 결과가 없습니다.</p>;
  }

  return (
    <ul className={styles.list}>
      {repos.map((repo) => (
        <li key={repo.id} className={styles.item}>
          <RepoCard repo={repo} />
        </li>
      ))}
    </ul>
  );
}
