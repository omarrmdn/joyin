"use client";

/**
 * TagsBar — Matches the mobile TagsBar/TagPill components.
 * Horizontal scrollable list of pill buttons, just like the RN version.
 */
interface TagsBarProps {
  tags: string[];
  activeTag: string;
  onTagPress: (tag: string) => void;
}

export function TagsBar({ tags, activeTag, onTagPress }: TagsBarProps) {
  return (
    <div className="tags-bar">
      {tags.map((tag) => (
        <button
          key={tag}
          className={`tag-pill ${activeTag === tag ? "active" : "inactive"}`}
          onClick={() => onTagPress(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
