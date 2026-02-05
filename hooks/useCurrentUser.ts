import { useEffect, useState } from 'react';
import { getMe } from '@/lib/api';
import { getSession } from '@/lib/auth';

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getSession();
    if (!token) {
      setLoading(false);
      return;
    }

    getMe(token)
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
