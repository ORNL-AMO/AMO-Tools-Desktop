import { Assessment } from "../shared/models/assessment";
import { Settings } from "../shared/models/settings";

export const MockSsmt: Assessment = {
    "name": "Steam Example",
    "type": "SSMT",
    "isExample": true,
    "ssmt": {
        "name": "Baseline",
        "setupDone": true,
        "operatingHours": {
            "weeksPerYear": 52,
            "daysPerWeek": 7,
            // "shiftsPerDay": 3,
            // "hoursPerShift": 8,
            "hoursPerYear": 8000
        },
        "operatingCosts": {
            "fuelCost": 5.78,
            "electricityCost": 0.05,
            "makeUpWaterCost": 0.0025,
            "implementationCosts": 0,
        },
        "generalSteamOperations": {
            "sitePowerImport": 5000,
            "makeUpWaterTemperature": 50
        },
        "equipmentNotes": "",
        "turbineInput": {
            "condensingTurbine": {
                "useTurbine": false,
                "operationType": 0
            },
            "highToLowTurbine": {
                "isentropicEfficiency": 65,
                "generationEfficiency": 100,
                "operationType": 2,
                "operationValue1": null,
                "operationValue2": null,
                "useTurbine": true
            },
            "highToMediumTurbine": {
                "isentropicEfficiency": 65,
                "generationEfficiency": 100,
                "operationType": 2,
                "operationValue1": null,
                "operationValue2": null,
                "useTurbine": true
            },
            "mediumToLowTurbine": {
                "useTurbine": false,
                "operationType": 0
            }
        },
        "modifications": [
            {
                "ssmt": {
                    "name": "Remove Turbines",
                    "setupDone": true,
                    "operatingHours": {
                        "weeksPerYear": 52,
                        "daysPerWeek": 7,
                        // "shiftsPerDay": 3,
                        // "hoursPerShift": 8,
                        "hoursPerYear": 8000
                    },
                    "operatingCosts": {
                        "fuelCost": 5.78,
                        "electricityCost": 0.05,
                        "makeUpWaterCost": 0.0025,
                        "implementationCosts": 0,
                    },
                    "generalSteamOperations": {
                        "sitePowerImport": 5000,
                        "makeUpWaterTemperature": 50
                    },
                    "equipmentNotes": "",
                    "turbineInput": {
                        "condensingTurbine": {
                            "useTurbine": false,
                            "operationType": 0
                        },
                        "highToLowTurbine": {
                            "isentropicEfficiency": 65,
                            "generationEfficiency": 100,
                            "operationType": 2,
                            "operationValue1": null,
                            "operationValue2": null,
                            "useTurbine": false
                        },
                        "highToMediumTurbine": {
                            "isentropicEfficiency": 65,
                            "generationEfficiency": 100,
                            "operationType": 2,
                            "operationValue1": null,
                            "operationValue2": null,
                            "useTurbine": false
                        },
                        "mediumToLowTurbine": {
                            "useTurbine": false,
                            "operationType": 0
                        }
                    },
                    "modifications": [],
                    "boilerInput": {
                        "fuelType": 1,
                        "fuel": 1,
                        "combustionEfficiency": 85,
                        "blowdownRate": 2,
                        "blowdownFlashed": false,
                        "preheatMakeupWater": false,
                        "steamTemperature": 588.9,
                        "deaeratorVentRate": 0.1,
                        "deaeratorPressure": 15,
                        "approachTemperature": undefined
                    },
                    "headerInput": {
                        "numberOfHeaders": 3,
                        "highPressureHeader": {
                            "pressure": 600,
                            "processSteamUsage": 50,
                            "condensationRecoveryRate": 50,
                            "heatLoss": 0.1,
                            "condensateReturnTemperature": 150,
                            "flashCondensateReturn": false
                        },
                        "mediumPressureHeader": {
                            "pressure": 150,
                            "processSteamUsage": 100,
                            "condensationRecoveryRate": 50,
                            "heatLoss": 0.1,
                            "flashCondensateIntoHeader": false,
                            "desuperheatSteamIntoNextHighest": false,
                            "desuperheatSteamTemperature": null,
                            "useBaselineProcessSteamUsage": true
                        },
                        "lowPressureHeader": {
                            "pressure": 20,
                            "processSteamUsage": 200,
                            "condensationRecoveryRate": 50,
                            "heatLoss": 0.1,
                            "flashCondensateIntoHeader": false,
                            "desuperheatSteamIntoNextHighest": false,
                            "desuperheatSteamTemperature": null,
                            "useBaselineProcessSteamUsage": true
                        }
                    }
                },
                "exploreOpportunities": true
            },
            {
                "ssmt": {
                    "name": "Flash Condensate",
                    "setupDone": true,
                    "operatingHours": {
                        "weeksPerYear": 52,
                        "daysPerWeek": 7,
                        // "shiftsPerDay": 3,
                        // "hoursPerShift": 8,
                        "hoursPerYear": 8000
                    },
                    "operatingCosts": {
                        "fuelCost": 5.78,
                        "electricityCost": 0.05,
                        "makeUpWaterCost": 0.0025,
                        "implementationCosts": 0,
                    },
                    "generalSteamOperations": {
                        "sitePowerImport": 5000,
                        "makeUpWaterTemperature": 50
                    },
                    "equipmentNotes": "",
                    "turbineInput": {
                        "condensingTurbine": {
                            "useTurbine": false,
                            "operationType": 0
                        },
                        "highToLowTurbine": {
                            "isentropicEfficiency": 65,
                            "generationEfficiency": 100,
                            "operationType": 2,
                            "operationValue1": null,
                            "operationValue2": null,
                            "useTurbine": true
                        },
                        "highToMediumTurbine": {
                            "isentropicEfficiency": 65,
                            "generationEfficiency": 100,
                            "operationType": 2,
                            "operationValue1": null,
                            "operationValue2": null,
                            "useTurbine": true
                        },
                        "mediumToLowTurbine": {
                            "useTurbine": false,
                            "operationType": 0
                        }
                    },
                    "modifications": [],
                    "boilerInput": {
                        "fuelType": 1,
                        "fuel": 1,
                        "combustionEfficiency": 85,
                        "blowdownRate": 2,
                        "blowdownFlashed": true,
                        "preheatMakeupWater": false,
                        "steamTemperature": 588.9,
                        "deaeratorVentRate": 0.1,
                        "deaeratorPressure": 15,
                        "approachTemperature": undefined
                    },
                    "headerInput": {
                        "numberOfHeaders": 3,
                        "highPressureHeader": {
                            "pressure": 600,
                            "processSteamUsage": 50,
                            "condensationRecoveryRate": 50,
                            "heatLoss": 0.1,
                            "condensateReturnTemperature": 150,
                            "flashCondensateReturn": false
                        },
                        "mediumPressureHeader": {
                            "pressure": 150,
                            "processSteamUsage": 100,
                            "condensationRecoveryRate": 50,
                            "heatLoss": 0.1,
                            "flashCondensateIntoHeader": true,
                            "desuperheatSteamIntoNextHighest": false,
                            "desuperheatSteamTemperature": null,
                            "useBaselineProcessSteamUsage": true
                        },
                        "lowPressureHeader": {
                            "pressure": 20,
                            "processSteamUsage": 200,
                            "condensationRecoveryRate": 50,
                            "heatLoss": 0.1,
                            "flashCondensateIntoHeader": true,
                            "desuperheatSteamIntoNextHighest": false,
                            "desuperheatSteamTemperature": null,
                            "useBaselineProcessSteamUsage": true
                        }
                    }
                },
                "exploreOpportunities": true
            },
            {
                "ssmt": {
                    "name": "Increase Condensate Recovery",
                    "setupDone": true,
                    "operatingHours": {
                        "weeksPerYear": 52,
                        "daysPerWeek": 7,
                        // "shiftsPerDay": 3,
                        // "hoursPerShift": 8,
                        "hoursPerYear": 8000
                    },
                    "operatingCosts": {
                        "fuelCost": 5.78,
                        "electricityCost": 0.05,
                        "makeUpWaterCost": 0.0025,
                        "implementationCosts": 0,
                    },
                    "generalSteamOperations": {
                        "sitePowerImport": 5000,
                        "makeUpWaterTemperature": 50
                    },
                    "equipmentNotes": "",
                    "turbineInput": {
                        "condensingTurbine": {
                            "useTurbine": false,
                            "operationType": 0
                        },
                        "highToLowTurbine": {
                            "isentropicEfficiency": 65,
                            "generationEfficiency": 100,
                            "operationType": 2,
                            "operationValue1": null,
                            "operationValue2": null,
                            "useTurbine": true
                        },
                        "highToMediumTurbine": {
                            "isentropicEfficiency": 65,
                            "generationEfficiency": 100,
                            "operationType": 2,
                            "operationValue1": null,
                            "operationValue2": null,
                            "useTurbine": true
                        },
                        "mediumToLowTurbine": {
                            "useTurbine": false,
                            "operationType": 0
                        }
                    },
                    "modifications": [],
                    "boilerInput": {
                        "fuelType": 1,
                        "fuel": 1,
                        "combustionEfficiency": 85,
                        "blowdownRate": 2,
                        "blowdownFlashed": false,
                        "preheatMakeupWater": false,
                        "steamTemperature": 588.9,
                        "deaeratorVentRate": 0.1,
                        "deaeratorPressure": 15,
                        "approachTemperature": undefined
                    },
                    "headerInput": {
                        "numberOfHeaders": 3,
                        "highPressureHeader": {
                            "pressure": 600,
                            "processSteamUsage": 50,
                            "condensationRecoveryRate": 75,
                            "heatLoss": 0.1,
                            "condensateReturnTemperature": 150,
                            "flashCondensateReturn": false
                        },
                        "mediumPressureHeader": {
                            "pressure": 150,
                            "processSteamUsage": 100,
                            "condensationRecoveryRate": 75,
                            "heatLoss": 0.1,
                            "flashCondensateIntoHeader": false,
                            "desuperheatSteamIntoNextHighest": false,
                            "desuperheatSteamTemperature": null,
                            "useBaselineProcessSteamUsage": true
                        },
                        "lowPressureHeader": {
                            "pressure": 20,
                            "processSteamUsage": 200,
                            "condensationRecoveryRate": 75,
                            "heatLoss": 0.1,
                            "flashCondensateIntoHeader": false,
                            "desuperheatSteamIntoNextHighest": false,
                            "desuperheatSteamTemperature": null,
                            "useBaselineProcessSteamUsage": true
                        }
                    },
                },
                "exploreOpportunities": true
            }
        ],
        "boilerInput": {
            "fuelType": 1,
            "fuel": 1,
            "combustionEfficiency": 85,
            "blowdownRate": 2,
            "blowdownFlashed": false,
            "preheatMakeupWater": false,
            "steamTemperature": 588.9,
            "deaeratorVentRate": 0.1,
            "deaeratorPressure": 15,
            "approachTemperature": undefined
        },
        "headerInput": {
            "numberOfHeaders": 3,
            "highPressureHeader": {
                "pressure": 600,
                "processSteamUsage": 50,
                "condensationRecoveryRate": 50,
                "heatLoss": 0.1,
                "condensateReturnTemperature": 150,
                "flashCondensateReturn": false
            },
            "mediumPressureHeader": {
                "pressure": 150,
                "processSteamUsage": 100,
                "condensationRecoveryRate": 50,
                "heatLoss": 0.1,
                "flashCondensateIntoHeader": false,
                "desuperheatSteamIntoNextHighest": false,
                "desuperheatSteamTemperature": null,
                "useBaselineProcessSteamUsage": true
            },
            "lowPressureHeader": {
                "pressure": 20,
                "processSteamUsage": 200,
                "condensationRecoveryRate": 50,
                "heatLoss": 0.1,
                "flashCondensateIntoHeader": false,
                "desuperheatSteamIntoNextHighest": false,
                "desuperheatSteamTemperature": null,
                "useBaselineProcessSteamUsage": true
            }
        }
    }
}


export const MockSsmtSettings: Settings = {
    "language": "English",
    "currency": "$",
    "unitsOfMeasure": "Imperial",
    "distanceMeasurement": "ft",
    "flowMeasurement": "gpm",
    "powerMeasurement": "hp",
    "pressureMeasurement": "psi",
    "steamPressureMeasurement": "psig",
    "steamTemperatureMeasurement": "F",
    "steamSpecificEnthalpyMeasurement": "btuLb",
    "steamSpecificEntropyMeasurement": "btulbF",
    "steamSpecificVolumeMeasurement": "ft3lb",
    "steamMassFlowMeasurement": "klb",
    "steamPowerMeasurement": "kW",
    "steamVolumeMeasurement": "gal",
    "steamVolumeFlowMeasurement": "gpm",
    "steamVacuumPressure": "psia",
    "currentMeasurement": null,
    "viscosityMeasurement": null,
    "voltageMeasurement": null,
    "energySourceType": "Fuel",
    "furnaceType": null,
    "energyResultUnit": "MMBtu",
    "customFurnaceName": null,
    "temperatureMeasurement": "F",
    "appVersion": "0.3.3-beta",
    "fanCurveType": null,
    "fanConvertedConditions": null,
    "phastRollupUnit": "MMBtu",
    "phastRollupFuelUnit": "MMBtu",
    "phastRollupElectricityUnit": "MMBtu",
    "phastRollupSteamUnit": "MMBtu",
    "defaultPanelTab": "results",
    "fuelCost": 3.99,
    "steamCost": 4.69,
    "electricityCost": 0.066,
    "densityMeasurement": "lbscf",
    "fanFlowRate": "ft3/min",
    "fanPressureMeasurement": "inH2o",
    "fanBarometricPressure": "inHg",
    "fanSpecificHeatGas": "btulbF",
    "fanPowerMeasurement": "hp",
    "fanTemperatureMeasurement": "F",
    "steamEnergyMeasurement": "MMBtu",
    "disableTutorial": true,
    "disableDashboardTutorial": true,
    "disablePsatSetupTutorial": true,
    "disablePsatAssessmentTutorial": true,
    "disablePsatReportTutorial": true,
    "disablePhastSetupTutorial": true,
    "disablePhastAssessmentTutorial": true,
    "disablePhastReportTutorial": true,
    "disableFsatSetupTutorial": true,
    "disableFsatAssessmentTutorial": true,
    "disableFsatReportTutorial": true,
    "commonRollupUnit": "MMBtu",
    "pumpsRollupUnit": "MWh",
    "fansRollupUnit": "MWh",
    "steamRollupUnit": "MMBtu",
    "wasteWaterRollupUnit": "kWh",
    "compressedAirRollupUnit": "kWh"
}