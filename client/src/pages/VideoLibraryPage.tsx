import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Film,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Plus
} from 'lucide-react';
import { videoService } from '../services/videoService';
import { VideoItem, VideoStatus } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { VideoPlayerModal } from '../components/ui/VideoPlayerModal';
import { EmptyState } from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';

export const VideoLibraryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { dataMode } = useApp();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // Filters & Search
  const queryParam = searchParams.get('q') || '';
  const [search, setSearch] = useState(queryParam);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [aspectFilter, setAspectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    let mounted = true;
    const loadVideos = async () => {
      setIsLoading(true);
      try {
        const { data } = await videoService.getVideos();
        if (mounted) setVideos(data);
      } catch (err) {
        console.error('Failed to load videos:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadVideos();
    return () => {
      mounted = false;
    };
  }, [dataMode]);

  // Sync search param
  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (val) {
      searchParams.set('q', val);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  // Filtered and sorted videos
  const filteredVideos = useMemo(() => {
    return videos
      .filter((v) => {
        const matchesSearch =
          !search ||
          v.title.toLowerCase().includes(search.toLowerCase()) ||
          v.productName.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' || v.status.toLowerCase() === statusFilter.toLowerCase();

        const matchesAspect =
          aspectFilter === 'all' || v.aspectRatio === aspectFilter;

        return matchesSearch && matchesStatus && matchesAspect;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [videos, search, statusFilter, aspectFilter, sortBy]);

  const displayedVideos = filteredVideos.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Generated Video Library</h2>
          <p className="mt-1 text-xs text-slate-500">
            Browse, preview, and download Remotion rendered affiliate marketing videos.
          </p>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" /> Create New Video
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by title, product..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>

          {/* Ratio selector */}
          <select
            value={aspectFilter}
            onChange={(e) => setAspectFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none"
          >
            <option value="all">All Aspect Ratios</option>
            <option value="9:16">9:16 (Vertical Reels)</option>
            <option value="16:9">16:9 (Landscape)</option>
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>
      </div>

      {/* Video Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : displayedVideos.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No videos match your criteria"
          description="Try adjusting your search query, status filters, or generate a new video."
          actionText="Clear Filters"
          onAction={() => {
            setSearch('');
            setStatusFilter('all');
            setAspectFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayedVideos.map((video) => {
            const isVertical = video.aspectRatio === '9:16';

            return (
              <div
                key={video.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
              >
                {/* Thumbnail / Preview Area */}
                <div
                  className="relative flex aspect-16/9 w-full cursor-pointer items-center justify-center overflow-hidden bg-slate-950"
                  onClick={() => setSelectedVideo(video)}
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-500">
                      <Film className="h-8 w-8" />
                    </div>
                  )}

                  {/* Play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-500 text-slate-950 shadow-lg">
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Badges on poster */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                      {video.aspectRatio}
                    </span>
                    <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                      {video.language}
                    </span>
                  </div>

                  <div className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-mono text-white">
                    {video.duration}s
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center justify-between pb-1">
                    <span className="truncate text-xs font-medium text-slate-500">
                      {video.productName}
                    </span>
                    <StatusBadge status={video.status} />
                  </div>

                  <h3
                    className="line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors cursor-pointer leading-snug"
                    onClick={() => setSelectedVideo(video)}
                  >
                    {video.title}
                  </h3>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    <span>{video.price ? `₹${video.price.toLocaleString()}` : ''}</span>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    {video.status === 'processing' ? (
                      <Link
                        to={`/videos/progress/${video.id}`}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-50 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                      >
                        <Clock className="h-3 w-3 animate-spin" />
                        In Progress ({video.progress}%)
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedVideo(video)}
                          className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                        >
                          <Eye className="h-3.5 w-3.5" /> Details
                        </button>

                        <div className="flex items-center gap-2">
                          {video.videoUrl ? (
                            <a
                              href={video.videoUrl}
                              download={`video-${video.id}.mp4`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
                              title="Download mp4"
                            >
                              <Download className="h-3 w-3" /> Download
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400">No download</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {filteredVideos.length > visibleCount && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            Load More Videos ({filteredVideos.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Video Preview & Details Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
};
