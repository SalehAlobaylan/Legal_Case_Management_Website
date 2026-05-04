"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Props = {
  id: string;
  children: React.ReactNode;
  className?: string;
  isRTL?: boolean;
};

export function SortableField({ id, children, className, isRTL }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5",
        isDragging && "shadow-lg ring-2 ring-amber-200",
        className
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-amber-300 rounded"
        aria-label={isRTL ? "إعادة ترتيب" : "Reorder"}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
