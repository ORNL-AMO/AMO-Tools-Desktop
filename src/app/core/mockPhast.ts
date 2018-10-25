import { Assessment } from "../shared/models/assessment";
import { Settings } from "../shared/models/settings";
declare const packageJson;
export const MockPhast: Assessment = {
    isExample: true,
    type: "PHAST",
    name: "Reheat Furnace Case Study",
    phast: {
        name: null,
        systemEfficiency: 90,
        operatingHours: {
            weeksPerYear: 48,
            daysPerWeek: 6,
            shiftsPerDay: 2,
            hoursPerShift: 12,
            hoursPerYear: 6912,
            isCalculated: true,
            operatingConditions: "The furnace was running at the full load capacity during the PH assessment."
        },
        operatingCosts: {
            fuelCost: 5,
            steamCost: 8,
            electricityCost: 0.05
        },
        modifications: [
            {
                phast: {
                    losses: {
                        chargeMaterials: [
                            {
                                name: "Material #1",
                                solidChargeMaterial: {
                                    materialId: 13,
                                    thermicReactionType: 0,
                                    specificHeatSolid: 0.16,
                                    latentHeat: 60,
                                    specificHeatLiquid: 0.175,
                                    meltingPoint: 2800,
                                    chargeFeedRate: 400000,
                                    waterContentCharged: 0,
                                    waterContentDischarged: 0,
                                    initialTemperature: 60,
                                    dischargeTemperature: 2300,
                                    waterVaporDischargeTemperature: 0,
                                    chargeMelted: 0,
                                    chargeReacted: 1,
                                    reactionHeat: 50,
                                    additionalHeat: 0,
                                    heatRequired: 143.56
                                },
                                chargeMaterialType: "Solid"
                            }
                        ],
                        fixtureLosses: [],
                        wallLosses: [
                            {
                                surfaceArea: 11100,
                                ambientTemperature: 70,
                                surfaceTemperature: 300,
                                windVelocity: 0,
                                surfaceEmissivity: 0.9,
                                surfaceShape: 3,
                                conditionFactor: 1.394,
                                correctionFactor: 1,
                                name: "Loss #1",
                                heatLoss: 4.358938052146501
                            }
                        ],
                        coolingLosses: [
                            {
                                name: "Loss #1",
                                coolingMedium: "Water",
                                liquidCoolingLoss: {
                                    flowRate: 3450,
                                    density: 8.338,
                                    initialTemperature: 77,
                                    outletTemperature: 91,
                                    specificHeat: 1,
                                    correctionFactor: 1
                                },
                                coolingLossType: "Liquid",
                                heatLoss: 24.163523999999995
                            }
                        ],
                        openingLosses: [
                            {
                                numberOfOpenings: 1,
                                emissivity: 0.9,
                                thickness: 16,
                                ambientTemperature: 70,
                                insideTemperature: 2000,
                                percentTimeOpen: 100,
                                viewFactor: 0.47,
                                openingType: "Rectangular (or Square)",
                                lengthOfOpening: 420,
                                heightOfOpening: 6,
                                name: "Fixed Opening",
                                heatLoss: 0.4633823362471144
                            },
                            {
                                numberOfOpenings: 1,
                                emissivity: 0.9,
                                thickness: 16,
                                ambientTemperature: 70,
                                insideTemperature: 2400,
                                percentTimeOpen: 15,
                                viewFactor: 0.868,
                                openingType: "Rectangular (or Square)",
                                lengthOfOpening: 420,
                                heightOfOpening: 60,
                                name: "Variable Opening",
                                heatLoss: 2.347472721772082
                            }
                        ],
                        leakageLosses: [
                            {
                                draftPressure: 0.5,
                                openingArea: 4,
                                leakageGasTemperature: 500,
                                ambientTemperature: 70,
                                coefficient: 0.8052,
                                specificGravity: 1,
                                correctionFactor: 1,
                                name: "Loss #1",
                                heatLoss: 3.2626471717418197
                            }
                        ],
                        flueGasLosses: [
                            {
                                name: "Loss #1",
                                flueGasByVolume: {
                                    gasTypeId: 1,
                                    flueGasTemperature: 1800,
                                    oxygenCalculationMethod: "Oxygen in Flue Gas",
                                    excessAirPercentage: 9.90162160358751,
                                    o2InFlueGas: 2,
                                    combustionAirTemperature: 850,
                                    fuelTemperature: 65,
                                    CH4: 87,
                                    C2H6: 8.5,
                                    N2: 3.6,
                                    H2: 0.4,
                                    C3H8: 0,
                                    C4H10_CnH2n: 0,
                                    H2O: 0,
                                    CO: 0,
                                    CO2: 0.4,
                                    SO2: 0,
                                    O2: 0.1
                                },
                                flueGasType: "By Volume"
                            }
                        ]
                    },
                    name: "Individual Opportunity 4 - Reduce O2 level in flue gases",
                    operatingCosts: {
                        fuelCost: 5,
                        steamCost: 8,
                        electricityCost: 0.05
                    },
                    operatingHours: {
                        weeksPerYear: 48,
                        daysPerWeek: 6,
                        shiftsPerDay: 2,
                        hoursPerShift: 12,
                        hoursPerYear: 6912,
                        isCalculated: true,
                        operatingConditions: "The furnace was running at the full load capacity during the PH assessment."
                    },
                    systemEfficiency: 90
                },
                notes: {
                    chargeNotes: '',
                    wallNotes: '',
                    atmosphereNotes: '',
                    fixtureNotes: '',
                    openingNotes: '',
                    coolingNotes: '',
                    flueGasNotes: '',
                    otherNotes: '',
                    leakageNotes: '',
                    extendedNotes: '',
                    slagNotes: '',
                    auxiliaryPowerNotes: '',
                    exhaustGasNotes: '',
                    energyInputExhaustGasNotes: '',
                    operationsNotes: ''
                }
            },
            {
                phast: {
                    losses: {
                        chargeMaterials: [
                            {
                                name: "Material #1",
                                solidChargeMaterial: {
                                    materialId: 13,
                                    thermicReactionType: 0,
                                    specificHeatSolid: 0.16,
                                    latentHeat: 60,
                                    specificHeatLiquid: 0.175,
                                    meltingPoint: 2800,
                                    chargeFeedRate: 400000,
                                    waterContentCharged: 0,
                                    waterContentDischarged: 0,
                                    initialTemperature: 60,
                                    dischargeTemperature: 2300,
                                    waterVaporDischargeTemperature: 0,
                                    chargeMelted: 0,
                                    chargeReacted: 1,
                                    reactionHeat: 50,
                                    additionalHeat: 0,
                                    heatRequired: 143.56
                                },
                                chargeMaterialType: "Solid"
                            }
                        ],
                        fixtureLosses: [],
                        wallLosses: [
                            {
                                surfaceArea: 11100,
                                ambientTemperature: 70,
                                surfaceTemperature: 200,
                                windVelocity: 0,
                                surfaceEmissivity: 0.9,
                                surfaceShape: 3,
                                conditionFactor: 1.394,
                                correctionFactor: 1,
                                name: "Loss #1",
                                heatLoss: 1.8968341486185003
                            }
                        ],
                        coolingLosses: [
                            {
                                name: "Loss #1",
                                coolingMedium: "Water",
                                liquidCoolingLoss: {
                                    flowRate: 3450,
                                    density: 8.338,
                                    initialTemperature: 77,
                                    outletTemperature: 91,
                                    specificHeat: 1,
                                    correctionFactor: 1
                                },
                                coolingLossType: "Liquid",
                                heatLoss: 24.163523999999995
                            }
                        ],
                        openingLosses: [
                            {
                                numberOfOpenings: 1,
                                emissivity: 0.9,
                                thickness: 16,
                                ambientTemperature: 70,
                                insideTemperature: 2000,
                                percentTimeOpen: 100,
                                viewFactor: 0.47,
                                openingType: "Rectangular (or Square)",
                                lengthOfOpening: 420,
                                heightOfOpening: 6,
                                name: "Fixed Opening",
                                heatLoss: 0.4633823362471144
                            },
                            {
                                numberOfOpenings: 1,
                                emissivity: 0.9,
                                thickness: 16,
                                ambientTemperature: 70,
                                insideTemperature: 2400,
                                percentTimeOpen: 15,
                                viewFactor: 0.868,
                                openingType: "Rectangular (or Square)",
                                lengthOfOpening: 420,
                                heightOfOpening: 60,
                                name: "Variable Opening",
                                heatLoss: 2.347472721772082
                            }
                        ],
                        leakageLosses: [
                            {
                                draftPressure: 0.5,
                                openingArea: 4,
                                leakageGasTemperature: 500,
                                ambientTemperature: 70,
                                coefficient: 0.8052,
                                specificGravity: 1,
                                correctionFactor: 1,
                                name: "Loss #1",
                                heatLoss: 3.2626471717418197
                            }
                        ],
                        flueGasLosses: [
                            {
                                name: "Loss #1",
                                flueGasByVolume: {
                                    gasTypeId: 1,
                                    flueGasTemperature: 1800,
                                    oxygenCalculationMethod: "Oxygen in Flue Gas",
                                    excessAirPercentage: 36.51958277059165,
                                    o2InFlueGas: 6,
                                    combustionAirTemperature: 850,
                                    fuelTemperature: 65,
                                    CH4: 87,
                                    C2H6: 8.5,
                                    N2: 3.6,
                                    H2: 0.4,
                                    C3H8: 0,
                                    C4H10_CnH2n: 0,
                                    H2O: 0,
                                    CO: 0,
                                    CO2: 0.4,
                                    SO2: 0,
                                    O2: 0.1
                                },
                                flueGasType: "By Volume"
                            }
                        ]
                    },
                    name: "Individual Opportunity 3 - Repair wall insulation",
                    operatingCosts: {
                        fuelCost: 5,
                        steamCost: 8,
                        electricityCost: 0.05
                    },
                    operatingHours: {
                        weeksPerYear: 48,
                        daysPerWeek: 6,
                        shiftsPerDay: 2,
                        hoursPerShift: 12,
                        hoursPerYear: 6912,
                        isCalculated: true,
                        operatingConditions: "The furnace was running at the full load capacity during the PH assessment."
                    },
                    systemEfficiency: 90
                },
                notes: {
                    chargeNotes: '',
                    wallNotes: '',
                    atmosphereNotes: '',
                    fixtureNotes: '',
                    openingNotes: '',
                    coolingNotes: '',
                    flueGasNotes: '',
                    otherNotes: '',
                    leakageNotes: '',
                    extendedNotes: '',
                    slagNotes: '',
                    auxiliaryPowerNotes: '',
                    exhaustGasNotes: '',
                    energyInputExhaustGasNotes: '',
                    operationsNotes: ''
                }
            },
            {
                phast: {
                    losses: {
                        chargeMaterials: [
                            {
                                name: "Material #1",
                                solidChargeMaterial: {
                                    materialId: 13,
                                    thermicReactionType: 0,
                                    specificHeatSolid: 0.16,
                                    latentHeat: 60,
                                    specificHeatLiquid: 0.175,
                                    meltingPoint: 2800,
                                    chargeFeedRate: 400000,
                                    waterContentCharged: 0,
                                    waterContentDischarged: 0,
                                    initialTemperature: 60,
                                    dischargeTemperature: 2300,
                                    waterVaporDischargeTemperature: 0,
                                    chargeMelted: 0,
                                    chargeReacted: 1,
                                    reactionHeat: 50,
                                    additionalHeat: 0,
                                    heatRequired: 143.56
                                },
                                chargeMaterialType: "Solid"
                            }
                        ],
                        fixtureLosses: [],
                        wallLosses: [
                            {
                                surfaceArea: 11100,
                                ambientTemperature: 70,
                                surfaceTemperature: 300,
                                windVelocity: 0,
                                surfaceEmissivity: 0.9,
                                surfaceShape: 3,
                                conditionFactor: 1.394,
                                correctionFactor: 1,
                                name: "Loss #1",
                                heatLoss: 4.358938052146501
                            }
                        ],
                        coolingLosses: [
                            {
                                name: "Loss #1",
                                coolingMedium: "Water",
                                liquidCoolingLoss: {
                                    flowRate: 3450,
                                    density: 8.338,
                                    initialTemperature: 77,
                                    outletTemperature: 91,
                                    specificHeat: 1,
                                    correctionFactor: 1
                                },
                                coolingLossType: "Liquid",
                                heatLoss: 24.163523999999995
                            }
                        ],
                        openingLosses: [
                            {
                                numberOfOpenings: 1,
                                emissivity: 0.9,
                                thickness: 16,
                                ambientTemperature: 70,
                                insideTemperature: 2000,
                                percentTimeOpen: 0,
                                viewFactor: 0.47,
                                openingType: "Rectangular (or Square)",
                                lengthOfOpening: 420,
                                heightOfOpening: 6,
                                name: "Fixed Opening",
                                heatLoss: 0
                            },
                            {
                                numberOfOpenings: 1,
                                emissivity: 0.9,
                                thickness: 16,
                                ambientTemperature: 70,
                                insideTemperature: 2400,
                                percentTimeOpen: 10,
                                viewFactor: 0.868,
                                openingType: "Rectangular (or Square)",
                                lengthOfOpening: 420,
                                heightOfOpening: 60,
                                name: "Variable Opening",
                                heatLoss: 1.564981814514721
                            }
                        ],
                        leakageLosses: [
                            {
                                draftPressure: 0.5,
                                openingArea: 4,
                                leakageGasTemperature: 500,
                                ambientTemperature: 70,
                                coefficient: 0.8052,
                                specificGravity: 1,
                                correctionFactor: 1,
                                name: "Loss #1",
                                heatLoss: 3.2626471717418197
                            }
                        ],
                        flueGasLosses: [
                            {
                                name: "Loss #1",
                                flueGasByVolume: {
                                    gasTypeId: 1,
                                    flueGasTemperature: 1800,
                                    oxygenCalculationMethod: "Oxygen in Flue Gas",
                                    excessAirPercentage: 36.51958277059165,
                                    o2InFlueGas: 6,
                                    combustionAirTemperature: 850,
                                    fuelTemperature: 65,
                                    CH4: 87,
                                    C2H6: 8.5,
                                    N2: 3.6,
                                    H2: 0.4,
                                    C3H8: 0,
                                    C4H10_CnH2n: 0,
                                    H2O: 0,
                                    CO: 0,
                                    CO2: 0.4,
                                    SO2: 0,
                                    O2: 0.1
                                },
                                flueGasType: "By Volume"
                            }
                        ]
                    },
                    name: "Individual Opportunity 2 - Repair fixed openings",
                    operatingCosts: {
                        fuelCost: 5,
                        steamCost: 8,
                        electricityCost: 0.05
                    },
                    operatingHours: {
                        weeksPerYear: 48,
                        daysPerWeek: 6,
                        shiftsPerDay: 2,
                        hoursPerShift: 12,
                        hoursPerYear: 6912,
                        isCalculated: true,
                        operatingConditions: "The furnace was running at the full load capacity during the PH assessment."
                    },
                    systemEfficiency: 90
                },
                notes: {
                    chargeNotes: '',
                    wallNotes: '',
                    atmosphereNotes: '',
                    fixtureNotes: '',
                    openingNotes: '',
                    coolingNotes: '',
                    flueGasNotes: '',
                    otherNotes: '',
                    leakageNotes: '',
                    extendedNotes: '',
                    slagNotes: '',
                    auxiliaryPowerNotes: '',
                    exhaustGasNotes: '',
                    energyInputExhaustGasNotes: '',
                    operationsNotes: ''
                }
            },
            {
                phast: {
                    losses: {
                        chargeMaterials: [
                            {
                                name: "Material #1",
                                solidChargeMaterial: {
                                    materialId: 13,
                                    thermicReactionType: 0,
                                    specificHeatSolid: 0.16,
                                    latentHeat: 60,
                                    specificHeatLiquid: 0.175,
                                    meltingPoint: 2800,
                                    chargeFeedRate: 400000,
                                    waterContentCharged: 0,
                                    waterContentDischarged: 0,
                                    initialTemperature: 300,
                                    dischargeTemperature: 2300,
                                    waterVaporDischargeTemperature: 0,
                                    chargeMelted: 0,
                                    chargeReacted: 1,
                                    reactionHeat: 50,
                                    additionalHeat: 0,
                                    heatRequired: 128.2
                                },
                                chargeMaterialType: "Solid"
                            }
                        ],
                        fixtureLosses: [],
                        wallLosses: [
                            {
                                surfaceArea: 11100,
                                ambientTemperature: 70,
                                surfaceTemperature: 300,
                                windVelocity: 0,
                                surfaceEmissivity: 0.9,
                                surfaceShape: 3,
                                conditionFactor: 1.394,
                                correctionFactor: 1,
                                name: "Loss #1",
                                heatLoss: 4.358938052146501
                            }
                        ],
                        coolingLosses: [
                            {
                                name: "Loss #1",
                                coolingMedium: "Water",
                                liquidCoolingLoss: {
                                    flowRate: 3450,
                                    density: 8.338,
                                    initialTemperature: 77,
                                    outletTemperature: 91,
                                    specificHeat: 1,
                                    correctionFactor: 1
                                },
                                coolingLossType: "Liquid",
                                heatLoss: 24.163523999999995
                            }
                        ],
                        openingLosses: [
                            {
                                numberOfOpenings: 1,
                                emissivity: 0.9,
                                thickness: 16,
                                ambientTemperature: 70,
                                insideTemperature: 2000,
                                percentTimeOpen: 100,
                                viewFactor: 0.47,
                                openingType: "Rectangular (or Square)",
                                lengthOfOpening: 420,
                                heightOfOpening: 6,
                                name: "Fixed Opening",
                                heatLoss: 0.4633823362471144
                            },
                            {
                                numberOfOpenings: 1,
                                emissivity: 0.9,
                                thickness: 16,
                                ambientTemperature: 70,
                                insideTemperature: 2400,
                                percentTimeOpen: 15,
                                viewFactor: 0.868,
                                openingType: "Rectangular (or Square)",
                                lengthOfOpening: 420,
                                heightOfOpening: 60,
                                name: "Variable Opening",
                                heatLoss: 2.347472721772082
                            }
                        ],
                        leakageLosses: [
                            {
                                draftPressure: 0.5,
                                openingArea: 4,
                                leakageGasTemperature: 500,
                                ambientTemperature: 70,
                                coefficient: 0.8052,
                                specificGravity: 1,
                                correctionFactor: 1,
                                name: "Loss #1",
                                heatLoss: 3.2626471717418197
                            }
                        ],
                        flueGasLosses: [
                            {
                                name: "Loss #1",
                                flueGasByVolume: {
                                    gasTypeId: 1,
                                    flueGasTemperature: 1800,
                                    oxygenCalculationMethod: "Oxygen in Flue Gas",
                                    excessAirPercentage: 36.51958277059165,
                                    o2InFlueGas: 6,
                                    combustionAirTemperature: 850,
                                    fuelTemperature: 65,
                                    CH4: 87,
                                    C2H6: 8.5,
                                    N2: 3.6,
                                    H2: 0.4,
                                    C3H8: 0,
                                    C4H10_CnH2n: 0,
                                    H2O: 0,
                                    CO: 0,
                                    CO2: 0.4,
                                    SO2: 0,
                                    O2: 0.1
                                },
                                flueGasType: "By Volume"
                            }
                        ]
                    },
                    name: "Individual Opportunity 1 - Preheat Charge Material",
                    operatingCosts: {
                        fuelCost: 5,
                        steamCost: 8,
                        electricityCost: 0.05
                    },
                    operatingHours: {
                        weeksPerYear: 48,
                        daysPerWeek: 6,
                        shiftsPerDay: 2,
                        hoursPerShift: 12,
                        hoursPerYear: 6912,
                        isCalculated: true,
                        operatingConditions: "The furnace was running at the full load capacity during the PH assessment. "
                    },
                    systemEfficiency: 90
                },
                notes: {
                    chargeNotes: '',
                    wallNotes: '',
                    atmosphereNotes: '',
                    fixtureNotes: '',
                    openingNotes: '',
                    coolingNotes: '',
                    flueGasNotes: '',
                    otherNotes: '',
                    leakageNotes: '',
                    extendedNotes: '',
                    slagNotes: '',
                    auxiliaryPowerNotes: '',
                    exhaustGasNotes: '',
                    energyInputExhaustGasNotes: '',
                    operationsNotes: ''
                }
            },
            {
                phast: {
                    losses: {
                        chargeMaterials: [
                            {
                                name: "Material #1",
                                solidChargeMaterial: {
                                    materialId: 13,
                                    thermicReactionType: 0,
                                    specificHeatSolid: 0.16,
                                    latentHeat: 60,
                                    specificHeatLiquid: 0.175,
                                    meltingPoint: 2800,
                                    chargeFeedRate: 400000,
                                    waterContentCharged: 0,
                                    waterContentDischarged: 0,
                                    initialTemperature: 300,
                                    dischargeTemperature: 2300,
                                    waterVaporDischargeTemperature: 0,
                                    chargeMelted: 0,
                                    chargeReacted: 1,
                                    reactionHeat: 50,
                                    additionalHeat: 0,
                                    heatRequired: 128.2
                                },
                                chargeMaterialType: "Solid"
                            }
                        ],
                        fixtureLosses: [],
                        wallLosses: [
                            {
                                surfaceArea: 11100,
                                ambientTemperature: 70,
                                surfaceTemperature: 200,
                                windVelocity: 0,
                                surfaceEmissivity: 0.9,
                                surfaceShape: 3,
                                conditionFactor: 1.394,
                                correctionFactor: 1,
                                name: "Loss #1",
                                heatLoss: 1.8968341486185003
                            }
                        ],
                        coolingLosses: [
                            {
                                name: "Loss #1",
                                coolingMedium: "Water",
                                liquidCoolingLoss: {
                                    flowRate: 3450,
                                    density: 8.338,
                                    initialTemperature: 77,
                                    outletTemperature: 91,
                                    specificHeat: 1,
                                    correctionFactor: 1
                                },
                                coolingLossType: "Liquid",
                                heatLoss: 24.163523999999995
                            }
                        ],
                        openingLosses: [
                            {
                                numberOfOpenings: 1,
                                emissivity: 0.9,
                                thickness: 16,
                                ambientTemperature: 70,
                                insideTemperature: 2000,
                                percentTimeOpen: 0,
                                viewFactor: 0.47,
                                openingType: "Rectangular (or Square)",
                                lengthOfOpening: 420,
                                heightOfOpening: 6,
                                name: "Fixed Opening",
                                heatLoss: 0
                            },
                            {
                                numberOfOpenings: 1,
                                emissivity: 0.9,
                                thickness: 16,
                                ambientTemperature: 70,
                                insideTemperature: 2400,
                                percentTimeOpen: 10,
                                viewFactor: 0.868,
                                openingType: "Rectangular (or Square)",
                                lengthOfOpening: 420,
                                heightOfOpening: 60,
                                name: "Variable Opening",
                                heatLoss: 1.564981814514721
                            }
                        ],
                        leakageLosses: [
                            {
                                draftPressure: 0.5,
                                openingArea: 2,
                                leakageGasTemperature: 500,
                                ambientTemperature: 70,
                                coefficient: 0.8052,
                                specificGravity: 1,
                                correctionFactor: 1,
                                name: "Loss #1",
                                heatLoss: 1.6313235858709099
                            }
                        ],
                        flueGasLosses: [
                            {
                                name: "Loss #1",
                                flueGasByVolume: {
                                    gasTypeId: 1,
                                    flueGasTemperature: 1800,
                                    oxygenCalculationMethod: "Oxygen in Flue Gas",
                                    excessAirPercentage: 9.90162160358751,
                                    o2InFlueGas: 2,
                                    combustionAirTemperature: 850,
                                    fuelTemperature: 65,
                                    CH4: 87,
                                    C2H6: 8.5,
                                    N2: 3.6,
                                    H2: 0.4,
                                    C3H8: 0,
                                    C4H10_CnH2n: 0,
                                    H2O: 0,
                                    CO: 0,
                                    CO2: 0.4,
                                    SO2: 0,
                                    O2: 0.1
                                },
                                flueGasType: "By Volume"
                            }
                        ]
                    },
                    name: "All Opportunities",
                    operatingCosts: {
                        fuelCost: 5,
                        steamCost: 8,
                        electricityCost: 0.05
                    },
                    operatingHours: {
                        weeksPerYear: 48,
                        daysPerWeek: 6,
                        shiftsPerDay: 2,
                        hoursPerShift: 12,
                        hoursPerYear: 6912,
                        isCalculated: true,
                        operatingConditions: "The furnace was running at the full load capacity during the PH assessment."
                    },
                    systemEfficiency: 90
                },
                notes: {
                    chargeNotes: '',
                    wallNotes: '',
                    atmosphereNotes: '',
                    fixtureNotes: '',
                    openingNotes: '',
                    coolingNotes: '',
                    flueGasNotes: '',
                    otherNotes: '',
                    leakageNotes: '',
                    extendedNotes: '',
                    slagNotes: '',
                    auxiliaryPowerNotes: '',
                    exhaustGasNotes: '',
                    energyInputExhaustGasNotes: '',
                    operationsNotes: ''
                }
            }
        ],
        setupDone: true,
        losses: {
            chargeMaterials: [
                {
                    name: "Material #1",
                    solidChargeMaterial: {
                        materialId: 13,
                        thermicReactionType: 0,
                        specificHeatSolid: 0.16,
                        latentHeat: 60,
                        specificHeatLiquid: 0.175,
                        meltingPoint: 2800,
                        chargeFeedRate: 400000,
                        waterContentCharged: 0,
                        waterContentDischarged: 0,
                        initialTemperature: 60,
                        dischargeTemperature: 2300,
                        waterVaporDischargeTemperature: 0,
                        chargeMelted: 0,
                        chargeReacted: 1,
                        reactionHeat: 50,
                        additionalHeat: 0,
                        heatRequired: 143.56
                    },
                    chargeMaterialType: "Solid"
                }
            ],
            fixtureLosses: [],
            wallLosses: [
                {
                    surfaceArea: 11100,
                    ambientTemperature: 70,
                    surfaceTemperature: 300,
                    windVelocity: 0,
                    surfaceEmissivity: 0.9,
                    surfaceShape: 3,
                    conditionFactor: 1.394,
                    correctionFactor: 1,
                    name: "Loss #1",
                    heatLoss: 4.358938052146501
                }
            ],
            coolingLosses: [
                {
                    name: "Loss #1",
                    coolingMedium: "Water",
                    liquidCoolingLoss: {
                        flowRate: 3450,
                        density: 8.338,
                        initialTemperature: 77,
                        outletTemperature: 91,
                        specificHeat: 1,
                        correctionFactor: 1
                    },
                    coolingLossType: "Liquid",
                    heatLoss: 24.163523999999995
                }
            ],
            openingLosses: [
                {
                    numberOfOpenings: 1,
                    emissivity: 0.9,
                    thickness: 16,
                    ambientTemperature: 70,
                    insideTemperature: 2000,
                    percentTimeOpen: 100,
                    viewFactor: 0.47,
                    openingType: "Rectangular (or Square)",
                    lengthOfOpening: 420,
                    heightOfOpening: 6,
                    name: "Fixed Opening",
                    heatLoss: null
                },
                {
                    numberOfOpenings: 1,
                    emissivity: 0.9,
                    thickness: 16,
                    ambientTemperature: 70,
                    insideTemperature: 2400,
                    percentTimeOpen: 15,
                    viewFactor: 0.868,
                    openingType: "Rectangular (or Square)",
                    lengthOfOpening: 420,
                    heightOfOpening: 60,
                    name: "Variable Opening",
                    heatLoss: null
                }
            ],
            leakageLosses: [
                {
                    draftPressure: 0.5,
                    openingArea: 4,
                    leakageGasTemperature: 500,
                    ambientTemperature: 70,
                    coefficient: 0.8052,
                    specificGravity: 1,
                    correctionFactor: 1,
                    name: "Loss #1",
                    heatLoss: 3.2626471717418197
                }
            ],
            flueGasLosses: [
                {
                    name: "Loss #1",
                    flueGasByVolume: {
                        gasTypeId: 1,
                        flueGasTemperature: 1800,
                        oxygenCalculationMethod: "Oxygen in Flue Gas",
                        excessAirPercentage: 36.51958277059165,
                        o2InFlueGas: 6,
                        combustionAirTemperature: 850,
                        fuelTemperature: 65,
                        CH4: 87,
                        C2H6: 8.5,
                        N2: 3.6,
                        H2: 0.4,
                        C3H8: 0,
                        C4H10_CnH2n: 0,
                        H2O: 0,
                        CO: 0,
                        CO2: 0.4,
                        SO2: 0,
                        O2: 0.1
                    },
                    flueGasType: "By Volume"
                }
            ]
        },
        disableSetupDialog: true,
        designedEnergy: {
            steam: false,
            electricity: false,
            fuel: true,
            zones: [
                {
                    name: "1 Top Preheat",
                    designedEnergyFuel: {
                        fuelType: 0,
                        percentCapacityUsed: 60,
                        totalBurnerCapacity: 169,
                        percentOperatingHours: 88
                    },
                    designedEnergyElectricity: {
                        kwRating: 0,
                        percentCapacityUsed: 0,
                        percentOperatingHours: 0
                    },
                    designedEnergySteam: {
                        totalHeat: 0,
                        steamFlow: 0,
                        percentCapacityUsed: 0,
                        percentOperatingHours: 0
                    }
                },
                {
                    name: "2 Bottom Preheat",
                    designedEnergyFuel: {
                        fuelType: 0,
                        percentCapacityUsed: 60,
                        totalBurnerCapacity: 169,
                        percentOperatingHours: 88
                    },
                    designedEnergyElectricity: {
                        kwRating: 0,
                        percentCapacityUsed: 0,
                        percentOperatingHours: 0
                    },
                    designedEnergySteam: {
                        totalHeat: 0,
                        steamFlow: 0,
                        percentCapacityUsed: 0,
                        percentOperatingHours: 0
                    }
                },
                {
                    name: "3 Top Heat",
                    designedEnergyFuel: {
                        fuelType: 0,
                        percentCapacityUsed: 80,
                        totalBurnerCapacity: 81.6,
                        percentOperatingHours: 88
                    },
                    designedEnergyElectricity: {
                        kwRating: 0,
                        percentCapacityUsed: 0,
                        percentOperatingHours: 0
                    },
                    designedEnergySteam: {
                        totalHeat: 0,
                        steamFlow: 0,
                        percentCapacityUsed: 0,
                        percentOperatingHours: 0
                    }
                },
                {
                    name: "4 Bottom Heat",
                    designedEnergyFuel: {
                        fuelType: 0,
                        percentCapacityUsed: 80,
                        totalBurnerCapacity: 102,
                        percentOperatingHours: 88
                    },
                    designedEnergyElectricity: {
                        kwRating: 0,
                        percentCapacityUsed: 0,
                        percentOperatingHours: 0
                    },
                    designedEnergySteam: {
                        totalHeat: 0,
                        steamFlow: 0,
                        percentCapacityUsed: 0,
                        percentOperatingHours: 0
                    }
                },
                {
                    name: "Screen",
                    designedEnergyFuel: {
                        fuelType: 0,
                        percentCapacityUsed: 40,
                        totalBurnerCapacity: 41.4,
                        percentOperatingHours: 88
                    },
                    designedEnergyElectricity: {
                        kwRating: 0,
                        percentCapacityUsed: 0,
                        percentOperatingHours: 0
                    },
                    designedEnergySteam: {
                        totalHeat: 0,
                        steamFlow: 0,
                        percentCapacityUsed: 0,
                        percentOperatingHours: 0
                    }
                },
                {
                    name: "Soak",
                    designedEnergyFuel: {
                        fuelType: 0,
                        percentCapacityUsed: 40,
                        totalBurnerCapacity: 34.8,
                        percentOperatingHours: 88
                    },
                    designedEnergyElectricity: {
                        kwRating: 0,
                        percentCapacityUsed: 0,
                        percentOperatingHours: 0
                    },
                    designedEnergySteam: {
                        totalHeat: 0,
                        steamFlow: 0,
                        percentCapacityUsed: 0,
                        percentOperatingHours: 0
                    }
                },
            ]
        },
        meteredEnergy: {
            steam: false,
            electricity: false,
            fuel: true,
            meteredEnergyElectricity: {
                electricityCollectionTime: 0,
                electricityUsed: 0,
                auxElectricityUsed: 0,
                auxElectricityCollectionTime: 0
            },
            meteredEnergyFuel: {
                fuelDescription: "gas",
                fuelType: 0,
                heatingValue: 0,
                collectionTime: 0,
                electricityUsed: 0,
                electricityCollectionTime: 0,
                fuelEnergy: 0
            },
            meteredEnergySteam: {
                totalHeatSteam: 0,
                flowRate: 0,
                collectionTime: 0,
                electricityUsed: 0,
                electricityCollectionTime: 0
            }
        },
        auxEquipment: [
            {
                name: "Equipment #1",
                dutyCycle: 100,
                motorPower: "Calculated",
                motorPhase: "3",
                supplyVoltage: 0,
                averageCurrent: 0,
                powerFactor: 0.85,
                totalConnectedPower: 0,
                ratedCapacity: 0
            }
        ]
    },
    directoryId: 2
}

export const MockPhastSettings: Settings = {
    language: "English",
    currency: "$ - US Dollar",
    unitsOfMeasure: "Imperial",
    distanceMeasurement: "ft",
    flowMeasurement: "gpm",
    powerMeasurement: "hp",
    pressureMeasurement: "psi",
    currentMeasurement: null,
    viscosityMeasurement: null,
    voltageMeasurement: null,
    energySourceType: "Fuel",
    customFurnaceName: null,
    temperatureMeasurement: "F",
    steamTemperatureMeasurement: "F",
    steamPressureMeasurement: "psig",
    steamSpecificEnthalpyMeasurement: "btuLb",
    steamSpecificEntropyMeasurement: "btulbF",
    steamSpecificVolumeMeasurement: "ft3lb",
    steamMassFlowMeasurement: "klb",
    fuelCost: 3.99,
    steamCost: 4.69,
    electricityCost: 0.066,
    defaultPanelTab: 'help',
    phastRollupFuelUnit: 'MMBtu',
    phastRollupElectricityUnit: 'kWh',
    phastRollupSteamUnit: 'MMBtu',
    energyResultUnit: "MMBtu",
    phastRollupUnit: 'MMBtu',
    appVersion: packageJson.version,
    facilityInfo: {
        companyName: 'ORNL',
        facilityName: 'ORNL Test Facility',
        address: {
            street: '1 Bethel Valley Rd.',
            city: 'Oak Ridge',
            state: 'TN',
            country: 'U.S.',
            zip: '37831'
        },
        facilityContact: {
            contactName: 'T. Owner',
            phoneNumber: 8655767658,
            email: 't.owner@ornl.com'
        },
        assessmentContact: {
            contactName: 'D.O. Energy',
            phoneNumber: 1234567890,
            email: 'AMO_ToolHelpDesk@ee.doe.gov'
        }
    }
}
