import type { Category } from '@shared/types';

interface Props {
  categories: Category[];
  active: string | null;
  onSelect: (id: string | null) => void;
}

export default function FilterBar({ categories, active, onSelect }: Props) {
  const sorted = [...categories].sort((a, b) => {
    if (a.name === 'Other') return 1;
    if (b.name === 'Other') return -1;
    return 0;
  });
  return (
    <div className="filter-bar">
      <button
        className={`filter-btn${active === null ? ' filter-btn--active' : ''}`}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {sorted.map((cat) => (
        <button
          key={cat.id}
          className={`filter-btn${active === cat.id ? ' filter-btn--active' : ''}`}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
