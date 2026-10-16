import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  ExternalLink,
  Film,
  Sparkles,
  Clock,
  Globe,
  Tag,
  AlertCircle
} from 'lucide-react';
import { VideoItem } from '../../types';
import { StatusBadge } from './StatusBadge';
import { useApp } from '../../context/AppContext';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, isOpen, onClose }) => {
  const { addToast } = useApp();
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedAffiliateUrl, setCopiedAffiliateUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'details' | 'specs'>('script');

  if (!isOpen || !video) return null;

  const handleCopyScript = () => {
    if (video.script?.fullScript) {
      navigator.clipboard.writeText(video.script.fullScript);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
      addToast({ type: 'success', title: 'Script Copied', message: 'Full voiceover script copied to clipboard.' });
    }
  };

  const handleCopyAffiliate = () => {
    if (video.affiliateUrl) {
      navigator.clipboard.writeText(video.affiliateUrl);
      setCopiedAffiliateUrl(true);
      setTimeout(() => setCopiedAffiliateUrl(false), 2000);
      addToast({ type: 'success', title: 'Affiliate URL Copied', message: 'Tracking link copied to clipboard.' });
    }
  };

  const isVertical = video.aspectRatio === '9:16';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">{video.title}</h2>
              <StatusBadge status={video.status} />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{video.productName}</span>
              <span aria-hidden="true">·</span>
              <span>{video.language}</span>
              <span aria-hidden="true">·</span>
              <span>{video.duration}s</span>
              <span aria-hidden="true">·</span>
              <span>{video.aspectRatio}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Grid: Left Video Player / Right Tabs & Metadata */}
        <div className="grid flex-1 overflow-y-auto md:grid-cols-12">
          {/* Player Column */}
          <div className="flex flex-col items-center justify-center bg-slate-950 p-6 md:col-span-6 lg:col-span-5">
            <div
              className={`relative overflow-hidden rounded-xl bg-slate-900 shadow-lg ${
                isVertical ? 'aspect-9/16 max-h-[460px] w-full max-w-[270px]' : 'aspect-16/9 w-full'
              }`}
            >
              {video.videoUrl ? (
                <video
                  src={video.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full object-contain"
                  poster={video.thumbnailUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-slate-400">
                  <Film className="h-10 w-10 text-slate-600 mb-2" />
                  <p className="text-xs font-medium">Video rendering in progress</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Preview will be available once the Remotion pipeline finishes.
                  </p>
                </div>
              )}
            </div>

            {/* Direct Download Action */}
            <div className="mt-4 w-full">
              {video.videoUrl ? (
                <a
                  href={video.videoUrl}
                  download={`affiliate-video-${video.id}.mp4`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700"
                >
                  <Download className="h-4 w-4" /> Download Video File (.mp4)
                </a>
              ) : (
                <button
                  disabled
                  className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-400"
                >
                  <Download className="h-4 w-4" /> Download Unavailable (Rendering)
                </button>
              )}
            </div>
          </div>

          {/* Details & Script Column */}
          <div className="flex flex-col border-t border-slate-200 p-6 md:col-span-6 md:border-t-0 md:border-l lg:col-span-7">
            {/* Tab navigation */}
            <div className="flex items-center gap-1 border-b border-slate-200 pb-3">
              <button
                onClick={() => setActiveTab('script')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === 'script' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                AI Generated Script
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === 'details' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Product & Affiliate
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === 'specs' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Pipeline Technical Specs
              </button>
            </div>

            {/* Tab: AI Script */}
            {activeTab === 'script' && (
              <div className="mt-4 flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                    Gemini High-Conversion Reel Script
                  </span>
                  <button
                    onClick={handleCopyScript}
                    className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {copiedScript ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {copiedScript ? 'Copied' : 'Copy Script'}
                  </button>
                </div>

                {video.script ? (
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-3.5">
                      <div className="font-bold text-teal-800 text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                        01. The Hook (0 - 3s)
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed italic">"{video.script.hook}"</p>
                    </div>

                    <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3.5">
                      <div className="font-bold text-amber-800 text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        02. The Pain Point (3 - 10s)
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed">"{video.script.problem}"</p>
                    </div>

                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5">
                      <div className="font-bold text-indigo-800 text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        03. Product Solution & Benefits (10 - 24s)
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed">"{video.script.solution}"</p>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5">
                      <div className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        04. Call to Action (24 - 30s)
                      </div>
                      <p className="text-slate-900 font-semibold leading-relaxed">"{video.script.callToAction}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No structured script stored for this video job.
                  </div>
                )}
              </div>
            )}

            {/* Tab: Product Details & Affiliate Link */}
            {activeTab === 'details' && (
              <div className="mt-4 flex-1 space-y-4 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="font-medium text-slate-900 text-sm">{video.productName}</div>
                  <div className="mt-2 flex items-center gap-4 text-slate-600">
                    <span>
                      Price:{' '}
                      <strong className="text-slate-900 font-semibold">
                        {video.currency === 'INR' ? '₹' : '$'}
                        {video.price?.toLocaleString()}
                      </strong>
                    </span>
                    <span>Tone: <strong>{video.tone}</strong></span>
                    <span>Language: <strong>{video.language}</strong></span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Affiliate Tracking Destination
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={video.affiliateUrl || video.productUrl || 'N/A'}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 select-all"
                    />
                    <button
                      onClick={handleCopyAffiliate}
                      className="shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                      title="Copy Affiliate Link"
                    >
                      {copiedAffiliateUrl ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                    {video.affiliateUrl && (
                      <a
                        href={video.affiliateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                        title="Open Link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {video.errorMessage && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-rose-800">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <AlertCircle className="h-4 w-4" /> Error Details
                    </div>
                    <div className="mt-1 text-xs">{video.errorMessage}</div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Technical Specs */}
            {activeTab === 'specs' && (
              <div className="mt-4 flex-1 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[11px] text-slate-500">Render Pipeline</span>
                    <p className="mt-0.5 font-semibold text-slate-800">{video.renderEngine || 'Remotion 4.0 + FFmpeg'}</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[11px] text-slate-500">Aspect Ratio & Resolution</span>
                    <p className="mt-0.5 font-semibold text-slate-800">
                      {video.aspectRatio === '9:16' ? '1080 x 1920 (9:16 Vertical)' : '1920 x 1080 (16:9 Landscape)'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[11px] text-slate-500">Workflow ID</span>
                    <p className="mt-0.5 font-mono text-slate-800">{video.workflowId || 'wf-' + video.id}</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[11px] text-slate-500">File Size</span>
                    <p className="mt-0.5 font-semibold text-slate-800">{video.fileSizeMb ? `${video.fileSizeMb} MB` : '12.4 MB'}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[11px] text-slate-500">Timestamp</span>
                  <div className="mt-1 flex items-center justify-between text-slate-700">
                    <span>Created: {new Date(video.createdAt).toLocaleString()}</span>
                    {video.completedAt && (
                      <span>Finished: {new Date(video.completedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
