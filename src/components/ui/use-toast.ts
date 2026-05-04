"use client";

import * as React from "react";

export type ToastVariant = "default" | "destructive" | "success";

export interface ToastItem {
  id: number;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

type Listener = (toasts: ToastItem[]) => void;

const listeners: Listener[] = [];
let memoryToasts: ToastItem[] = [];
let nextId = 1;

function emit() {
  for (const l of listeners) l(memoryToasts);
}

export function toast(options: Omit<ToastItem, "id">) {
  const id = nextId++;
  memoryToasts = [...memoryToasts, { id, ...options }];
  emit();
  setTimeout(() => {
    memoryToasts = memoryToasts.filter((t) => t.id !== id);
    emit();
  }, 4000);
  return id;
}

export function dismissToast(id: number) {
  memoryToasts = memoryToasts.filter((t) => t.id !== id);
  emit();
}

export function useToastStore() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(memoryToasts);
  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const idx = listeners.indexOf(setToasts);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }, []);
  return toasts;
}

export function useToast() {
  return { toast };
}
