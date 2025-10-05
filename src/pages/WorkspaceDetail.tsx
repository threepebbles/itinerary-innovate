import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/mock/db';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import { CategoryList } from '@/features/categories/category-list';
import { MapCanvas } from '@/features/map/map-canvas';
import { useSettingsStore } from '@/shared/stores/settings-store';
import { toast } from 'sonner';

const WorkspaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const kakaoJsApiKey = useSettingsStore((state) => state.kakaoJsApiKey);
  const kakaoRestApiKey = useSettingsStore((state) => state.kakaoRestApiKey);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const workspace = useLiveQuery(() => (id ? db.workspaces.get(id) : undefined), [id]);

  const categories = useLiveQuery(
    () => (id ? db.categories.where('workspaceId').equals(id).sortBy('sortOrder') : []),
    [id]
  );

  useEffect(() => {
    if (!kakaoJsApiKey || !kakaoRestApiKey) {
      toast.info('Kakao API 키를 설정해주세요.', {
        action: {
          label: '설정하기',
          onClick: () => navigate('/settings'),
        },
      });
    }
  }, [kakaoJsApiKey, kakaoRestApiKey, navigate]);

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>워크스페이스를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-card">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/workspaces')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{workspace.title}</h1>
              <p className="text-xs text-muted-foreground">
                {new Date(workspace.date).toLocaleDateString('ko-KR')} · {workspace.headcount}명
              </p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          <div className="overflow-y-auto">
            <CategoryList workspaceId={workspace.id} categories={categories || []} />
          </div>

          <div className="rounded-xl overflow-hidden border border-border/50 shadow-lg bg-card sticky top-24">
            {kakaoJsApiKey ? (
              <MapCanvas workspaceId={workspace.id} categories={categories || []} />
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center">
                <div>
                  <p className="text-muted-foreground mb-4">
                    지도를 표시하려면 Kakao API 키를 설정해주세요.
                  </p>
                  <Button onClick={() => navigate('/settings')}>설정하기</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkspaceDetail;
