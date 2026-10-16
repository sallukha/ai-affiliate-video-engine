import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  XCircle,
  ArrowLeft,
  Film,
  Download,
  Eye,
  Sparkles,
  Terminal,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { videoService } from '../services/videoService';
import { workflowService } from '../services/workflowService';
import { VideoItem, WorkflowRun, VideoStage } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { VideoPlayerModal } from '../components/ui/VideoPlayerModal';
import { useApp } from '../context/AppContext';

interface StageDefinition {
  id: VideoStage;
  name: string;
  description: string;
}

const STAGES: StageDefinition[] = [
  {
    id: 'validating',
    name: '1. Validating Product Information',
    description: 'Verifying product parameters, affiliate URL, and downloading image assets'
  },
  {
    id: 'scripting',
    name: '2. Generating AI Script',
    description: 'Using Gemini model to write high-converting hook, pain point, and call-to-action'
  },
  {
    id: 'voiceover',
    name: '3. Generating Voiceover',
    description: 'Synthesizing neural audio speech with target language cadence and pronunciation'
  },
  {
    id: 'rendering',
    name: '4. Rendering Video',
    description: 'Executing Remotion composition with animated typography and transition keyframes'
  },
  {
    id: 'saving',
    name: '5. Saving Final Output',
    description: 'FFmpeg stream muxing, audio normalization, faststart encoding, and saving output'
  }
];

export const VideoProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dataMode, addToast } = useApp();

  const [video, setVideo] = useState<VideoItem | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeStageLogs, setActiveStageLogs] = useState<string[]>([]);

  const isTerminal = video?.status === 'completed' || video?.status === 'failed' || video?.status === 'cancelled';

  // Load video and poll status if in progress
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;
    let cleanupSimulator: (() => void) | null = null;

    const fetchStatus = async () => {
      try {
        const { data: videoData, isDemo } = await videoService.getVideoById(id);
        if (!isMounted) return;
        setVideo(videoData);

        // Fetch workflow run if available
        try {
          const wfRes = await workflowService.getWorkflowById(videoData.workflowId || id);
          if (isMounted) setWorkflow(wfRes.data);
        } catch {
          // Workflow run might not be created yet
        }

        // If in Demo mode and job is processing, run demo progress simulation
        if (isDemo && videoData.status === 'processing' && !cleanupSimulator) {
          cleanupSimulator = videoService.simulateDemoProgress(
            id,
            (updatedVideo, desc, pct) => {
              if (isMounted) {
                setVideo({ ...updatedVideo });
                setActiveStageLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${desc}`]);
              }
            },
            (completedVideo) => {
              if (isMounted) {
                setVideo({ ...completedVideo });
                addToast({
                  type: 'success',
                  title: 'Render Complete',
                  message: 'Video has been rendered successfully and is ready to preview.'
                });
              }
            },
            (errorMsg) => {
              if (isMounted) {
                addToast({ type: 'error', title: 'Pipeline Failed', message: errorMsg });
              }
            }
          );
        }
      } catch (err: unknown) {
        console.error('Failed to fetch video status:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStatus();

    // Start polling if in Live mode and not terminal
    if (dataMode === 'live') {
      pollInterval = setInterval(async () => {
        if (isTerminal) {
          if (pollInterval) clearInterval(pollInterval);
          return;
        }
        await fetchStatus();
      }, 3000);
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (cleanupSimulator) cleanupSimulator();
    };
  }, [id, dataMode, isTerminal]);

  const handleRetry = async () => {
    if (!id) return;
    setIsRetrying(true);
    try {
      const { data } = await videoService.retryVideo(id);
      setVideo(data);
      addToast({
        type: 'info',
        title: 'Job Retried',
        message: 'Pipeline restart queued from the last failed stage.'
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Retry failed';
      addToast({ type: 'error', title: 'Retry Failed', message: msg });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setIsCancelling(true);
    try {
      const { data } = await videoService.cancelVideo(id);
      setVideo(data);
      addToast({
        type: 'warning',
        title: 'Job Cancelled',
        message: 'Video generation pipeline was stopped.'
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cancellation failed';
      addToast({ type: 'error', title: 'Cancel Failed', message: msg });
    } finally {
      setIsCancelling(false);
    }
  };

  const getStageStatus = (stageId: VideoStage) => {
    if (!video) return 'pending';

    const stageOrder: VideoStage[] = ['validating', 'scripting', 'voiceover', 'rendering', 'saving'];
    const currentIndex = stageOrder.indexOf(video.currentStage || 'validating');
    const stageIndex = stageOrder.indexOf(stageId);

    if (video.status === 'completed') {
      return 'completed';
    }

    if (video.status === 'failed') {
      if (stageIndex < currentIndex) return 'completed';
      if (stageIndex === currentIndex) return 'failed';
      return 'pending';
    }

    if (video.status === 'cancelled') {
      if (stageIndex < currentIndex) return 'completed';
      return 'pending';
    }

    // Processing
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'processing';
    return 'pending';
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <Clock className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-xs text-slate-500">Connecting to pipeline engine...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
        <h3 className="mt-3 text-base font-semibold text-slate-900">Job Not Found</h3>
        <p className="mt-1 text-xs text-slate-500">Could not locate video job with ID: {id}</p>
        <button
          onClick={() => navigate('/videos')}
          className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Return to Video Library
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Navigation & Status */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/videos')}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Back to videos"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{video.title}</h2>
              <StatusBadge status={video.status} />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Job ID: {video.id}</span>
              <span aria-hidden="true">·</span>
              <span>{video.language}</span>
              <span aria-hidden="true">·</span>
              <span>{video.aspectRatio}</span>
              <span aria-hidden="true">·</span>
              <span>{video.duration}s</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {video.status === 'processing' && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <XCircle className="h-3.5 w-3.5 text-slate-400" />
              Cancel Job
            </button>
          )}

          {video.status === 'failed' && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              Retry Failed Pipeline
            </button>
          )}

          {video.status === 'completed' && (
            <>
              <button
                onClick={() => setPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700"
              >
                <Eye className="h-3.5 w-3.5" /> Preview Video
              </button>
              {video.videoUrl && (
                <a
                  href={video.videoUrl}
                  download={`video-${video.id}.mp4`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
              )}
            </>
          )}

          <Link
            to="/workflows"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Workflow Logs <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Progress Bar Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              {video.status === 'completed'
                ? 'Generation Complete'
                : video.status === 'failed'
                ? 'Generation Failed'
                : 'Pipeline Executing...'}
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-slate-900">{video.progress}%</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              video.status === 'completed'
                ? 'bg-emerald-500'
                : video.status === 'failed'
                ? 'bg-rose-500'
                : 'bg-teal-500'
            }`}
            style={{ width: `${video.progress}%` }}
          />
        </div>

        {video.errorMessage && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              Pipeline Interrupted:
            </div>
            <p className="mt-1 text-rose-700">{video.errorMessage}</p>
          </div>
        )}
      </div>

      {/* 5 Dedicated Pipeline Stages */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Stage-by-Stage Pipeline Execution
        </h3>

        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-xs">
          {STAGES.map((stage, idx) => {
            const status = getStageStatus(stage.id);

            return (
              <div key={stage.id} className="p-5 transition-colors hover:bg-slate-50/50">
                <div className="flex items-start gap-4">
                  {/* Status Indicator Icon */}
                  <div className="shrink-0 pt-0.5">
                    {status === 'completed' ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    ) : status === 'processing' ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-600 animate-pulse">
                        <Clock className="h-4 w-4" />
                      </div>
                    ) : status === 'failed' ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <span className="text-xs font-mono font-bold">{idx + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Stage Text & Description */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{stage.name}</h4>
                      <StatusBadge status={status} />
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-slate-500 leading-normal">{stage.description}</p>

                    {/* Stage Details / Logs Preview */}
                    {status === 'processing' && (
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-teal-700 font-medium bg-teal-50/80 rounded-lg p-2.5">
                        <Clock className="h-3.5 w-3.5 animate-spin" />
                        <span>Remotion / Gemini engine currently executing this step...</span>
                      </div>
                    )}

                    {status === 'failed' && video.errorMessage && (
                      <div className="mt-2 text-xs text-rose-700 bg-rose-50 rounded-lg p-2.5">
                        {video.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Preview Modal */}
      <VideoPlayerModal
        video={video}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
};
