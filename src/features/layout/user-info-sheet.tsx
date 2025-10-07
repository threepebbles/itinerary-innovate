import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User as UserIcon, LogOut } from 'lucide-react';
import type { User } from '@/entities/types';

interface UserInfoSheetProps {
  user: User;
  onLogout: () => void;
}

export const UserInfoSheet = ({ user, onLogout }: UserInfoSheetProps) => {
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="사용자 정보">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(user.nickname)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>사용자 정보</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials(user.nickname)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{user.nickname}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const UserInfoButton = ({ user }: { user: User }) => {
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-7 h-7">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          {getInitials(user.nickname)}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">{user.nickname}</span>
    </div>
  );
};
