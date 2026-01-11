import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Bell, Shield, Palette, LogOut, Loader2, Trash2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Settings() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    newReleases: true,
    weeklyDigest: false,
    profilePublic: true,
    showFavorites: true,
  });

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Layout>
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="h-10 w-10 text-gold" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold">
              <span className="text-gold-gradient">Settings</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Manage your account preferences and privacy settings.
          </p>
        </div>
      </section>

      {/* Settings Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Notifications */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="h-5 w-5 text-gold" />
                <h2 className="font-serif text-xl font-semibold">Notifications</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email updates about your activity</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-releases" className="font-medium">New Releases</Label>
                    <p className="text-sm text-muted-foreground">Get notified when your favorite celebrities have new films</p>
                  </div>
                  <Switch
                    id="new-releases"
                    checked={settings.newReleases}
                    onCheckedChange={(checked) => setSettings({ ...settings, newReleases: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-digest" className="font-medium">Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">Receive a weekly summary of trending content</p>
                  </div>
                  <Switch
                    id="weekly-digest"
                    checked={settings.weeklyDigest}
                    onCheckedChange={(checked) => setSettings({ ...settings, weeklyDigest: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-5 w-5 text-gold" />
                <h2 className="font-serif text-xl font-semibold">Privacy</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profile-public" className="font-medium">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
                  </div>
                  <Switch
                    id="profile-public"
                    checked={settings.profilePublic}
                    onCheckedChange={(checked) => setSettings({ ...settings, profilePublic: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-favorites" className="font-medium">Show Favorites</Label>
                    <p className="text-sm text-muted-foreground">Display your favorite celebrities and films publicly</p>
                  </div>
                  <Switch
                    id="show-favorites"
                    checked={settings.showFavorites}
                    onCheckedChange={(checked) => setSettings({ ...settings, showFavorites: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="h-5 w-5 text-gold" />
                <h2 className="font-serif text-xl font-semibold">Appearance</h2>
              </div>

              <p className="text-muted-foreground">
                CelebyFilm is designed with a beautiful dark cinematic theme to enhance your browsing experience.
              </p>
            </div>

            {/* Account Actions */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Account</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data including favorites and comments.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => toast.info('Account deletion is handled by support')}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
