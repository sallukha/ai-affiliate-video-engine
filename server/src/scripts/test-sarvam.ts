import { testSarvamConnection } from "../providers/tts/sarvam.service";

async function main(): Promise<void> {
  try {
    const result = await testSarvamConnection();
    console.log(JSON.stringify({ ok: true, path: result.path, size: result.size, mimeType: result.mimeType }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Unknown Sarvam error" }, null, 2));
    process.exitCode = 1;
  }
}

void main();
