import { useState } from 'react';

interface Props {
  onAddCategory: () => void;
  onAddContact: () => void;
}

export default function FabMenu({ onAddCategory, onAddContact }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fab-container">
      {open && (
        <>
          <button
            className="fab-option"
            onClick={() => { setOpen(false); onAddCategory(); }}
          >
            + Category
          </button>
          <button
            className="fab-option"
            onClick={() => { setOpen(false); onAddContact(); }}
          >
            + Contact
          </button>
        </>
      )}
      <button
        className={`fab${open ? ' fab--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Add"
      >
        {open ? '✕' : '+'}
      </button>
    </div>
  );
}
