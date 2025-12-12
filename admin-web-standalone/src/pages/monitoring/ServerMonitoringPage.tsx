import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Loader2, Server, Cpu, HardDrive, Activity, Database, RefreshCw, Trash2, Zap } from 'lucide-react';
import { monitoringApi } from '../../services/api/monitoring';
import { useToast } from '../../contexts/ToastContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ServerMonitoringPage() {
  const [isClearCacheDialogOpen, setIsClearCacheDialogOpen] = useState(false);
  const [cachePattern, setCachePattern] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: serverMetrics, isLoading: serverLoading } = useQuery({
    queryKey: ['server-metrics'],
    queryFn: () => monitoringApi.getServerMetrics(),
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const { data: apiLatency, isLoading: latencyLoading } = useQuery({
    queryKey: ['api-latency'],
    queryFn: () => monitoringApi.getApiLatency(),
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const { data: redisStats, isLoading: redisLoading } = useQuery({
    queryKey: ['redis-stats'],
    queryFn: () => monitoringApi.getRedisStats(),
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const { data: dbPerformance, isLoading: dbLoading } = useQuery({
    queryKey: ['db-performance'],
    queryFn: () => monitoringApi.getDbPerformance(),
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const { data: queueStats, isLoading: queueLoading } = useQuery({
    queryKey: ['queue-stats'],
    queryFn: () => monitoringApi.getQueueStats(),
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const { data: cacheStats } = useQuery({
    queryKey: ['cache-stats'],
    queryFn: () => monitoringApi.getCacheStats(),
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const clearCacheMutation = useMutation({
    mutationFn: (pattern?: string) => monitoringApi.clearCache(pattern),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cache-stats', 'redis-stats'] });
      const message = data?.message || data?.data?.message || 'Cache cleared successfully';
      showToast(message, 'success');
      setIsClearCacheDialogOpen(false);
      setCachePattern('');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error?.message || 
                          error?.message || 
                          'Failed to clear cache';
      showToast(errorMessage, 'error');
      console.error('Clear cache error:', error);
    },
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isLoading = serverLoading || latencyLoading || redisLoading || dbLoading || queueLoading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Server Monitoring</h1>
            <p className="text-slate-600 mt-1">Monitor server health and performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
            >
              <Activity className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['server-metrics', 'api-latency', 'redis-stats', 'db-performance', 'queue-stats'] });
                showToast('Metrics refreshed', 'success');
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setIsClearCacheDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cache
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Server Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">CPU Usage</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {serverMetrics?.cpu?.usage?.toFixed(1) || 0}%
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {serverMetrics?.cpu?.cores || 0} cores
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Cpu className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Memory Usage</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {serverMetrics?.memory?.percent?.toFixed(1) || 0}%
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatBytes(serverMetrics?.memory?.used || 0)} / {formatBytes(serverMetrics?.memory?.total || 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Server className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Uptime</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {serverMetrics?.uptime?.formatted || '0d 0h 0m'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {Math.floor((serverMetrics?.uptime?.seconds || 0) / 86400)} days
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Activity className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">API Latency</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {apiLatency?.average?.toFixed(0) || 0}ms
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        P95: {apiLatency?.p95 || 0}ms
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Zap className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Redis Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Redis Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {redisStats?.connected ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <p className="text-lg font-semibold text-green-600">Connected</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Keys</p>
                      <p className="text-lg font-semibold">{redisStats.keys || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Memory Used</p>
                      <p className="text-lg font-semibold">{formatBytes(redisStats.memory?.used || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Hit Rate</p>
                      <p className="text-lg font-semibold">{redisStats.hitRate?.toFixed(1) || 0}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-red-600">
                    Redis not connected: {redisStats?.error || 'Unknown error'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* DB Performance */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Database Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Query Time</p>
                    <p className="text-lg font-semibold">{dbPerformance?.queryTime || 0}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Active Connections</p>
                    <p className="text-lg font-semibold">{dbPerformance?.connections?.active || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Idle Connections</p>
                    <p className="text-lg font-semibold">{dbPerformance?.connections?.idle || 0}</p>
                  </div>
                </div>
                {dbPerformance?.tableSizes && dbPerformance.tableSizes.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">Top Tables by Size</p>
                    <div className="space-y-2">
                      {dbPerformance.tableSizes.slice(0, 5).map((table: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                          <span className="text-sm">{table.tablename}</span>
                          <span className="text-sm font-semibold">{table.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Queue Processing */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Queue Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Active</p>
                    <p className="text-lg font-semibold">{queueStats?.active || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Waiting</p>
                    <p className="text-lg font-semibold">{queueStats?.waiting || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Completed</p>
                    <p className="text-lg font-semibold text-green-600">{queueStats?.completed || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Failed</p>
                    <p className="text-lg font-semibold text-red-600">{queueStats?.failed || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Delayed</p>
                    <p className="text-lg font-semibold">{queueStats?.delayed || 0}</p>
                  </div>
                </div>
                {queueStats?.jobs && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">Job Queues</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(queueStats.jobs).map(([name, stats]: [string, any]) => (
                        <div key={name} className="p-3 bg-slate-50 rounded">
                          <p className="text-xs font-semibold mb-1 capitalize">{name}</p>
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span>Active:</span>
                              <span className="font-semibold">{stats.active || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Completed:</span>
                              <span className="font-semibold text-green-600">{stats.completed || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Failed:</span>
                              <span className="font-semibold text-red-600">{stats.failed || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cache Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Cache Statistics</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsClearCacheDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Cache
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Total Keys</p>
                    <p className="text-lg font-semibold">{cacheStats?.totalKeys || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Memory Used</p>
                    <p className="text-lg font-semibold">
                      {formatBytes(cacheStats?.memory?.memory?.used || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Hit Rate</p>
                    <p className="text-lg font-semibold">
                      {cacheStats?.memory?.hitRate?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Clear Cache Dialog */}
        <Dialog open={isClearCacheDialogOpen} onOpenChange={setIsClearCacheDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear Cache</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Pattern (optional - leave empty to clear all)
                </label>
                <Input
                  value={cachePattern}
                  onChange={(e) => setCachePattern(e.target.value)}
                  placeholder="e.g., user:* or session:*"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Use patterns like "user:*" to clear specific cache keys. Leave empty to clear all cache.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsClearCacheDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => clearCacheMutation.mutate(cachePattern || undefined)}
                disabled={clearCacheMutation.isPending}
              >
                {clearCacheMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Cache
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

