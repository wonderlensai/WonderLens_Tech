import { Agent, AgentContext } from './types'

function notImpl(name: any, message: string): Agent {
  return {
    name,
    async run(_ctx: AgentContext) {
      return { ok: false, name, data: { message } }
    },
  }
}

export const PersonDetectAgent = () => notImpl('person_detect_agent', 'Not implemented yet (planned: YOLO person detector)')
export const TrackAgent = () => notImpl('track_agent', 'Not implemented yet (planned: ByteTrack)')
export const CountInRoiAgent = () => notImpl('count_in_roi_agent', 'Not implemented yet (planned: count-in-ROI + dwell)')

