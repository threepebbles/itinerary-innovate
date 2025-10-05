import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { addCategory } from '@/mock/edge-functions/category';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

const SUGGESTED_CATEGORIES = ['점심', '카페', '산책', '쇼핑', '저녁', '디저트'];

export const AddCategoryDialog = ({ open, onOpenChange, workspaceId }: AddCategoryDialogProps) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (categoryName: string) => {
    if (!categoryName.trim()) {
      toast.error('카테고리 이름을 입력해주세요.');
      return;
    }

    setLoading(true);

    const { category, error } = await addCategory({
      workspaceId,
      name: categoryName,
    });

    if (error || !category) {
      toast.error(error || '카테고리 추가에 실패했습니다.');
      setLoading(false);
      return;
    }

    toast.success('카테고리가 추가되었습니다!');
    setName('');
    onOpenChange(false);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>카테고리 추가</DialogTitle>
          <DialogDescription>새로운 카테고리를 추가하세요</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>추천 카테고리</Label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSubmit(category)}
                  disabled={loading}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">직접 입력</Label>
            <Input
              id="name"
              placeholder="카테고리 이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(name);
                }
              }}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button onClick={() => handleSubmit(name)} disabled={loading || !name.trim()}>
              {loading ? '추가 중...' : '추가'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
