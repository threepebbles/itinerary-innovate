import { useState } from 'react';
import type { Category } from '@/entities/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CategoryCard } from './category-card';
import { AddCategoryDialog } from './add-category-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CategoryListProps {
  workspaceId: string;
  categories: Category[];
}

export const CategoryList = ({ workspaceId, categories }: CategoryListProps) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // 카테고리가 추가되면 자동으로 선택
  const selectedCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">카테고리</h2>
        <Button onClick={() => setAddDialogOpen(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          추가
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground mb-4">카테고리를 추가해보세요</p>
          <Button onClick={() => setAddDialogOpen(true)}>첫 카테고리 만들기</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Select
            value={selectedCategory?.id}
            onValueChange={setSelectedCategoryId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCategory && (
            <CategoryCard category={selectedCategory} workspaceId={workspaceId} />
          )}
        </div>
      )}

      <AddCategoryDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        workspaceId={workspaceId}
      />
    </div>
  );
};
