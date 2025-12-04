export interface Todo {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  category: string;
  due_date: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}

export const CATEGORIES = [
  { value: "default", label: "기본", color: "bg-gray-500" },
  { value: "work", label: "업무", color: "bg-blue-500" },
  { value: "personal", label: "개인", color: "bg-green-500" },
  { value: "shopping", label: "쇼핑", color: "bg-yellow-500" },
  { value: "health", label: "건강", color: "bg-red-500" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const SORT_OPTIONS = [
  { value: "newest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "completed", label: "완료순" },
  { value: "incomplete", label: "미완료순" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
