import type { Repo } from "../types/github";
import RepoCard from "./RepoCard";

type Props = { repos: Repo[] };

export default function RepoList({ repos }: Props) {
  return (
    <ul>
      {repos.map((repo) => (
        <li key={repo.id}>
          <RepoCard repo={repo} />
        </li>
      ))}
    </ul>
  );
}
