export type AgentName =
  | 'frame_caption_agent'
  | 'person_detect_agent'
  | 'track_agent'
  | 'count_in_roi_agent'
  | 'rag_answer_agent'
  // Backward-compat / legacy names (keep until we migrate existing rows):
  | 'scene_index_agent'
  | 'person_near_machine_agent'

export type AgentSpec = {
  name: AgentName
  params?: Record<string, any>
}

export type PipelineConfig = {
  version: 1
  agents: AgentSpec[]
}

export type AgentRunResult = {
  ok: boolean
  name: AgentName
  data?: any
}

export type AgentContext = {
  videoId: string
  jobId: string
  // Everything that agents need should be derivable from DB + ids.
  // Keep this small; agents can query DB as needed.
}

export interface Agent {
  name: AgentName
  run(ctx: AgentContext): Promise<AgentRunResult>
}
