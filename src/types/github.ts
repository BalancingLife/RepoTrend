// 에러 코드 타입 정의
// VALIDATION: 입력 문제
// NETWORK: 서버 도달 실패
// HTTP: 4xx/5xx 응답
export type ApiErrorCode = "VALIDATION" | "NETWORK" | "HTTP";

// 에러 객체의 형태 정의
// status는 HTTP 에러일 때만 존재하므로 optional(?)
export type ApiError = { code: ApiErrorCode; message: string; status?: number };

/* GitHub Search API 응답 DTO (필요한 부분만) */
export type SearchReposResponseDTO = {
  total_count: number;
  incomplete_results: boolean;
  items: GithubRepoDTO[];
};

/*  GitHub Search API가 내려주는 repo의 "우리가 쓰는 필드만" 최소 DTO */
export type GithubRepoDTO = {
  id: number;

  full_name: string; // owner/name
  html_url: string;
  description: string | null;

  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;

  language: string | null;

  pushed_at: string; // 최근 커밋 푸시 (활동성 핵심)

  owner: {
    login: string;
    avatar_url: string;
  };

  // 나중에 하이라이트/토픽 쓸 거면 optional로 확장
  // topics?: string[];
  // text_matches?: Array<{ fragment: string; matches: Array<{ text: string; indices: [number, number] }> }>;
};

// UI에서 사용할 정규화된 Repo 타입
export type Repo = {
  id: number;

  name: string; // full_name
  url: string; // html_url
  description: string | null;

  stars: number; // stargazers_count
  forks: number; // forks_count
  openIssues: number; // open_issues_count

  language: string | null;

  pushedAt: string; // pushed_at

  ownerLogin: string;
  ownerAvatarUrl: string;
};
