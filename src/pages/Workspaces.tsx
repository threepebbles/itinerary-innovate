import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useWorkspaceStore } from '@/shared/stores/workspace-store';
import { db } from '@/mock/db';
import { Plus, LogOut, Settings, Calendar, Users } from 'lucide-react';
import { CreateWorkspaceDialog } from '@/features/workspaces/create-workspace-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteWorkspace } from '@/mock/edge-functions/workspace';

const Workspaces = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const setSelectedWorkspace = useWorkspaceStore((state) => state.setSelectedWorkspace);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const workspaces = useLiveQuery(
    () => (user ? db.workspaces.where('ownerId').equals(user.id).toArray() : []),
    [user]
  );

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleSelectWorkspace = (id: string) => {
    setSelectedWorkspace(id);
    navigate(`/workspace/${id}`);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 워크스페이스를 삭제하시겠습니까?`)) {
      return;
    }

    const { error } = await deleteWorkspace(id);
    if (error) {
      toast.error(error);
    } else {
      toast.success('워크스페이스가 삭제되었습니다.');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-card">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">코스잇다</h1>
            <p className="text-sm text-muted-foreground">{user.nickname}님, 환영합니다!</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">워크스페이스</h2>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            새 워크스페이스
          </Button>
        </div>

        {workspaces && workspaces.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">아직 워크스페이스가 없습니다</p>
              <Button onClick={() => setCreateOpen(true)}>첫 워크스페이스 만들기</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces?.map((workspace) => (
              <Card
                key={workspace.id}
                className="hover-lift cursor-pointer group"
                onClick={() => handleSelectWorkspace(workspace.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{workspace.title}</span>
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="w-3 h-3" />
                        {new Date(workspace.date).toLocaleDateString('ko-KR')}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Users className="w-3 h-3" />
                        {workspace.headcount}명
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(workspace.id, workspace.title);
                    }}
                  >
                    삭제
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
};

export default Workspaces;
