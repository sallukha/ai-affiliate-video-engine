import { loadMockProduct, runCompleteTestPipeline } from "../modules/video/test-pipeline/test-pipeline.service";

async function main(): Promise<void> {
	const result = await runCompleteTestPipeline(await loadMockProduct());
	console.log(JSON.stringify(result, null, 2));
	if (result.status !== "completed") process.exitCode = 1;
}

void main();
