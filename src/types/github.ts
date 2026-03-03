// ----------------------------
// 공통 Result / Error 모델
// ----------------------------

// 에러 코드 타입 정의
// VALIDATION: 입력 문제
// NETWORK: 서버 도달 실패
// HTTP: 4xx/5xx 응답
export type ApiErrorCode = "VALIDATION" | "NETWORK" | "HTTP";

// 에러 객체의 형태 정의
// status는 HTTP 에러일 때만 존재하므로 optional(?)
export type ApiError = {
  code: ApiErrorCode;
  message: string;
  status?: number;
};

// api 반환 타입, 성공이면 data, 실패하면 error담은 객체 반환
export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };

// ----------------------------
// GitHub Search API DTO
// ----------------------------

/* GitHub Search API 응답 DTO (필요한 부분만) */
export type SearchReposResponseDTO = {
  total_count: number;
  incomplete_results: boolean;
  items: GithubRepoDTO[];
};

/* GitHub Search API items(repo) 최소 DTO */
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

// ----------------------------
// UI에서 쓸 정규화 모델
// ----------------------------

// searchRepos API가 UI에 돌려줄 최종 형태
export type SearchReposResult = {
  repos: Repo[];
  totalCount: number;
  incomplete: boolean;
};

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
