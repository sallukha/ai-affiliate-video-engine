import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { AnalyticsOverview } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState } from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';

const COLORS = ['#0d9488', '#0284c7', '#6366f1', '#f59e0b', '#ec4899'];

export const AnalyticsPage: React.FC = () => {
  const { dataMode } = useApp();

  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await analyticsService.getOverview();
        if (mounted) {
          setAnalytics(res.data);
          setIsUnavailable(!!res.isUnavailable);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadAnalytics();
    return () => {
      mounted = false;
    };
  }, [dataMode]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Clock className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (isUnavailable) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Analytics & Performance</h2>
          <p className="mt-1 text-xs text-slate-500">Video generation throughput and pipeline latency benchmarks.</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold">Backend Endpoint Not Implemented: GET /analytics/overview</h3>
              <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                The connected backend at your configured URL does not currently implement an analytics aggregation endpoint.
                To view simulated charts and production benchmark layouts, switch to <strong>Demo Sandbox</strong> mode in the top right header.
              </p>
            </div>
          </div>
        </div>

        <EmptyState
          icon={BarChart3}
          title="No Analytics Data Available"
          description="Once your backend implements GET /analytics/overview, live generation throughput charts will render here automatically."
        />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Production Analytics</h2>
            {dataMode === 'demo' && (
              <span className="rounded bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 border border-teal-200">
                Demo Benchmark Mode
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Pipeline throughput, generation latency per stage, and top converting affiliate products.
          </p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Runs"
          value={analytics.totalVideos}
          subtitle="All time pipeline executions"
          icon={TrendingUp}
          highlightColor="slate"
        />
        <StatCard
          title="Success Rate"
          value={`${analytics.successRate}%`}
          subtitle={`${analytics.completedVideos} completed / ${analytics.failedJobs} failed`}
          icon={CheckCircle2}
          highlightColor="emerald"
        />
        <StatCard
          title="Avg Render Duration"
          value={`${analytics.averageProcessingTimeSec}s`}
          subtitle="End-to-end turnaround"
          icon={Clock}
          highlightColor="teal"
        />
        <StatCard
          title="Top Language"
          value={analytics.languageDistribution[0]?.name || 'Hinglish'}
          subtitle={`${analytics.languageDistribution[0]?.count || 0} reels created`}
          icon={Sparkles}
          highlightColor="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Activity Timeline Area Chart (8 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Daily Video Generation Volume</h3>
              <p className="text-xs text-slate-500">Successful renders vs failed jobs over past 7 days</p>
            </div>
          </div>

          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.activityTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="completed" name="Completed Videos" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                <Area type="monotone" dataKey="failed" name="Failed Jobs" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorFailed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aspect Ratio & Formats Donut Chart (4 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">Format Distribution</h3>
            <p className="text-xs text-slate-500">Vertical Shorts vs Landscape</p>
          </div>

          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.ratioDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {analytics.ratioDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Stage Processing Latency Breakdown (6 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">Pipeline Latency by Stage</h3>
            <p className="text-xs text-slate-500">Average execution seconds spent in each component</p>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.stageDurations} layout="vertical" margin={{ top: 10, right: 20, left: 35, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`${value} seconds`, 'Avg Duration']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="avgSeconds" fill="#0d9488" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Products (6 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">Most Produced Products</h3>
            <p className="text-xs text-slate-500">Products with highest affiliate reel generation count</p>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {analytics.topProducts.map((prod, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-600">
                    {idx + 1}
                  </span>
                  <span className="truncate font-medium text-slate-800">{prod.name}</span>
                </div>
                <span className="font-semibold text-teal-700 whitespace-nowrap">
                  {prod.videoCount} reels
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
