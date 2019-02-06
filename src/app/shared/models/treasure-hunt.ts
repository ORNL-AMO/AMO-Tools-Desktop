import { LightingReplacementData } from "./lighting";

export interface TreasureHunt {
    name: string,
    lightingReplacements?: Array<LightingReplacementTreasureHunt>;
}


export interface LightingReplacementTreasureHunt {
    baseline: Array<LightingReplacementData>;
    modifications?: Array<LightingReplacementData>;
    name?: string;
}