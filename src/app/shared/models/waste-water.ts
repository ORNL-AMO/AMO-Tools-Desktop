export interface StatePointAnalysisInput {
    sviValue: number;
    sviParameter: number;
    numberOfClarifiers: number;
    areaOfClarifier: number;
    MLSS: number;
    influentFlow: number;
    rasFlow: number;
    sludgeSettlingVelocity: number;
}

export interface StatePointAnalysisOutput {
    baseline: StatePointAnalysisResults,
    modification: StatePointAnalysisResults,
    sviParameterName?: string
}

export interface StatePointAnalysisResults {
    SurfaceOverflow: number;
    AppliedSolidsLoading: number;
    TotalAreaClarifier: number;
    RasConcentration: number;
    UnderFlowRateX2: number;
    UnderFlowRateY1: number;
    OverFlowRateX2: number;
    OverFlowRateY2: number;
    StatePointX: number;
    StatePointY: number;
    graphData?: Array<Array<number>>;
}