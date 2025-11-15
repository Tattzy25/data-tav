export const ALLOWED_MODELS = [
  "groq/qwen-qwq-32b",
  "groq/openai/gpt-oss-120b",
  "groq/openai/gpt-oss-20b",
  "openai/gpt-5-mini-2025-08-07",
  "openai/gpt-5-nano-2025-08-07",
] as const

export type AllowedModel = (typeof ALLOWED_MODELS)[number]

export const DEFAULT_MODEL: AllowedModel = "groq/openai/gpt-oss-120b"

export function sanitizeModel(model: string | undefined | null): string {
  if (!model) {
    return DEFAULT_MODEL
  }

  return ALLOWED_MODELS.includes(model as AllowedModel) ? model : DEFAULT_MODEL
}
