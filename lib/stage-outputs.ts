import type { OpportunityRecord } from "./types";
import { APPLICATION_STATUSES, PRE_APPLICATION_STATUSES } from "./types";

export interface OpportunityStageOutputs {
  savedRoles: OpportunityRecord[];
  trackedRoles: OpportunityRecord[];
  applications: OpportunityRecord[];
}

export function partitionOpportunityStageOutputs(
  opportunities: OpportunityRecord[],
): OpportunityStageOutputs {
  return {
    savedRoles: opportunities.filter(
      (record) => record.source === "job-search" && record.status === "Saved",
    ),
    trackedRoles: opportunities.filter((record) => PRE_APPLICATION_STATUSES.includes(record.status)),
    applications: opportunities.filter((record) => APPLICATION_STATUSES.includes(record.status)),
  };
}