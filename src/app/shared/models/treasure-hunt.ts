import { LightingReplacementData } from "./lighting";

export interface TreasureHunt {
    name: string,
    lightingReplacements?: Array<LightingReplacementTreasureHunt>;
}

export interface TreasureHuntOpportunity {
    name: string,
    equipment: string,
    description: string,
    originator?: string,
    date: Date,
    plant?: string,
    businessUnits?: string,
    opportunityCost: OpportunityCost
}

export interface OpportunityCost {
    engineeringServices?: number,
    material?: number,
    otherCosts?: Array<OtherCostItem>,
    costDescription?: string
}

export interface OtherCostItem {
    cost?: number,
    description?: string
}


export interface LightingReplacementTreasureHunt {
    baseline: Array<LightingReplacementData>;
    modifications?: Array<LightingReplacementData>;
    opportunity?: TreasureHuntOpportunity
    selected?: boolean;
}