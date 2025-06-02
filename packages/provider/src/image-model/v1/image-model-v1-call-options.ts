import { JSONValue } from '../../json-value/json-value';

export type ImageModelV1CallOptions = {
  /**
  Prompt for image generation. Required unless using editImages/editInstructions.
  */
  prompt?: string;

  /**
Number of images to generate.
 */
  n: number;

  /**
Size of the images to generate.
Must have the format `{width}x{height}`.
`undefined` will use the provider's default size.
 */
  size: `${number}x${number}` | undefined;

  /**
Aspect ratio of the images to generate.
Must have the format `{width}:{height}`.
`undefined` will use the provider's default aspect ratio.
 */
  aspectRatio: `${number}:${number}` | undefined;

  /**
Seed for the image generation.
`undefined` will use the provider's default seed.
 */
  seed: number | undefined;

  /**
Additional provider-specific options that are passed through to the provider
as body parameters.

The outer record is keyed by the provider name, and the inner
record is keyed by the provider-specific metadata key.
```ts
{
"openai": {
"style": "vivid"
}
}
```
 */
  providerOptions: Record<string, Record<string, JSONValue>>;

  /**
Abort signal for cancelling the operation.
 */
  abortSignal?: AbortSignal;

  /**
Additional HTTP headers to be sent with the request.
Only applicable for HTTP-based providers.
 */
  headers?: Record<string, string | undefined>;

  /**
  Images to use as the basis for editing or inpainting. Array of base64 strings or Uint8Array.
  */
  editImages?: Array<string | Uint8Array>;

  /**
  Instructions for how to edit the provided images.
  */
  editInstructions?: string;
};
