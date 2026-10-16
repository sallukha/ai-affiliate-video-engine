import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Video,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
  Plus,
  ShoppingBag,
  ExternalLink,
  Download,
  Eye,
  Sparkles,
  Zap
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { VideoPlayerModal } from '../components/ui/VideoPlayerModal';
import { EmptyState } from '../components/ui/EmptyState';
import { videoService } from '../services/videoService';
import { productService } from '../services/productService';
import { VideoItem, ProductItem } from '../types';
import { useApp } from '../context/AppContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { dataMode, setSelectedProductForVideo, addToast } = useApp();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [videosRes, productsRes] = await Promise.allSettled([
          videoService.getVideos(),
          productService.getProducts()
        ]);

        if (mounted) {
          if (videosRes.status === 'fulfilled') {
            setVideos(videosRes.value.data);
          }
          if (productsRes.status === 'fulfilled') {
            setProducts(productsRes.value.data);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      mounted = false;
    };
  }, [dataMode]);

  // Statistics calculation
  const totalVideos = videos.length;
  const completedVideos = videos.filter((v) => v.status === 'completed').length;
  const processingVideos = videos.filter((v) => v.status === 'processing').length;
  const failedJobs = videos.filter((v) => v.status === 'failed').length;
  const successRate = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  const recentVideos = videos.slice(0, 5);
  const recentProducts = products.slice(0, 4);

  const handleCreateVideoFromProduct = (product: ProductItem) => {
    setSelectedProductForVideo(product);
    addToast({
      type: 'info',
      title: 'Product Preloaded',
      message: `Loaded details for "${product.name}" into Create Video form.`
    });
    navigate('/create');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Action */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0b132b] p-6 text-white shadow-md sm:p-8">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
              <Zap className="h-3.5 w-3.5" />
              Automated Video Factory
            </div>
            <h2 className="mt-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl lg:text-3xl leading-tight">
              Turn affiliate products into high-conversion vertical reels
            </h2>
            <p className="mt-2 text-xs font-normal text-slate-200 sm:text-sm leading-relaxed max-w-xl">
              Paste any product URL or enter manual specs to generate Gemini hooks, neural voiceovers, and Remotion video renders in under 90 seconds.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-teal-500/25 transition-all hover:bg-teal-400 hover:shadow-teal-400/30 active:scale-98"
            >
              <Plus className="h-4 w-4" />
              Create New Video
            </Link>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Videos"
          value={isLoading ? '-' : totalVideos}
          subtitle="All generated runs"
          icon={Video}
          highlightColor="slate"
        />
        <StatCard
          title="Completed"
          value={isLoading ? '-' : completedVideos}
          subtitle={`${successRate}% pipeline success`}
          icon={CheckCircle2}
          highlightColor="emerald"
          trend={{ value: '12% this week', positive: true }}
        />
        <StatCard
          title="In Queue / Rendering"
          value={isLoading ? '-' : processingVideos}
          subtitle="Active Remotion renders"
          icon={Clock}
          highlightColor="teal"
        />
        <StatCard
          title="Failed Jobs"
          value={isLoading ? '-' : failedJobs}
          subtitle="Requires attention / retry"
          icon={AlertTriangle}
          highlightColor="rose"
        />
      </div>

      {/* Main Split: Recent Video Generations & Activity Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Recent Video Generations (8 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Video Generations</h3>
              <p className="text-xs text-slate-500">Latest automated video outputs and status</p>
            </div>
            <Link
              to="/videos"
              className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              View Library <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : recentVideos.length === 0 ? (
              <EmptyState
                icon={Video}
                title="No videos generated yet"
                description="Start your first video pipeline by submitting a product URL or manual product specifications."
                actionText="Create First Video"
                onAction={() => navigate('/create')}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {recentVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex flex-col gap-3 py-3.5 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between rounded-lg px-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-900 shadow-xs">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-500">
                            <Play className="h-4 w-4" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 py-0.2 text-[9px] font-mono text-white">
                          {video.duration}s
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate text-xs font-semibold text-slate-900">{video.title}</h4>
                          <StatusBadge status={video.status} />
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="truncate">{video.productName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{video.language}</span>
                          <span aria-hidden="true">·</span>
                          <span>{video.aspectRatio}</span>
                          <span aria-hidden="true">·</span>
                          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                      {video.status === 'processing' ? (
                        <Link
                          to={`/videos/progress/${video.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100"
                        >
                          <Clock className="h-3 w-3 animate-spin" />
                          Track Stage ({video.progress}%)
                        </Link>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedVideo(video)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            Preview
                          </button>
                          {video.videoUrl && (
                            <a
                              href={video.videoUrl}
                              download={`video-${video.id}.mp4`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
                              title="Download mp4"
                            >
                              <Download className="h-3.5 w-3.5 text-slate-500" />
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Products (4 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Affiliate Products</h3>
              <p className="text-xs text-slate-500">1-click video generator</p>
            </div>
            <Link
              to="/products"
              className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 transition-colors hover:border-slate-200 hover:bg-white"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <h4 className="truncate text-xs font-semibold text-slate-800">{product.name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>₹{product.price.toLocaleString()}</span>
                      <span aria-hidden="true">·</span>
                      <span>{product.videoCount} videos made</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCreateVideoFromProduct(product)}
                  className="shrink-0 rounded-lg bg-white p-1.5 text-slate-600 shadow-2xs group-hover:bg-teal-50 group-hover:text-teal-700"
                  title="Generate Video from Product"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ))}

            <Link
              to="/products"
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 py-2.5 text-xs font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Add Product to Catalogue
            </Link>
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
};
