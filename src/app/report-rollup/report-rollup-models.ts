
import { PSAT, PsatOutputs } from '../shared/models/psat';
import { PHAST, ExecutiveSummary, PhastResults } from '../shared/models/phast/phast';
import { Settings } from '../shared/models/settings';
import { FSAT, FsatOutput } from '../shared/models/fans';
import { Assessment } from '../shared/models/assessment';
import { SSMT } from '../shared/models/steam/ssmt';
import { SSMTOutput } from '../shared/models/steam/steam-outputs';
import { TreasureHuntResults, OpportunitiesPaybackDetails } from '../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-hunt/treasure-chest/opportunity-cards/opportunity-cards.service';
import { WasteWaterData, WasteWaterResults } from '../shared/models/waste-water';
import { CompressedAirAssessment, Modification } from '../shared/models/compressed-air-assessment';
import { BaselineResults, CompressedAirAssessmentResult, DayTypeModificationResult } from '../compressed-air-assessment/compressed-air-assessment-results.service';

export interface ReportItem {
    assessment: Assessment;
    settings: Settings;
}

//PSAT
export interface PsatCompare {
    baseline: PSAT;
    modification: PSAT;
    assessmentId: number;
    selectedIndex: number;
    name: string;
    assessment: Assessment;
    settings: Settings;
}


export interface PsatResultsData {
    baselineResults: PsatOutputs;
    modificationResults: PsatOutputs;
    assessmentId: number;
    name: string;
    modName: string;
    baseline: PSAT;
    modification: PSAT;
    settings: Settings;
}


export interface AllPsatResultsData {
    baselineResults: PsatOutputs;
    modificationResults: Array<PsatOutputs>;
    assessmentId: number;
    isBaseline?: boolean;
}

//PHAST
export interface PhastCompare {
    baseline: PHAST;
    modification: PHAST;
    assessmentId: number;
    selectedIndex: number;
    name: string;
    assessment: Assessment;
    settings: Settings;
}


export interface PhastResultsData {
    baselineResults: ExecutiveSummary;
    modificationResults: ExecutiveSummary;
    baselineResultData: PhastResults;
    modificationResultData: PhastResults;
    assessmentId: number;
    settings: Settings;
    name: string;
    modName: string;
    assessment: Assessment;
}


export interface AllPhastResultsData {
    baselineResults: ExecutiveSummary;
    modificationResults: Array<ExecutiveSummary>;
    assessmentId: number;
    isBaseline?: boolean;
}

//FSAT
export interface FsatCompare {
    baseline: FSAT;
    modification: FSAT;
    assessmentId: number;
    selectedIndex: number;
    name: string;
    assessment: Assessment;
    settings: Settings;
}

export interface FsatResultsData {
    baselineResults: FsatOutput;
    modificationResults: FsatOutput;
    assessmentId: number;
    name: string;
    modName: string;
    baseline: FSAT;
    modification: FSAT;
    settings: Settings;
}


export interface AllFsatResultsData {
    baselineResults: FsatOutput;
    modificationResults: Array<FsatOutput>;
    assessmentId: number;
    isBaseline?: boolean;
}

//SSMT
export interface SsmtCompare {
    baseline: SSMT;
    modification: SSMT;
    assessmentId: number;
    selectedIndex: number;
    name: string;
    assessment: Assessment;
    settings: Settings;
}

export interface SsmtResultsData {
    baselineResults: SSMTOutput;
    modificationResults: SSMTOutput;
    assessmentId: number;
    name: string;
    modName: string;
    baseline: SSMT;
    modification: SSMT;
    settings: Settings;
}


export interface AllSsmtResultsData {
    baselineResults: SSMTOutput;
    modificationResults: Array<SSMTOutput>;
    assessmentId: number;
    isBaseline?: boolean;
}


export interface TreasureHuntResultsData{
    assessment: Assessment;
    treasureHuntResults: TreasureHuntResults;
    opportunityCardsData: Array<OpportunityCardData>;
    opportunitiesPaybackDetails: OpportunitiesPaybackDetails;
}

export interface EffluentEnergyResults {
    baseline: EffluentEnergyData,
    modification: EffluentEnergyData,
    settings?: Settings;
}

export interface EffluentEnergyData {
    assessmentName: string,
    equipmentName: string,
    kWhMonth: number,
    millionGallons: number,
    personEquivalents: number,
    BODRemoved: number,
    TSSRemoved: number,
    TNRemoved: number;
}

export interface NutrientRemovalResults {
    assessmentName: string,
    baselineName: string,
    modificationName: string,
    baselineTSSRemoval: number,
    baselineNRemoval: number,
    baselineBODRemoval: number,
    modificationTSSRemoval?: number,
    modificationNRemoval?: number,
    modificationBODRemoval?: number;
  }

//waste water
export interface WasteWaterCompare {
    baseline: WasteWaterData;
    modification: WasteWaterData;
    assessmentId: number;
    selectedIndex: number;
    name: string;
    assessment: Assessment;
    settings: Settings;
}

export interface WasteWaterResultsData {
    baselineResults: WasteWaterResults;
    modificationResults: WasteWaterResults;
    assessmentId: number;
    name: string;
    modName: string;
    baseline: WasteWaterData;
    modification: WasteWaterData;
    settings: Settings;
}


export interface AllWasteWaterResultsData {
    baselineResults: WasteWaterResults;
    modificationResults: Array<WasteWaterResults>;
    assessmentId: number;
    isBaseline?: boolean;
}


//compressedAir
export interface CompressedAirCompare {
    baseline: CompressedAirAssessment;
    modification: Modification;
    assessmentId: number;
    selectedIndex: number;
    name: string;
    assessment: Assessment;
    settings: Settings;
}

export interface CompressedAirResultsData {
    baselineResults: BaselineResults;
    modificationResults: DayTypeModificationResult;
    assessmentId: number;
    name: string;
    modName: string;
    baseline: CompressedAirAssessment;
    modification: Modification;
    settings: Settings;
}


export interface AllCompressedAirResultsData {
    baselineResults: BaselineResults;
    modificationResults: Array<DayTypeModificationResult>;
    assessmentId: number;
    isBaseline?: boolean;
}