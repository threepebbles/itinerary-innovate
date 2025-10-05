import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Category } from '@/entities/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Plus, Trash2, MapPin } from 'lucide-react';
import { db } from '@/mock/db';
import { getPlacesByCategory } from '@/mock/edge-functions/place';
import { PlaceSearchDialog } from '@/features/places/place-search-dialog';
import { PlaceItem } from '@/features/places/place-item';
import { deleteCategory } from '@/mock/edge-functions/category';
import { toast } from 'sonner';

interface CategoryCardProps {
  category: Category;
  workspaceId: string;
}

export const CategoryCard = ({ category, workspaceId }: CategoryCardProps) => {
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const places = useLiveQuery(async () => {
    return await getPlacesByCategory(category.id);
  }, [category.id]);

  const representativePlace = useLiveQuery(async () => {
    if (!category.representativePlaceId) return null;
    return await db.places.get(category.representativePlaceId);
  }, [category.representativePlaceId]);

  const handleDelete = async () => {
    if (!confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?`)) {
      return;
    }

    const { error } = await deleteCategory(category.id);
    if (error) {
      toast.error(error);
    } else {
      toast.success('카테고리가 삭제되었습니다.');
    }
  };

  return (
    <>
      <Card className="hover-lift">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <CardTitle className="text-base flex-1">{category.name}</CardTitle>
            {representativePlace && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <MapPin className="w-3 h-3" />
                대표
              </Badge>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {places && places.length > 0 ? (
            <div className="space-y-2">
              {places.map((place) => (
                <PlaceItem
                  key={place.id}
                  place={place}
                  categoryId={category.id}
                  isRepresentative={place.id === category.representativePlaceId}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              장소를 추가해보세요
            </p>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => setSearchDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            장소 검색
          </Button>
        </CardContent>
      </Card>

      <PlaceSearchDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
        categoryId={category.id}
        workspaceId={workspaceId}
      />
    </>
  );
};
