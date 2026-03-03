import styles from "./RepoCard.module.css";
import type { Repo } from "../types/github";

type Props = { repo: Repo };

const RepoCard = ({ repo }: Props) => {
  const pushedDate = repo.pushedAt ? repo.pushedAt.slice(0, 10) : "";

  return (
    // article 태그 : 독립적으로 떼어놔도 의미가 있는 콘텐츠 덩어리
    <article className={styles.card}>
      <a
        className={styles.title}
        href={repo.url}
        target="_blank"
        rel="noreferrer"
      >
        {repo.name}
      </a>

      <div className={styles.meta}>
        {/* toLocaleString()는 콤마를 넣어줌 */}
        <span>⭐ {repo.stars.toLocaleString()}</span>
        <span>🍴 {repo.forks.toLocaleString()}</span>
        <span>🐛 {repo.openIssues.toLocaleString()}</span>
        <span>🕒 {pushedDate}</span>
        {repo.language ? <span>💻 {repo.language}</span> : null}
      </div>

      <p className={styles.desc}>
        {repo.description ? repo.description : "설명 없음"}
      </p>
    </article>
  );
};

export default RepoCard;
