import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Shield, Save, Bell, Database, Loader2 } from 'lucide-react';
import { settingsApi, Settings } from '../../services/api/settings';
import { useToast } from '../../contexts/ToastContext';

export default function SettingsPage() {
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 60,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    minLength: 8,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
  });

  const [systemSettings, setSystemSettings] = useState({
    platformName: 'LifeSet Platform',
    maintenanceMode: false,
  });

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
  });

  useEffect(() => {
    if (settings) {
      if (settings.security) setSecuritySettings(prev => ({ ...prev, ...settings.security }));
      if (settings.notifications) setNotificationSettings(prev => ({ ...prev, ...settings.notifications }));
      if (settings.system) setSystemSettings(prev => ({ ...prev, ...settings.system }));
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Settings>) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      showToast('Settings saved successfully', 'success');
    },
    onError: () => showToast('Failed to save settings', 'error'),
  });

  const handleSaveSecurity = () => {
    updateMutation.mutate({
      security: {
        sessionTimeout: securitySettings.sessionTimeout,
        passwordPolicy: {
          requireUppercase: securitySettings.requireUppercase,
          requireNumbers: securitySettings.requireNumbers,
          requireSpecialChars: securitySettings.requireSpecialChars,
          minLength: securitySettings.minLength,
        },
      },
    });
  };

  const handleSaveNotifications = () => {
    updateMutation.mutate({
      notifications: notificationSettings,
    });
  };

  const handleSaveSystem = () => {
    updateMutation.mutate({
      system: systemSettings,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">Manage platform settings and configuration</p>
        </div>

        <div className="grid gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-slate-600" />
                <CardTitle className="text-lg font-semibold">Security Settings</CardTitle>
              </div>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Session Timeout (minutes)</label>
                <Input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) || 60 })}
                  className="max-w-xs"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Password Policy</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={securitySettings.requireUppercase}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, requireUppercase: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-600">Require uppercase letters</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={securitySettings.requireNumbers}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, requireNumbers: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-600">Require numbers</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={securitySettings.requireSpecialChars}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, requireSpecialChars: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-600">Require special characters</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">Minimum length:</label>
                    <Input
                      type="number"
                      value={securitySettings.minLength}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, minLength: parseInt(e.target.value) || 8 })}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={handleSaveSecurity}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Security Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-slate-600" />
                <CardTitle className="text-lg font-semibold">Notification Settings</CardTitle>
              </div>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.email}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, email: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700">Email notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.push}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, push: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700">Push notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.sms}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, sms: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700">SMS notifications</span>
                </label>
              </div>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={handleSaveNotifications}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notification Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-slate-600" />
                <CardTitle className="text-lg font-semibold">System Settings</CardTitle>
              </div>
              <CardDescription>Platform configuration and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Platform Name</label>
                <Input
                  value={systemSettings.platformName}
                  onChange={(e) => setSystemSettings({ ...systemSettings, platformName: e.target.value })}
                  className="max-w-xs"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={systemSettings.maintenanceMode}
                    onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-600">Enable maintenance mode</span>
                </label>
                {systemSettings.maintenanceMode && (
                  <p className="text-xs text-amber-600 mt-2">
                    When enabled, only administrators can access the platform.
                  </p>
                )}
              </div>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={handleSaveSystem}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save System Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
