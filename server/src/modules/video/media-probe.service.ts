import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { env } from "../../config/env";

const execFileAsync = promisify(execFile);

export async function probeMediaDurationSeconds(path: string): Promise<number> {
  const { stdout } = await execFileAsync(resolveFfprobePath(), [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    path,
  ]);

  const duration = Number.parseFloat(stdout.trim());
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Could not read media duration with ffprobe: ${path}`);
  }

  return duration;
}

function resolveFfprobePath(): string {
  if (env.ffprobePath !== "ffprobe") return env.ffprobePath;

  const remotionProbe = join(process.cwd(), "node_modules", "@remotion", "compositor-win32-x64-msvc", "ffprobe.exe");
  if (existsSync(remotionProbe)) return remotionProbe;

  return env.ffprobePath;
}
