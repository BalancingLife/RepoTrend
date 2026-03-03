import React from "react";
import styles from "./SearchBar.module.css";

type Props = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void | Promise<void>;
  disabled?: boolean;
};

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  disabled,
}: Props) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;
    onSubmit();
  }

  return (
    <form className={styles.searchBar} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="찾고자 하는 레포지토리의 키워드를 입력해주세요."
        disabled={disabled}
      />
      <button className={styles.button} type="submit" disabled={disabled}>
        {disabled ? "검색중..." : "검색"}
      </button>
    </form>
  );
}
