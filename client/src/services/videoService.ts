import { apiClient, getDataMode, resolveBackendAssetUrl } from './api';
import { VideoItem, CreateVideoFormData, WorkflowRun } from '../types';
import { INITIAL_VIDEOS, INITIAL_WORKFLOWS } from '../utils/mockData';

// In-memory demo state for interactive simulation when backend is offline or in demo mode
let localVideos: VideoItem[] = [...INITIAL_VIDEOS];
let localWorkflows: WorkflowRun[] = [...INITIAL_WORKFLOWS];

const normalizeVideo = (video: VideoItem): VideoItem => ({
  ...video,
  thumbnailUrl: resolveBackendAssetUrl(video.thumbnailUrl),
  videoUrl: resolveBackendAssetUrl(video.videoUrl)
});

const normalizeVideos = (videos: VideoItem[]): VideoItem[] => videos.map(normalizeVideo);

export const videoService = {
  /**
   * Fetch all generated videos
   */
  async getVideos(): Promise<{ data: VideoItem[]; isDemo: boolean }> {
    const mode = getDataMode();
    if (mode === 'live') {
      try {
        const response = await apiClient.get<VideoItem[]>('/videos');
        return { data: normalizeVideos(response.data), isDemo: false };
      } catch (err) {
        console.warn('Backend GET /videos failed. Falling back to local state:', err);
        throw err;
      }
    }
    return { data: normalizeVideos(localVideos), isDemo: true };
  },

  /**
   * Fetch a single video by ID
   */
  async getVideoById(id: string): Promise<{ data: VideoItem; isDemo: boolean }> {
    const mode = getDataMode();
    if (mode === 'live') {
      try {
        const response = await apiClient.get<VideoItem>(`/videos/${id}`);
        return { data: normalizeVideo(response.data), isDemo: false };
      } catch (err) {
        console.warn(`Backend GET /videos/${id} failed:`, err);
        throw err;
      }
    }

    const found = localVideos.find((v) => v.id === id);
    if (!found) {
      throw new Error(`Video with ID ${id} not found.`);
    }
    return { data: normalizeVideo(found), isDemo: true };
  },

  /**
   * Trigger creation of a new video with Remotion & Gemini pipeline
   */
  async createVideo(formData: CreateVideoFormData): Promise<{ data: VideoItem; workflowId: string; isDemo: boolean }> {
    const mode = getDataMode();

    // Prepare API payload
    const payload = {
      inputMethod: formData.inputMethod,
      productUrl: formData.inputMethod === 'url' ? formData.productUrl : undefined,
      productDetails: formData.inputMethod === 'manual' ? {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        currency: formData.currency || 'INR',
        features: formData.features ? formData.features.split(',').map((f) => f.trim()).filter(Boolean) : [],
        affiliateUrl: formData.affiliateUrl,
        imageUrl: formData.imageUrl
      } : undefined,
      videoConfig: {
        language: formData.language,
        tone: formData.tone,
        duration: formData.duration,
        aspectRatio: formData.aspectRatio,
        customInstructions: formData.customInstructions
      }
    };

    if (mode === 'live') {
      try {
        const response = await apiClient.post<{ video: VideoItem; workflowId?: string }>('/videos', payload);
        const video = response.data.video || (response.data as unknown as VideoItem);
        const workflowId = response.data.workflowId || video.workflowId || `wf-${video.id}`;
        return { data: normalizeVideo(video), workflowId, isDemo: false };
      } catch (err) {
        console.error('Backend POST /videos failed:', err);
        throw err;
      }
    }

    // Interactive Demo Simulation Mode
    const newId = `vid-${Date.now().toString().slice(-4)}`;
    const newWorkflowId = `wf-${newId}`;
    const title = formData.name ? `Promote: ${formData.name}` : `Product Showcase (${formData.productUrl ? new URL(formData.productUrl).hostname : 'Affiliate'})`;

    const newVideo: VideoItem = {
      id: newId,
      title,
      productName: formData.name || 'Featured Product',
      price: formData.price || 1999,
      currency: formData.currency || 'INR',
      affiliateUrl: formData.affiliateUrl || formData.productUrl || 'https://affiliate.example.com/item/demo',
      thumbnailUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      duration: formData.duration,
      aspectRatio: formData.aspectRatio,
      language: formData.language,
      tone: formData.tone,
      status: 'processing',
      currentStage: 'validating',
      progress: 10,
      createdAt: new Date().toISOString(),
      workflowId: newWorkflowId,
      renderEngine: 'Remotion 4.0 + FFmpeg libx264',
      script: {
        hook: `Are you looking for the best ${formData.name || 'product'} in India? Watch this!`,
        problem: 'Most alternatives fail to deliver on quality and battery longevity.',
        solution: `${formData.name || 'This product'} offers industry-leading features at unbeatable value.`,
        callToAction: 'Check the link in bio right now to get an exclusive 25% discount!',
        fullScript: `Are you looking for the ultimate solution? Check out ${formData.name || 'this product'}. With premium build quality and instant performance, it solves everyday headaches. Tap the link below right now!`
      }
    };

    const newWorkflow: WorkflowRun = {
      id: newWorkflowId,
      videoId: newId,
      productName: newVideo.productName,
      status: 'processing',
      currentStage: 'validating',
      startedAt: new Date().toISOString(),
      stages: [
        {
          id: 'validating',
          name: 'Validating product information',
          description: 'Verify product parameters, image asset availability, and affiliate link format',
          status: 'processing',
          startedAt: new Date().toISOString(),
          logs: ['[00:01] Received creation payload', '[00:02] Image verified & cached']
        },
        {
          id: 'scripting',
          name: 'Generating AI script',
          description: 'Generating Hook, Problem, Solution, and CTA optimized for target reel format',
          status: 'pending',
          logs: []
        },
        {
          id: 'voiceover',
          name: 'Generating voiceover',
          description: 'Synthesizing neural speech audio with natural speech cadence',
          status: 'pending',
          logs: []
        },
        {
          id: 'rendering',
          name: 'Rendering video',
          description: 'Executing Remotion composition with animated typography and transitions',
          status: 'pending',
          logs: []
        },
        {
          id: 'saving',
          name: 'Saving final output',
          description: 'FFmpeg multiplexing, audio normalization, and saving final video',
          status: 'pending',
          logs: []
        }
      ]
    };

    localVideos = [newVideo, ...localVideos];
    localWorkflows = [newWorkflow, ...localWorkflows];

    return { data: normalizeVideo(newVideo), workflowId: newWorkflowId, isDemo: true };
  },

  /**
   * Retry a failed video job
   */
  async retryVideo(id: string): Promise<{ data: VideoItem; isDemo: boolean }> {
    const mode = getDataMode();
    if (mode === 'live') {
      try {
        const response = await apiClient.post<VideoItem>(`/videos/${id}/retry`);
        return { data: normalizeVideo(response.data), isDemo: false };
      } catch (err) {
        console.error(`Backend POST /videos/${id}/retry failed:`, err);
        throw err;
      }
    }

    const index = localVideos.findIndex((v) => v.id === id);
    if (index !== -1) {
      localVideos[index] = {
        ...localVideos[index],
        status: 'processing',
        currentStage: 'validating',
        progress: 15,
        errorMessage: undefined
      };
      return { data: normalizeVideo(localVideos[index]), isDemo: true };
    }
    throw new Error('Video not found for retry.');
  },

  /**
   * Cancel an in-progress video job
   */
  async cancelVideo(id: string): Promise<{ data: VideoItem; isDemo: boolean }> {
    const mode = getDataMode();
    if (mode === 'live') {
      try {
        const response = await apiClient.post<VideoItem>(`/videos/${id}/cancel`);
        return { data: normalizeVideo(response.data), isDemo: false };
      } catch (err) {
        console.error(`Backend POST /videos/${id}/cancel failed:`, err);
        throw err;
      }
    }

    const index = localVideos.findIndex((v) => v.id === id);
    if (index !== -1) {
      localVideos[index] = {
        ...localVideos[index],
        status: 'cancelled',
        errorMessage: 'Job cancelled by user request.'
      };
      return { data: normalizeVideo(localVideos[index]), isDemo: true };
    }
    throw new Error('Video not found for cancellation.');
  },

  /**
   * Simulate step-by-step progress for demo mode runs
   */
  simulateDemoProgress(
    videoId: string,
    onProgress: (video: VideoItem, stage: string, percent: number) => void,
    onComplete: (video: VideoItem) => void,
    onError: (errorMsg: string) => void
  ): () => void {
    let currentStep = 0;
    const steps = [
      { stage: 'validating' as const, percent: 20, desc: 'Validating product parameters...' },
      { stage: 'scripting' as const, percent: 40, desc: 'Generating Gemini AI script...' },
      { stage: 'voiceover' as const, percent: 65, desc: 'Synthesizing voiceover track...' },
      { stage: 'rendering' as const, percent: 85, desc: 'Rendering Remotion composition...' },
      { stage: 'saving' as const, percent: 100, desc: 'Muxing FFmpeg stream and saving...' }
    ];

    const timer = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(timer);
        const idx = localVideos.findIndex((v) => v.id === videoId);
        if (idx !== -1) {
          localVideos[idx] = {
            ...localVideos[idx],
            status: 'completed',
            currentStage: 'saving',
            progress: 100,
            completedAt: new Date().toISOString(),
            errorMessage: 'Demo mode does not render an MP4. Switch to Live API mode to play the generated local video.'
          };
          onComplete(normalizeVideo(localVideos[idx]));
        }
        return;
      }

      const step = steps[currentStep];
      const idx = localVideos.findIndex((v) => v.id === videoId);
      if (idx !== -1) {
        localVideos[idx] = {
          ...localVideos[idx],
          currentStage: step.stage,
          progress: step.percent
        };
        onProgress(normalizeVideo(localVideos[idx]), step.desc, step.percent);
      }
      currentStep++;
    }, 2500);

    return () => clearInterval(timer);
  }
};
