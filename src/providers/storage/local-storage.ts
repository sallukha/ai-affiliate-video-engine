import { createWriteStream, mkdirSync, statSync } from "node:fs";
import { basename, dirname, join, normalize, sep } from "node:path";
import { randomUUID } from "node:crypto";
import type { GenerationAsset } from "../../modules/generation/generation.types";

export interface StorageAdapter {
  importRemote(url: string, key: string): Promise<GenerationAsset>;
  write(key: string, data: Buffer, mimeType: string): Promise<GenerationAsset>;
}

export function createStorage(root: string): StorageAdapter {
  const base = normalize(join(process.cwd(), root));
  const safePath = (key: string) => {
    const target = normalize(join(base, key));
    if (!target.startsWith(`${base}${sep}`)) throw new Error("Invalid storage key");
    mkdirSync(dirname(target), { recursive: true });
    return target;
  };

  return {
    async write(key, data, mimeType) {
      const target = safePath(key);
      await new Promise<void>((resolve, reject) => {
        const stream = createWriteStream(target);
        stream.on("error", reject).on("finish", resolve).end(data);
      });
      return { id: randomUUID(), kind: "final", storageKey: key, url: `/storage/${key.replaceAll("\\", "/")}`, mimeType, size: statSync(target).size };
    },
    async importRemote(url, key) {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Unable to download media (${response.status})`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const extension = basename(new URL(url).pathname).split(".").pop() ?? "bin";
      return this.write(`${key}-${randomUUID()}.${extension}`, buffer, response.headers.get("content-type") ?? "application/octet-stream");
    },
  };
}
