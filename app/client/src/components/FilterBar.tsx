import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Category } from '@shared/types';

interface Props {
  categories: Category[];
  active: string | null;
  onSelect: (id: string | null) => void;
  onReorder: (newOrder: Category[]) => void;
}

interface SortableBtnProps {
  cat: Category;
  active: string | null;
  editMode: boolean;
  onSelect: (id: string | null) => void;
}

function SortableFilterBtn({ cat, active, editMode, onSelect }: SortableBtnProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      className={[
        'filter-btn',
        active === cat.id && !editMode ? 'filter-btn--active' : '',
        editMode ? 'filter-btn--draggable' : '',
      ].filter(Boolean).join(' ')}
      onClick={editMode ? undefined : () => onSelect(cat.id)}
      {...(editMode ? { ...attributes, ...listeners } : {})}
    >
      {cat.name}
    </button>
  );
}

export default function FilterBar({ categories, active, onSelect, onReorder }: Props) {
  const [editMode, setEditMode] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 4 },
  }));

  function handleDragEnd(event: DragEndEvent) {
    const { active: dragActive, over } = event;
    if (!over || dragActive.id === over.id) return;
    const oldIdx = categories.findIndex((c) => c.id === dragActive.id);
    const newIdx = categories.findIndex((c) => c.id === over.id);
    onReorder(arrayMove(categories, oldIdx, newIdx));
  }

  function handleEditToggle() {
    setEditMode((e) => !e);
  }

  return (
    <div className="filter-bar">
      {!editMode && (
        <button
          className={`filter-btn${active === null ? ' filter-btn--active' : ''}`}
          onClick={() => onSelect(null)}
        >
          All
        </button>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
          {categories.map((cat) => (
            <SortableFilterBtn
              key={cat.id}
              cat={cat}
              active={active}
              editMode={editMode}
              onSelect={onSelect}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        className={`filter-btn filter-btn--edit-toggle${editMode ? ' filter-btn--edit-toggle-active' : ''}`}
        onClick={handleEditToggle}
      >
        {editMode ? 'Done' : 'Edit'}
      </button>
    </div>
  );
}
