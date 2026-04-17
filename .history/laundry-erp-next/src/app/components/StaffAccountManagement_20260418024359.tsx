'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/app/auth/AuthProvider';
import { api } from '@/app/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { toast } from 'sonner';

export function StaffAccountManagement() {
  const router = useRouter();
  const { role, shopId } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  if (role !== 'owner') {
    router.push('/');
    return null;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Staff email and password are required');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setSaving(true);
      await api.upsertStaffAccount({ email: email.trim(), password });
      toast.success('Staff account saved for this shop');
      setPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save staff account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Account Management</h1>
        <p className="text-gray-600 mt-1">
          Create or reset the one staff account for your current shop.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shop Staff Login</CardTitle>
          <CardDescription>
            This action creates a staff user if none exists, or updates the existing staff account credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="shopId">Shop ID</Label>
              <Input id="shopId" value={shopId ?? 'No shop assigned'} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staffEmail">Staff Email</Label>
              <Input
                id="staffEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@yourshop.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staffPassword">Staff Password</Label>
              <Input
                id="staffPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Create / Reset Staff Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
