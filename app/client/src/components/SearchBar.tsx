interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="search"
        className="search-input"
        placeholder="Search by name, company, or role…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
