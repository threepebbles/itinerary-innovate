export const CATEGORY_COLORS = [
  '#6E59A5', // purple
  '#2563EB', // blue
  '#10B981', // green
  '#F59E0B', // orange
  '#EF4444', // red
  '#06B6D4', // cyan
] as const;

export type CategoryColor = typeof CATEGORY_COLORS[number];

export const getCategoryColor = (index: number): CategoryColor => {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
};
