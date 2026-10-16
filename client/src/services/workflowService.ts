import { apiClient, getDataMode } from './api';
import { WorkflowRun } from '../types';
import { INITIAL_WORKFLOWS } from '../utils/mockData';

let localWorkflows: WorkflowRun[] = [...INITIAL_WORKFLOWS];

export const workflowService = {
  /**
   * Get all past workflow runs
   */
  async getWorkflows(): Promise<{ data: WorkflowRun[]; isDemo: boolean }> {
    const mode = getDataMode();
    if (mode === 'live') {
      try {
        const response = await apiClient.get<WorkflowRun[]>('/workflows');
        return { data: response.data, isDemo: false };
      } catch (err) {
        console.warn('Backend GET /workflows failed:', err);
        throw err;
      }
    }
    return { data: localWorkflows, isDemo: true };
  },

  /**
   * Get specific workflow run with detailed execution logs per stage
   */
  async getWorkflowById(id: string): Promise<{ data: WorkflowRun; isDemo: boolean }> {
    const mode = getDataMode();
    if (mode === 'live') {
      try {
        const response = await apiClient.get<WorkflowRun>(`/workflows/${id}`);
        return { data: response.data, isDemo: false };
      } catch (err) {
        console.warn(`Backend GET /workflows/${id} failed:`, err);
        throw err;
      }
    }

    const found = localWorkflows.find((w) => w.id === id || w.videoId === id);
    if (!found) {
      throw new Error(`Workflow run ${id} not found.`);
    }
    return { data: found, isDemo: true };
  }
};
