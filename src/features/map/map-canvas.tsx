import { useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Category } from '@/entities/types';
import { useKakaoLoader } from '@/shared/hooks/use-kakao-loader';
import { useSettingsStore } from '@/shared/stores/settings-store';
import { db } from '@/mock/db';
import { getPlacesByCategory } from '@/mock/edge-functions/place';
import { setRepresentativePlace } from '@/mock/edge-functions/category';
import { toast } from 'sonner';

interface MapCanvasProps {
  workspaceId: string;
  categories: Category[];
}

export const MapCanvas = ({ workspaceId, categories }: MapCanvasProps) => {
  const kakaoJsApiKey = useSettingsStore((state) => state.kakaoJsApiKey);
  const { ready, error } = useKakaoLoader(kakaoJsApiKey);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  // Get all places for all categories
  const allPlacesData = useLiveQuery(async () => {
    const placesMap = new Map();
    
    for (const category of categories) {
      const places = await getPlacesByCategory(category.id);
      for (const place of places) {
        placesMap.set(place.id, { place, category });
      }
    }
    
    return placesMap;
  }, [categories]);

  // Initialize map
  useEffect(() => {
    if (!ready || !mapRef.current || !window.kakao || mapInstance.current) return;

    const container = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780), // Seoul
      level: 5,
    };

    mapInstance.current = new window.kakao.maps.Map(container, options);

    // Handle map relayout on window resize
    const handleResize = () => {
      if (mapInstance.current) {
        mapInstance.current.relayout();
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Initial relayout
    setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.relayout();
      }
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [ready]);

  // Update markers and route
  useEffect(() => {
    if (!ready || !mapInstance.current || !allPlacesData) return;

    const kakao = window.kakao;
    const map = mapInstance.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const bounds = new kakao.maps.LatLngBounds();
    const markers: any[] = [];

    // Create a map to track representative places and their order
    const representativeMap = new Map<string, number>();
    categories.forEach((cat, index) => {
      if (cat.representativePlaceId) {
        representativeMap.set(cat.representativePlaceId, index + 1);
      }
    });

    // Add markers for all places
    allPlacesData.forEach(({ place, category }) => {
      const position = new kakao.maps.LatLng(place.lat, place.lng);
      bounds.extend(position);

      const isRepresentative = category.representativePlaceId === place.id;
      const categoryOrder = representativeMap.get(place.id);

      const markerContent = document.createElement('div');
      
      if (isRepresentative && categoryOrder) {
        // Representative place marker with number
        markerContent.style.cssText = `
          width: 32px;
          height: 32px;
          background-color: ${category.color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 14px;
          cursor: pointer;
          z-index: 100;
        `;
        markerContent.textContent = String(categoryOrder);
      } else {
        // Regular place marker (smaller, no number)
        markerContent.style.cssText = `
          width: 20px;
          height: 20px;
          background-color: ${category.color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
          z-index: 50;
        `;
      }

      const customOverlay = new kakao.maps.CustomOverlay({
        position,
        content: markerContent,
        zIndex: isRepresentative ? 100 : 50,
      });

      customOverlay.setMap(map);
      markers.push(customOverlay);

      // Add click event to set as representative
      markerContent.addEventListener('click', async () => {
        const currentIsRepresentative = category.representativePlaceId === place.id;
        const newPlaceId = currentIsRepresentative ? null : place.id;
        
        const { error } = await setRepresentativePlace(category.id, newPlaceId);
        
        if (error) {
          toast.error(error);
        } else {
          toast.success(
            currentIsRepresentative ? '대표 장소가 해제되었습니다.' : `"${place.name}"을(를) 대표 장소로 설정했습니다.`
          );
        }
      });

      // Add info window on hover
      const infoWindow = new kakao.maps.InfoWindow({
        content: `<div style="padding:8px;font-size:12px;font-weight:500;white-space:nowrap;">${place.name}${isRepresentative ? ' ⭐' : ''}</div>`,
      });

      markerContent.addEventListener('mouseenter', () => {
        infoWindow.open(map, customOverlay);
      });

      markerContent.addEventListener('mouseleave', () => {
        infoWindow.close();
      });
    });

    markersRef.current = markers;

    // Draw route connecting representative places
    const representativePlaces = categories
      .filter((cat) => cat.representativePlaceId)
      .map((cat) => {
        const data = allPlacesData.get(cat.representativePlaceId!);
        return data ? data.place : null;
      })
      .filter((p) => p !== null);

    if (representativePlaces.length >= 2) {
      const path = representativePlaces.map(
        (place) => new kakao.maps.LatLng(place!.lat, place!.lng)
      );

      const polyline = new kakao.maps.Polyline({
        path,
        strokeWeight: 4,
        strokeColor: '#6E59A5',
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
      });

      polyline.setMap(map);
      polylineRef.current = polyline;
    }

    // Fit bounds
    if (markers.length > 0) {
      map.setBounds(bounds);
    }
  }, [ready, allPlacesData, categories]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">지도 로딩 중...</p>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
};
