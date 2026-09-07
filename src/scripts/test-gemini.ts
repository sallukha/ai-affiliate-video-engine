import { testGeminiConnection } from "../providers/llm/gemini.service";

async function main(): Promise<void> {
  try {
    const result = await testGeminiConnection();
    console.log(JSON.stringify({ ok: true, hook: result.hook, sceneCount: result.scenes.length }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Unknown Gemini error" }, null, 2));
    process.exitCode = 1;
  }
}

void main();
