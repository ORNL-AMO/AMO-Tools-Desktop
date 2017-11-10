export interface OpeningLoss {
    numberOfOpenings?: number,
    emissivity?: number,
    thickness?: number,
    ambientTemperature?: number,
    insideTemperature?: number,
    percentTimeOpen?: number,
    viewFactor?: number,
    openingType?: string,
    lengthOfOpening?: number,
    heightOfOpening?: number,
    openingTotalArea?: number,
    heatLoss?: number
}

export interface QuadOpeningLoss {
    emissivity?: number,
    length?: number,
    width?: number,
    thickness?: number,
    ratio?: number,
    ambientTemperature?: number,
    insideTemperature?: number,
    percentTimeOpen?: number,
    viewFactor?: number
}

export interface CircularOpeningLoss {
    emissivity?: number,
    diameter?: number,
    thickness?: number,
    ratio?: number,
    ambientTemperature?: number,
    insideTemperature?: number,
    percentTimeOpen?: number,
    viewFactor?: number
}
