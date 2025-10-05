import type { Place } from '@/entities/types';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { removePlace } from '@/mock/edge-functions/place';
import { setRepresentativePlace } from '@/mock/edge-functions/category';

interface PlaceItemProps {
  place: Place;
  categoryId: string;
  isRepresentative: boolean;
}

export const PlaceItem = ({ place, categoryId, isRepresentative }: PlaceItemProps) => {
  const handleDelete = async () => {
    const { error } = await removePlace(place.id, categoryId);
    if (error) {
      toast.error(error);
    } else {
      toast.success('장소가 삭제되었습니다.');
    }
  };

  const handleSetRepresentative = async () => {
    const newPlaceId = isRepresentative ? null : place.id;
    const { error } = await setRepresentativePlace(categoryId, newPlaceId);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success(isRepresentative ? '대표 장소가 해제되었습니다.' : '대표 장소로 설정되었습니다.');
    }
  };

  return (
    <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors group">
      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{place.name}</p>
        <p className="text-xs text-muted-foreground truncate">{place.address}</p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleSetRepresentative}
        >
          <Star
            className={`w-3 h-3 ${isRepresentative ? 'fill-primary text-primary' : ''}`}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleDelete}
        >
          <Trash2 className="w-3 h-3 text-destructive" />
        </Button>
      </div>
    </div>
  );
};
