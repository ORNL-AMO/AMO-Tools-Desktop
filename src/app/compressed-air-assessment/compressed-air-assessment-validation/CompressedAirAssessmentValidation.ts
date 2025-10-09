export interface CompressedAirAssessmentValidation {
    baselineValid: boolean;
    systemInformationValid: boolean;
    compressorsValid: boolean;
    dayTypesValid: boolean;
    dayTypeProfileSummariesValid: Array<ProfileSummaryValid>;
    profileSummaryValid: boolean;
    compressorItemValidations: Array<CompressorItemValidation>;
    endUsesValid: boolean;
}

export interface CompressorItemValidation {
    compressorId: string;
    nameplateValid: boolean;
    compressorTypeValid: boolean;
    compressorControlsValid: boolean;
    designDetailsValid: boolean;
    centrifugalSpecsValid: boolean;
    performancePointsValid: boolean;
    isValid: boolean;
}

export interface ProfileSummaryValid {
  powerError: string,
  percentError: string,
  airFlowError: string,
  airFlowWarning: string,
  powerFactorError: string,
  voltError: string,
  ampError: string,
  isValid: boolean,
  trimSelection: boolean,
  dayTypeId: string
}

export interface AirflowValidation {
  airFlowValid: string,
  airFlowWarning: string
}
