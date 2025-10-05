import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { registerUser } from '@/mock/edge-functions/auth';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { user, error } = await registerUser({ email, password, nickname });

    if (error || !user) {
      toast.error(error || '회원가입에 실패했습니다.');
      setLoading(false);
      return;
    }

    toast.success('회원가입 성공! 로그인해주세요.');
    navigate('/auth?tab=login');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nickname">닉네임</Label>
        <Input
          id="nickname"
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">이메일</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">비밀번호</Label>
        <Input
          id="register-password"
          type="password"
          placeholder="••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <p className="text-xs text-muted-foreground">최소 6자 이상</p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '가입 중...' : '회원가입'}
      </Button>
    </form>
  );
};
