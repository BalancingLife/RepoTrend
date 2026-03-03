type Props = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  disabled,
}: Props) {
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="찾고자 하는 레포지토리의 키워드를 입력해주세요."
      />
      <button onClick={onSubmit} disabled={disabled}>
        {disabled ? "검색중..." : "검색"}
      </button>
    </div>
  );
}
