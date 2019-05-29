
import { PSAT, PsatOutputs } from '../shared/models/psat';
import { PHAST, ExecutiveSummary, PhastResults } from '../shared/models/phast/phast';
import { Settings } from '../shared/models/settings';
import { FSAT, FsatOutput } from '../shared/models/fans';
import { Assessment } from '../shared/models/assessment';
import { SSMT } from '../shared/models/steam/ssmt';
import { SSMTOutput } from '../shared/models/steam/steam-outputs';
import { TreasureHunt, TreasureHuntResults, OpportunitySummary } from '../shared/models/treasure-hunt';

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
}