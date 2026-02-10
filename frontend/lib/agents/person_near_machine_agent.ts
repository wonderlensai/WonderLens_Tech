import { Agent, AgentContext } from './types'

export class PersonNearMachineAgent implements Agent {
  name: 'person_near_machine_agent' = 'person_near_machine_agent'

  async run(_ctx: AgentContext) {
    // Placeholder:
    // This will become: ROI -> YOLO(person) -> tracking -> count-in-ROI -> events.
    // Keep as an agent so MasterAgent can compose it later.
    return {
      ok: false,
      name: this.name,
      data: { message: 'Not implemented yet (planned: YOLO + tracker + ROI)' },
    }
  }
}

