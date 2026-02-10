import { Agent, AgentContext, AgentRunResult, AgentSpec, PipelineConfig } from './types'
import { FrameCaptionAgent } from './frame_caption_agent'
import { SceneIndexAgent } from './scene_index_agent'
import { PersonNearMachineAgent } from './person_near_machine_agent'
import { PersonDetectAgent, TrackAgent, CountInRoiAgent } from './stub_agents'

export class MasterAgent {
  private registry: Record<string, Agent> = {
    // Preferred capability names:
    frame_caption_agent: new FrameCaptionAgent(),
    person_detect_agent: PersonDetectAgent(),
    track_agent: TrackAgent(),
    count_in_roi_agent: CountInRoiAgent(),

    // Legacy names:
    scene_index_agent: new SceneIndexAgent(),
    person_near_machine_agent: new PersonNearMachineAgent(),
  }

  private resolve(spec: AgentSpec) {
    const a = this.registry[spec.name]
    if (!a) throw new Error(`Unknown agent: ${spec.name}`)
    return a
  }

  // Backward compatibility: old `state.useCase` values.
  private legacyPipeline(useCase: string | null | undefined): PipelineConfig {
    switch (useCase) {
      case 'scene_index':
      default:
        return { version: 1, agents: [{ name: 'frame_caption_agent' }] }
      case 'person_near_machine':
        return { version: 1, agents: [{ name: 'person_near_machine_agent' }] }
    }
  }

  async run(config: PipelineConfig, ctx: AgentContext): Promise<{ ok: boolean; results: AgentRunResult[] }> {
    const results: AgentRunResult[] = []
    for (const spec of config.agents) {
      const a = this.resolve(spec)
      const r = await a.run(ctx)
      results.push(r)
      if (!r.ok) return { ok: false, results }
    }
    return { ok: true, results }
  }

  pipelineFromJobState(state: any): PipelineConfig {
    // New path: `pipeline_config`
    const cfg = state?.pipeline_config
    if (cfg && cfg.version === 1 && Array.isArray(cfg.agents)) {
      return cfg as PipelineConfig
    }
    // Old path: `useCase`
    return this.legacyPipeline(state?.useCase)
  }
}
