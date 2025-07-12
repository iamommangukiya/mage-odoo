import { useRouter } from 'next/router';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useFirebaseUser();
  const router = useRouter();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    if (typeof window !== 'undefined') {
      router.replace('/login');
    }
    return null;
  }

  return <>{children}</>;
} 