import type {
  Repo,
  SearchReposResponseDTO,
  GithubRepoDTO,
  ApiError,
} from "../types/github";

// GitHub API 기본 URL
const BASE_URL = "https://api.github.com";

// Result 패턴 정의
// 성공이면 ok: true + data
// 실패면 ok: false + error
export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };

// searchRepos가 UI에 돌려줄 최종 형태
export type SearchReposResult = {
  repos: Repo[];
  totalCount: number;
  incomplete: boolean;
};

// DTO -> Repo 변환 (정규화)
function toRepo(dto: GithubRepoDTO): Repo {
  return {
    id: dto.id,
    name: dto.full_name,
    url: dto.html_url,
    description: dto.description ?? null,

    stars: typeof dto.stargazers_count === "number" ? dto.stargazers_count : 0,
    forks: dto.forks_count,
    openIssues:
      typeof dto.open_issues_count === "number" ? dto.open_issues_count : 0,

    language: dto.language ?? null,
    pushedAt: dto.pushed_at,

    ownerLogin: dto.owner?.login ?? "",
    ownerAvatarUrl: dto.owner?.avatar_url ?? "",
  };
}

// GitHub 레포 검색 함수
// Promise<Result<SearchReposResponse>> 구조를 사용
export async function searchRepos(
  keyword: string,
): Promise<Result<SearchReposResult>> {
  // 입력값 공백 제거
  const trimmed = keyword.trim();

  // 검색어가 비어있으면 네트워크 요청을 보내지 않고 즉시 VALIDATION 실패 반환
  if (!trimmed) {
    return {
      ok: false,
      error: { code: "VALIDATION", message: "검색어를 입력해줘." },
    };
  }

  // 쿼리 파라미터를 안전하게 구성
  const params = new URLSearchParams({
    q: trimmed,
    page: "1",
    per_page: "10",
  });

  // 최종 URL 구성
  const url = `${BASE_URL}/search/repositories?${params.toString()}`;

  try {
    // GitHub API 호출
    const response = await fetch(url, {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    // HTTP 실패 처리 (fetch는 이걸 throw하지 않음)
    if (!response.ok) {
      let message = `GitHub API 요청 실패 (status: ${response.status})`;

      // GitHub에서 제공하는 에러 메시지를 읽어보되,
      // JSON 파싱이 실패해도 전체 흐름을 깨지 않기 위해 try/catch 사용
      try {
        const errBody = await response.json();
        if (errBody?.message) message = errBody.message;
      } catch {
        // ignore
      }

      // HTTP 실패를 Result 형태로 반환
      return {
        ok: false,
        error: { code: "HTTP", message, status: response.status },
      };
    }

    // 성공 시 JSON 파싱
    const json = (await response.json()) as SearchReposResponseDTO;

    const items = Array.isArray(json.items) ? json.items : [];
    const repos = items.map(toRepo);

    // 안전한 형태로 정제 후 반환
    return {
      ok: true,
      data: {
        repos,
        totalCount: typeof json.total_count === "number" ? json.total_count : 0,
        incomplete: Boolean(json.incomplete_results),
      },
    };
  } catch {
    // 네트워크 실패 처리
    return {
      ok: false,
      error: {
        code: "NETWORK",
        message: "네트워크 오류가 발생했습니다.",
      },
    };
  }
}
