import type { Category } from '@shared/types';

interface Props {
  categories: Category[];
  active: string | null;
  onSelect: (id: string | null) => void;
}

export default function FilterBar({ categories, active, onSelect }: Props) {
  return (
    <div className="filter-bar">
      <button
        className={`filter-btn${active === null ? ' filter-btn--active' : ''}`}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {categories.map((cat) => (
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
