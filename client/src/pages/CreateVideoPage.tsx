import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sparkles,
  Link2,
  FileEdit,
  Upload,
  X,
  AlertCircle,
  HelpCircle,
  Loader2,
  Languages,
  Clock,
  Ratio,
  Sliders,
  DollarSign,
  Tag,
  CheckCircle2,
  Zap,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { videoService } from '../services/videoService';
import { VideoLanguage, VideoTone, VideoDuration, VideoAspectRatio } from '../types';

export interface VideoFormValues {
  inputMethod: 'url' | 'manual';
  productUrl?: string;
  name?: string;
  description?: string;
  price?: number;
  currency: string;
  features?: string;
  affiliateUrl?: string;
  imageUrl?: string;
  language: VideoLanguage;
  tone: VideoTone;
  duration: VideoDuration;
  aspectRatio: VideoAspectRatio;
  customInstructions?: string;
}

// Validation Schema with Zod
const createVideoSchema = z.object({
  inputMethod: z.enum(['url', 'manual']),
  productUrl: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be greater than 0').optional(),
  currency: z.string().default('INR'),
  features: z.string().optional(),
  affiliateUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  language: z.enum(['Hindi', 'English', 'Hinglish']),
  tone: z.enum(['Professional', 'Informative', 'Energetic', 'Promotional']),
  duration: z.union([z.literal(15), z.literal(30), z.literal(60)]),
  aspectRatio: z.enum(['9:16', '16:9']),
  customInstructions: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.inputMethod === 'url') {
    if (!data.productUrl || data.productUrl.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['productUrl'],
        message: 'Product URL is required when using URL input method'
      });
    } else {
      try {
        new URL(data.productUrl);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['productUrl'],
          message: 'Please provide a valid URL (e.g., https://amazon.in/dp/...)'
        });
      }
    }
  } else {
    // Manual details required
    if (!data.name || data.name.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['name'],
        message: 'Product name must be at least 3 characters long'
      });
    }
    if (!data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['price'],
        message: 'Valid price is required'
      });
    }
    if (!data.affiliateUrl || data.affiliateUrl.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['affiliateUrl'],
        message: 'Affiliate URL is required for user redirection'
      });
    } else {
      try {
        new URL(data.affiliateUrl);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['affiliateUrl'],
          message: 'Affiliate URL must be a valid URL'
        });
      }
    }
  }
});

type FormData = z.infer<typeof createVideoSchema>;

export const CreateVideoPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedProductForVideo, setSelectedProductForVideo, settings, addToast } = useApp();

  const [inputMethod, setInputMethod] = useState<'url' | 'manual'>('manual');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useForm<VideoFormValues>({
    resolver: zodResolver(createVideoSchema) as any,
    defaultValues: {
      inputMethod: 'manual',
      currency: settings.defaultCurrency || 'INR',
      language: settings.defaultLanguage || 'Hinglish',
      tone: settings.defaultTone || 'Energetic',
      duration: settings.defaultDuration || 30,
      aspectRatio: settings.defaultAspectRatio || '9:16',
      customInstructions: ''
    }
  });

  // Pre-fill from selected product if user clicked "Create Video" from Products or Dashboard
  useEffect(() => {
    if (selectedProductForVideo) {
      setInputMethod('manual');
      setValue('inputMethod', 'manual');
      setValue('name', selectedProductForVideo.name);
      setValue('description', selectedProductForVideo.description);
      setValue('price', selectedProductForVideo.price);
      setValue('currency', selectedProductForVideo.currency);
      setValue('features', selectedProductForVideo.features.join(', '));
      setValue('affiliateUrl', selectedProductForVideo.affiliateUrl);
      setValue('imageUrl', selectedProductForVideo.imageUrl);
      setImagePreview(selectedProductForVideo.imageUrl);

      // Clean up after consuming
      setSelectedProductForVideo(null);
    }
  }, [selectedProductForVideo, setValue, setSelectedProductForVideo]);

  const handleInputMethodChange = (method: 'url' | 'manual') => {
    setInputMethod(method);
    setValue('inputMethod', method);
  };

  // Image file handler for manual upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast({
          type: 'error',
          title: 'File too large',
          message: 'Image size should be less than 5MB'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setValue('imageUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setValue('imageUrl', '');
  };

  const onSubmit = async (data: VideoFormValues) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await videoService.createVideo({
        inputMethod: data.inputMethod,
        productUrl: data.productUrl,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        features: data.features,
        affiliateUrl: data.affiliateUrl,
        imageUrl: imagePreview || data.imageUrl,
        language: data.language,
        tone: data.tone,
        duration: data.duration,
        aspectRatio: data.aspectRatio,
        customInstructions: data.customInstructions
      });

      addToast({
        type: 'success',
        title: 'Video Generation Triggered',
        message: 'Pipeline initialized. Redirecting to live progress monitor...'
      });

      // Navigate to dedicated progress page with new video ID
      navigate(`/videos/progress/${response.data.id}`);
    } catch (err: unknown) {
      console.error('Failed to trigger video generation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Backend video service request failed.';
      setApiError(
        `${errorMessage} Ensure your video backend is running on ${settings.apiBaseUrl} or switch to Demo Sandbox in the header.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDuration = watch('duration');
  const currentAspectRatio = watch('aspectRatio');

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Configure Video Generation</h2>
        <p className="mt-1 text-xs text-slate-500">
          Feed product details into the automated Gemini script & Remotion render engine.
        </p>
      </div>

      {apiError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold">Generation Request Failed</p>
              <p className="mt-1 text-rose-700">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Product Input Method Selection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Step 1</span>
              <h3 className="text-base font-bold text-slate-900">Product Input Source</h3>
            </div>
            <div className="text-xs font-medium text-slate-400">Select input format</div>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="mt-5 grid grid-cols-2 gap-3 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => handleInputMethodChange('manual')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                inputMethod === 'manual'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileEdit className="h-4 w-4 text-teal-600" />
              Manual Product Specs (Recommended)
            </button>

            <button
              type="button"
              onClick={() => handleInputMethodChange('url')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                inputMethod === 'url'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link2 className="h-4 w-4 text-teal-600" />
              Product URL Extraction
            </button>
          </div>

          {/* Option A: Product URL */}
          {inputMethod === 'url' && (
            <div className="mt-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Direct Product URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://www.amazon.in/dp/B08N5WRWNW or https://flipkart.com/..."
                    {...register('productUrl')}
                    className={`w-full rounded-lg border py-2.5 pr-4 pl-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                      errors.productUrl
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500'
                    }`}
                  />
                </div>
                {errors.productUrl && (
                  <p className="mt-1 text-xs text-rose-600">{errors.productUrl.message}</p>
                )}
              </div>

              {/* Informative Note regarding URL extraction */}
              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
                <Info className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">Extraction Notice:</span> Automatic URL extraction relies on backend parser support. E-commerce sites with aggressive bot protection (e.g. Meesho, Cloudflare challenges) may fail to extract. If your URL cannot be resolved by your backend script, use the <strong>Manual Product Specs</strong> tab instead.
                </div>
              </div>
            </div>
          )}

          {/* Option B: Manual Product Details */}
          {inputMethod === 'manual' && (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Product Title / Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AeroGlide Ultra Ergonomic Wireless Mouse"
                    {...register('name')}
                    className={`w-full rounded-lg border py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                      errors.name
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Currency
                    </label>
                    <select
                      {...register('currency')}
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 px-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Price <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="2499"
                      {...register('price')}
                      className={`w-full rounded-lg border py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                        errors.price
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500'
                      }`}
                    />
                    {errors.price && <p className="mt-1 text-xs text-rose-600">{errors.price.message}</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Product Description / Value Proposition
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why someone should buy this: fixes wrist pain, 70-day battery life, silent clicks..."
                  {...register('description')}
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Key Features (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="57° Angle, USB-C Charging, Silent Click, Dual Bluetooth"
                    {...register('features')}
                    className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Used by Gemini to generate structured reel bullet points</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Affiliate Redirect URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://affiliate.example.com/item/123?ref=myid"
                    {...register('affiliateUrl')}
                    className={`w-full rounded-lg border py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                      errors.affiliateUrl
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500'
                    }`}
                  />
                  {errors.affiliateUrl && (
                    <p className="mt-1 text-xs text-rose-600">{errors.affiliateUrl.message}</p>
                  )}
                </div>
              </div>

              {/* Product Image Upload with Preview */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Product Image Asset (for video scenes & animated zoom)
                </label>
                {imagePreview ? (
                  <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-20 w-20 shrink-0 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-slate-800">Image Asset Loaded</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Will be animated inside Remotion compositions with motion transitions.
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <label className="cursor-pointer text-[11px] font-semibold text-teal-600 hover:text-teal-700">
                          Replace Image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageFileChange}
                          />
                        </label>
                        <span className="text-slate-300">·</span>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 pt-5 pb-6 text-center hover:border-slate-400">
                    <div className="space-y-1">
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <div className="flex text-xs text-slate-600 justify-center">
                        <label className="relative cursor-pointer font-medium text-teal-600 focus-within:outline-none hover:text-teal-500">
                          <span>Upload a product photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageFileChange}
                          />
                        </label>
                        <span className="pl-1 text-slate-400">or drag and drop</span>
                      </div>
                      <p className="text-[10px] text-slate-400">PNG, JPG, WebP up to 5MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Video Configuration */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Step 2</span>
              <h3 className="text-base font-bold text-slate-900">Creative & Output Parameters</h3>
            </div>
            <div className="text-xs font-medium text-slate-400">Tone, Language & Ratio</div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Language Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5 text-slate-500" />
                Script & Audio Language
              </label>
              <select
                {...register('language')}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="Hinglish">Hinglish (Best conversion for Indian reels)</option>
                <option value="English">English (Global audience)</option>
                <option value="Hindi">Hindi (Pure Hindi)</option>
              </select>
            </div>

            {/* Video Tone */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-slate-500" />
                Script Style / Tone
              </label>
              <select
                {...register('tone')}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="Energetic">Energetic (Fast-paced hook, urgent CTA)</option>
                <option value="Promotional">Promotional (Focus on deal, discount & savings)</option>
                <option value="Informative">Informative (Deep feature explanations & specs)</option>
                <option value="Professional">Professional (Refined corporate tone)</option>
              </select>
            </div>

            {/* Target Duration */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                Target Video Duration
              </label>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 60].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => field.onChange(dur as VideoDuration)}
                        className={`rounded-lg border py-2 text-xs font-semibold transition-all ${
                          field.value === dur
                            ? 'border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {dur} seconds
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Ratio className="h-3.5 w-3.5 text-slate-500" />
                Aspect Ratio
              </label>
              <Controller
                name="aspectRatio"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => field.onChange('9:16')}
                      className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold transition-all ${
                        field.value === '9:16'
                          ? 'border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="h-4 w-2.5 rounded-xs border border-current" />
                      9:16 (Shorts / Reels)
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange('16:9')}
                      className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold transition-all ${
                        field.value === '16:9'
                          ? 'border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="h-2.5 w-4 rounded-xs border border-current" />
                      16:9 (Landscape)
                    </button>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="mt-5">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Optional Custom Instructions for Gemini Script Engine
            </label>
            <input
              type="text"
              placeholder="e.g. Highlight a 20% limited time coupon code 'SAVE20' in the final 5 seconds..."
              {...register('customInstructions')}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Submit Action Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs text-slate-500">
            <div className="font-semibold text-slate-900">Execution Pipeline:</div>
            Gemini Script &rarr; Neural Audio TTS &rarr; Remotion Rendering &rarr; FFmpeg Export
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Initializing Pipeline...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Video
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
