import type { Repo } from "../types/github";

// export type Repo = {
//   id: number;

//   name: string; // full_name
//   url: string; // html_url
//   description: string | null;

//   stars: number; // stargazers_count
//   forks: number; // forks_count
//   openIssues: number; // open_issues_count

//   language: string | null;

//   pushedAt: string; // pushed_at

//   ownerLogin: string;
//   ownerAvatarUrl: string;
// };

type Props = { repo: Repo };
const RepoCard = ({ repo }: Props) => {
  return (
    <div>
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

      {repo.description ? <p>설명 : {repo.description}</p> : <p>설명 없음</p>}
    </div>
  );
};

export default RepoCard;
