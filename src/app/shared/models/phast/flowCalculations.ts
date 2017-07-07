export interface FlowCalculations {
    gasType: number,
    specificGravity: number,
    orificeDiameter: number,
    insidePipeDiameter: number,
    sectionType: number,
    dischargeCoefficient: number,
    gasHeatingValue: number,
    gasTemperature: number,
    gasPressure: number,
    orificePressureDrop: number,
    operatingTime: number
}

export interface FlowCalculationsOutput {
    flow: number,
    heatInput: number,
    totalFlow: number
}