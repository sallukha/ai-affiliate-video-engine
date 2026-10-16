import React, { useState, useEffect } from 'react';
import {
  GitCommit,
  Clock,
  CheckCircle2,
  AlertCircle,
  Terminal,
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { workflowService } from '../services/workflowService';
import { WorkflowRun, WorkflowStageDetail } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';

export const WorkflowHistoryPage: React.FC = () => {
  const { dataMode, refreshHealth } = useApp();

  const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRun | null>(null);
  const [activeStageId, setActiveStageId] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadWorkflows = async () => {
      setIsLoading(true);
      try {
        const { data } = await workflowService.getWorkflows();
        if (mounted) {
          setWorkflows(data);
          if (data.length > 0 && !selectedWorkflow) {
            setSelectedWorkflow(data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load workflows:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadWorkflows();
    return () => {
      mounted = false;
    };
  }, [dataMode]);

  const filteredWorkflows = workflows.filter(
    (w) =>
      !search ||
      w.id.toLowerCase().includes(search.toLowerCase()) ||
      w.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Pipeline Execution History</h2>
          <p className="mt-1 text-xs text-slate-500">
            Audit stage-by-stage execution runs, latency profiles, and Remotion / Gemini console logs.
          </p>
        </div>
      </div>

      {/* Main Split: Left Runs Table / Right Log Inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Runs List (5 cols) */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs lg:col-span-5">
          <div className="border-b border-slate-100 p-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter runs by ID or product..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-8 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[640px]">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : filteredWorkflows.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No workflow runs found.</div>
            ) : (
              filteredWorkflows.map((wf) => {
                const isSelected = selectedWorkflow?.id === wf.id;

                return (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedWorkflow(wf)}
                    className={`cursor-pointer p-4 transition-colors ${
                      isSelected ? 'bg-teal-50/50 border-l-3 border-teal-500' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-slate-900">{wf.id}</span>
                      <StatusBadge status={wf.status} />
                    </div>

                    <h4 className="mt-1 line-clamp-1 text-xs font-medium text-slate-800">{wf.productName}</h4>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Started: {new Date(wf.startedAt).toLocaleTimeString()}</span>
                      <span>
                        {wf.durationSeconds ? `${wf.durationSeconds}s runtime` : 'Active'}
                      </span>
                    </div>

                    {wf.errorMessage && (
                      <p className="mt-2 line-clamp-1 text-[11px] text-rose-600 font-medium">
                        {wf.errorMessage}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Workflow Detail & Logs Inspector (7 cols) */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs lg:col-span-7">
          {selectedWorkflow ? (
            <div>
              {/* Detail Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-sm font-bold text-slate-900">{selectedWorkflow.id}</h3>
                    <StatusBadge status={selectedWorkflow.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{selectedWorkflow.productName}</p>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div>Duration: <strong>{selectedWorkflow.durationSeconds ? `${selectedWorkflow.durationSeconds}s` : 'In progress'}</strong></div>
                  <div className="text-[11px] text-slate-400">Video ID: {selectedWorkflow.videoId}</div>
                </div>
              </div>

              {/* Stages Accordion */}
              <div className="p-5 space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Execution Stages Breakdown
                </div>

                <div className="space-y-3">
                  {selectedWorkflow.stages.map((st, idx) => (
                    <div
                      key={st.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 font-mono text-[10px] font-bold text-slate-700">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-900">{st.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {st.durationSeconds && (
                            <span className="text-[11px] text-slate-500 font-mono">
                              {st.durationSeconds}s
                            </span>
                          )}
                          <StatusBadge status={st.status} />
                        </div>
                      </div>

                      <p className="mt-1 text-[11px] text-slate-500 pl-7">{st.description}</p>

                      {/* Execution Terminal Logs */}
                      {st.logs && st.logs.length > 0 && (
                        <div className="mt-3 rounded-lg bg-[#0b132b] p-3 text-[11px] font-mono text-teal-300">
                          <div className="flex items-center gap-1.5 pb-2 text-[10px] text-slate-400 border-b border-slate-800">
                            <Terminal className="h-3 w-3" /> Console Output
                          </div>
                          <div className="mt-2 space-y-1 overflow-x-auto text-[11px]">
                            {st.logs.map((log, lIdx) => (
                              <div
                                key={lIdx}
                                className={log.includes('ERROR') ? 'text-rose-400 font-semibold' : 'text-slate-300'}
                              >
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {st.errorMessage && (
                        <div className="mt-2 rounded-lg bg-rose-50 p-2 text-xs text-rose-700 border border-rose-200">
                          {st.errorMessage}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              Select a workflow run from the left panel to inspect execution logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
