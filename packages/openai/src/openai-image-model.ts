import { ImageModelV1, ImageModelV1CallWarning } from '@ai-sdk/provider';
import {
  combineHeaders,
  createJsonResponseHandler,
  postJsonToApi,
} from '@ai-sdk/provider-utils';
import { z } from 'zod';
import { OpenAIConfig } from './openai-config';
import { openaiFailedResponseHandler } from './openai-error';
import {
  OpenAIImageModelId,
  OpenAIImageSettings,
  modelMaxImagesPerCall,
  hasDefaultResponseFormat,
} from './openai-image-settings';

interface OpenAIImageModelConfig extends OpenAIConfig {
  _internal?: {
    currentDate?: () => Date;
  };
}

export class OpenAIImageModel implements ImageModelV1 {
  readonly specificationVersion = 'v1';

  get maxImagesPerCall(): number {
    return (
      this.settings.maxImagesPerCall ?? modelMaxImagesPerCall[this.modelId] ?? 1
    );
  }

  get provider(): string {
    return this.config.provider;
  }

  constructor(
    readonly modelId: OpenAIImageModelId,
    private readonly settings: OpenAIImageSettings,
    private readonly config: OpenAIImageModelConfig,
  ) {}

  async doGenerate({
    prompt,
    n,
    size,
    aspectRatio,
    seed,
    providerOptions,
    headers,
    abortSignal,
    editImages,
    editInstructions,
  }: Parameters<ImageModelV1['doGenerate']>[0] & {
    editImages?: Array<string | Uint8Array>;
    editInstructions?: string;
  }): Promise<Awaited<ReturnType<ImageModelV1['doGenerate']>>> {
    const warnings: Array<ImageModelV1CallWarning> = [];

    if (aspectRatio != null) {
      warnings.push({
        type: 'unsupported-setting',
        setting: 'aspectRatio',
        details:
          'This model does not support aspect ratio. Use `size` instead.',
      });
    }

    if (seed != null) {
      warnings.push({ type: 'unsupported-setting', setting: 'seed' });
    }

    const currentDate = this.config._internal?.currentDate?.() ?? new Date();

    // Prepare edit image fields for OpenAI API if present
    let body: Record<string, any> = {
      model: this.modelId,
      prompt,
      n,
      size,
      ...(providerOptions.openai ?? {}),
      ...(!hasDefaultResponseFormat.has(this.modelId)
        ? { response_format: 'b64_json' }
        : {}),
    };
    if (editImages && editImages.length > 0) {
      // OpenAI expects a single image for edit, and optionally a mask
      // Only the first image is used for 'image', the second (if present) for 'mask'
      body.image = editImages[0];
      if (editImages.length > 1) {
        body.mask = editImages[1];
      }
      if (editInstructions) {
        body.prompt = editInstructions;
      }
    }

    const { value: response, responseHeaders } = await postJsonToApi({
      url: this.config.url({
        path: '/images/generations',
        modelId: this.modelId,
      }),
      headers: combineHeaders(this.config.headers(), headers),
      body,
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        openaiImageResponseSchema,
      ),
      abortSignal,
      fetch: this.config.fetch,
    });

    return {
      images: response.data.map(item => item.b64_json),
      warnings,
      response: {
        timestamp: currentDate,
        modelId: this.modelId,
        headers: responseHeaders,
      },
    };
  }
}

// minimal version of the schema, focussed on what is needed for the implementation
// this approach limits breakages when the API changes and increases efficiency
const openaiImageResponseSchema = z.object({
  data: z.array(z.object({ b64_json: z.string() })),
});
