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
  // 1) 로딩
  if (isLoading) {
    return <p>로딩중...</p>;
  }

  // 2) 에러
  if (error) {
    return (
      <p>
        [{error.code}] {error.message}
        {error.status ? ` (status: ${error.status})` : ""}
      </p>
    );
  }

  // 3) 빈 상태 (검색을 했고, 받아온 repo가 없을 때)
  if (hasSearched && repos.length === 0) {
    return <p>검색 결과가 없습니다.</p>;
  }

  return (
    <>
      <ul>
        {repos.map((repo) => (
          <li key={repo.id}>
            <RepoCard repo={repo} />
          </li>
        ))}
      </ul>
    </>
  );
}
