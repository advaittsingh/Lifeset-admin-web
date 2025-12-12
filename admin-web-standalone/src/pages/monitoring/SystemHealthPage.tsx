import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { AlertCircle, CheckCircle2, XCircle, RefreshCw, RotateCcw, Database, Zap, Trash2, Loader2, AlertTriangle, Activity } from 'lucide-react';
import { monitoringApi } from '../../services/api/monitoring';
import { useToast } from '../../contexts/ToastContext';

export default function SystemHealthPage() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionParams, setActionParams] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => monitoringApi.getSystemHealth(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: alerts } = useQuery({
    queryKey: ['system-alerts'],
    queryFn: () => monitoringApi.getAlerts(),
    refetchInterval: 10000,
  });

  const recoveryMutation = useMutation({
    mutationFn: ({ action, params }: { action: string; params?: Record<string, any> }) =>
      monitoringApi.performRecoveryAction(action, params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system-health', 'system-alerts'] });
      showToast(data.message || 'Recovery action completed', 'success');
      setIsActionDialogOpen(false);
      setSelectedAction(null);
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || 'Recovery action failed', 'error');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const recoveryActions = [
    { id: 'restart-queue', label: 'Restart Queue Workers', icon: RefreshCw, description: 'Restart all background job queue workers' },
    { id: 'clear-queue', label: 'Clear Queue', icon: Trash2, description: 'Clear all pending jobs from queues' },
    { id: 'restart-redis', label: 'Restart Redis Connection', icon: RotateCcw, description: 'Reset and reconnect Redis' },
    { id: 'gc', label: 'Force Garbage Collection', icon: Zap, description: 'Force Node.js garbage collection (requires --expose-gc)' },
    { id: 'reconnect-db', label: 'Reconnect Database', icon: Database, description: 'Disconnect and reconnect to PostgreSQL' },
    { id: 'clear-error-logs', label: 'Clear Old Error Logs', icon: Trash2, description: 'Delete error logs older than specified days' },
  ];

  const handleRecoveryAction = (actionId: string) => {
    setSelectedAction(actionId);
    if (actionId === 'clear-error-logs') {
      setActionParams({ olderThanDays: 30 });
    }
    setIsActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (selectedAction) {
      recoveryMutation.mutate({ action: selectedAction, params: actionParams });
    }
  };

  if (healthLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">System Health</h1>
            <p className="text-slate-600 mt-1">Monitor and manage system health status</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['system-health', 'system-alerts'] });
              showToast('Health status refreshed', 'success');
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Overall Status */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Overall System Status</CardTitle>
                <CardDescription>Last checked: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {health?.status && getStatusIcon(health.status)}
                <Badge
                  className={`${getStatusColor(health?.status || 'unknown')} text-white`}
                  variant="default"
                >
                  {health?.status?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {alerts && alerts.count > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-900">
                    {alerts.critical} Critical Alert{alerts.critical !== 1 ? 's' : ''} • {alerts.warnings} Warning{alerts.warnings !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-1">
                  {alerts.alerts.slice(0, 3).map((alert: any, idx: number) => (
                    <div key={idx} className="text-sm text-red-800">
                      • {alert.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Health Checks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {health?.checks && Object.entries(health.checks).map(([key, check]: [string, any]) => (
                <div key={key} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold capitalize">{key}</span>
                    {check.status && getStatusIcon(check.status)}
                  </div>
                  <p className="text-sm text-slate-600">{check.message}</p>
                  {check.latency && (
                    <p className="text-xs text-slate-500 mt-1">Latency: {check.latency}ms</p>
                  )}
                  {check.usagePercent && (
                    <p className="text-xs text-slate-500 mt-1">Usage: {check.usagePercent.toFixed(1)}%</p>
                  )}
                  {check.usage && (
                    <p className="text-xs text-slate-500 mt-1">Usage: {check.usage.toFixed(1)}%</p>
                  )}
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {health?.recommendations && health.recommendations.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Recommendations</h3>
                <ul className="space-y-1">
                  {health.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                      <span>•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recovery Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Recovery Actions</CardTitle>
            <CardDescription>Perform recovery actions to stabilize the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recoveryActions.map((action) => (
                <div
                  key={action.id}
                  className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <action.icon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{action.label}</h3>
                      <p className="text-sm text-slate-600 mb-3">{action.description}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRecoveryAction(action.id)}
                        disabled={recoveryMutation.isPending}
                      >
                        {recoveryMutation.isPending && selectedAction === action.id ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          'Execute'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Confirmation Dialog */}
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Recovery Action</DialogTitle>
              <DialogDescription>
                {selectedAction === 'clear-error-logs' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Delete logs older than (days):
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={actionParams.olderThanDays || 30}
                      onChange={(e) => setActionParams({ olderThanDays: parseInt(e.target.value) || 30 })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                )}
                {selectedAction === 'clear-queue' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Queue name (leave empty for all):
                    </label>
                    <input
                      type="text"
                      value={actionParams.queueName || ''}
                      onChange={(e) => setActionParams({ queueName: e.target.value })}
                      placeholder="e.g., email, notification"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                )}
                Are you sure you want to perform this action? This may affect system performance.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmAction}
                disabled={recoveryMutation.isPending}
              >
                {recoveryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  'Confirm'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}





