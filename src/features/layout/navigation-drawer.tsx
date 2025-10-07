import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, Calendar, Users } from 'lucide-react';
import type { Workspace } from '@/entities/types';

interface NavigationDrawerProps {
  workspaces: Workspace[];
  currentWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  userInfoButton: React.ReactNode;
}

export const NavigationDrawer = ({
  workspaces,
  currentWorkspaceId,
  onSelectWorkspace,
  userInfoButton,
}: NavigationDrawerProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle>워크스페이스</SheetTitle>
            {userInfoButton}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {workspaces.map((workspace) => {
              const isActive = workspace.id === currentWorkspaceId;
              return (
                <button
                  key={workspace.id}
                  onClick={() => onSelectWorkspace(workspace.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isActive
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card border-border/50 hover:bg-accent'
                  }`}
                >
                  <h4 className="font-semibold text-sm mb-2 truncate">
                    {workspace.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(workspace.date).toLocaleDateString('ko-KR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {workspace.headcount}명
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
