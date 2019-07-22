import { Assessment } from "../shared/models/assessment";
import { Settings } from "../shared/models/settings";

export const MockTreasureHunt: Assessment = {
    "name": "Treasure Hunt Example",
    "type": "TreasureHunt",
    "isExample": true,
    "treasureHunt": {
        "name": "Treasure Hunt",
        "setupDone": true,
        "operatingHours": {
            "weeksPerYear": 52,
            "daysPerWeek": 7,
            "shiftsPerDay": 3,
            "hoursPerShift": 8,
            "hoursPerYear": 8760,
            "isCalculated": false
        },
        "currentEnergyUsage": {
            "electricityUsage": 32000000,
            "electricityCosts": 1600000,
            "electricityUsed": true,
            "naturalGasUsage": 125000,
            "naturalGasCosts": 500000,
            "naturalGasUsed": true,
            "otherFuelUsage": 0,
            "otherFuelCosts": 0,
            "otherFuelUsed": false,
            "waterUsage": 40000000,
            "waterCosts": 100000,
            "waterUsed": true,
            "wasteWaterUsage": 0,
            "wasteWaterCosts": 0,
            "wasteWaterUsed": false,
            "compressedAirUsage": 0,
            "compressedAirCosts": 0,
            "compressedAirUsed": false,
            "steamUsage": 0,
            "steamCosts": 0,
            "steamUsed": false
        },
        "naturalGasReductions": [
            {
                "baseline": [
                    {
                        "name": "Equipment #1",
                        "operatingHours": 8760,
                        "fuelCost": 4,
                        "measurementMethod": 0,
                        "flowMeterMethodData": {
                            "flowRate": 5
                        },
                        "otherMethodData": {
                            "consumption": 89900
                        },
                        "airMassFlowData": {
                            "isNameplate": true,
                            "airMassFlowMeasuredData": {
                                "areaOfDuct": 5,
                                "airVelocity": 10
                            },
                            "airMassFlowNameplateData": { "airFlow": 50 },
                            "inletTemperature": 25,
                            "outletTemperature": 40,
                            "systemEfficiency": 80
                        },
                        "waterMassFlowData": {
                            "waterFlow": 25,
                            "inletTemperature": 25,
                            "outletTemperature": 40,
                            "systemEfficiency": 80
                        },
                        "units": 1
                    }],
                "modification": [{
                    "name": "Equipment #1",
                    "operatingHours": 8760,
                    "fuelCost": 4,
                    "measurementMethod": 3,
                    "flowMeterMethodData": { "flowRate": 5 },
                    "otherMethodData": { "consumption": 39000 },
                    "airMassFlowData": {
                        "isNameplate": true,
                        "airMassFlowMeasuredData": {
                            "areaOfDuct": 5,
                            "airVelocity": 10
                        },
                        "airMassFlowNameplateData": { "airFlow": 50 },
                        "inletTemperature": 25,
                        "outletTemperature": 40,
                        "systemEfficiency": 80
                    },
                    "waterMassFlowData": {
                        "waterFlow": 25,
                        "inletTemperature": 25,
                        "outletTemperature": 40,
                        "systemEfficiency": 80
                    },
                    "units": 1
                }],
                "selected": true,
                "opportunitySheet": {
                    "name": "Insulate Hoses in Yard",
                    "equipment": "Boiler",
                    "description": "",
                    "originator": "",
                    "date": new Date(),
                    "owner": "Chuck",
                    "businessUnits": "Product 1",
                    "opportunityCost": {
                        "engineeringServices": 200,
                        "material": 9000,
                        "otherCosts": [],
                        "costDescription": "",
                        "labor": 300
                    },
                    "baselineEnergyUseItems": [{
                        "type": "Electricity",
                        "amount": 0
                    }],
                    "modificationEnergyUseItems": []
                }
            }, {
                "baseline": [{
                    "name": "Equipment #1",
                    "operatingHours": 8760,
                    "fuelCost": 4,
                    "measurementMethod": 3,
                    "flowMeterMethodData": { "flowRate": 5 },
                    "otherMethodData": { "consumption": 125 },
                    "airMassFlowData": {
                        "isNameplate": true,
                        "airMassFlowMeasuredData": {
                            "areaOfDuct": 5,
                            "airVelocity": 10
                        },
                        "airMassFlowNameplateData": { "airFlow": 50 },
                        "inletTemperature": 25,
                        "outletTemperature": 40,
                        "systemEfficiency": 80
                    },
                    "waterMassFlowData": {
                        "waterFlow": 25,
                        "inletTemperature": 25,
                        "outletTemperature": 40,
                        "systemEfficiency": 80
                    },
                    "units": 1
                }],
                "modification": [{
                    "name": "Equipment #1",
                    "operatingHours": 8760,
                    "fuelCost": 4,
                    "measurementMethod": 3,
                    "flowMeterMethodData": { "flowRate": 5 },
                    "otherMethodData": { "consumption": 0 },
                    "airMassFlowData": {
                        "isNameplate": true,
                        "airMassFlowMeasuredData": {
                            "areaOfDuct": 5,
                            "airVelocity": 10
                        },
                        "airMassFlowNameplateData": { "airFlow": 50 },
                        "inletTemperature": 25,
                        "outletTemperature": 40,
                        "systemEfficiency": 80
                    },
                    "waterMassFlowData": {
                        "waterFlow": 25,
                        "inletTemperature": 25,
                        "outletTemperature": 40,
                        "systemEfficiency": 80
                    },
                    "units": 1
                }],
                "selected": true,
                "opportunitySheet": {
                    "name": "Pump Insulation",
                    "equipment": "Pumps 1 & 2",
                    "description": "Add insulation to 2 pumps",
                    "originator": "",
                    "date": new Date(),
                    "owner": "Anandi",
                    "businessUnits": "Process 1",
                    "opportunityCost": {
                        "engineeringServices": 200,
                        "material": 300,
                        "otherCosts": [],
                        "costDescription": "",
                        "labor": 200
                    },
                    "baselineEnergyUseItems": [{
                        "type": "Electricity",
                        "amount": 0
                    }],
                    "modificationEnergyUseItems": []
                }
            }, {
                "baseline": [{
                    "name": "Equipment #1",
                    "operatingHours": 8760,
                    "fuelCost": 4,
                    "measurementMethod": 0,
                    "flowMeterMethodData": { "flowRate": 5 },
                    "otherMethodData": { "consumption": 89900 },
                    "airMassFlowData": {
                        "isNameplate": true,
                        "airMassFlowMeasuredData": {
                            "areaOfDuct": 5,
                            "airVelocity": 10
                        },
                        "airMassFlowNameplateData": { "airFlow": 50 },
                        "inletTemperature": 25,
                        "outletTemperature": 40,
                        "systemEfficiency": 80
                    },
                    "waterMassFlowData": {
                        "waterFlow": 25,
                        "inletTemperature": 25,
                        "outletTemperature": 40,
                        "systemEfficiency": 80
                    },
                    "units": 1
                }],
                "modification": [{
                    "name": "Equipment #1",
                    "operatingHours": 8760,
                    "fuelCost": 4,
                    "measurementMethod": 3,
                    "flowMeterMethodData": { "flowRate": 5 },
                    "otherMethodData": { "consumption": 44894 },
                    "airMassFlowData": {
                        "isNameplate": true,
                        "airMassFlowMeasuredData": {
                            "areaOfDuct": 5,
                            "airVelocity": 10
                        },
                        "airMassFlowNameplateData": { "airFlow": 50 },
                        "inletTemperature": 25,
                        "outletTemperature": 40,
                        "systemEfficiency": 80
                    },
                    "waterMassFlowData": {
                        "waterFlow": 25,
                        "inletTemperature": 25,
                        "outletTemperature": 40,
                        "systemEfficiency": 80
                    },
                    "units": 1
                }],
                "selected": true,
                "opportunitySheet": {
                    "name": "Insulate pipe near burner",
                    "equipment": "Boiler",
                    "description": "",
                    "originator": "",
                    "date": new Date(),
                    "owner": "Dianna",
                    "businessUnits": "Process 1",
                    "opportunityCost": {
                        "engineeringServices": 0,
                        "material": 0,
                        "otherCosts": [],
                        "costDescription": "",
                        "labor": 0
                    },
                    "baselineEnergyUseItems": [{
                        "type": "Electricity",
                        "amount": 0
                    }],
                    "modificationEnergyUseItems": []
                }
            }],
        "lightingReplacements": [{
            "baseline": [{
                "name": "Fixture #1",
                "hoursPerYear": 8760,
                "wattsPerLamp": 250,
                "lampsPerFixture": 5,
                "numberOfFixtures": 5,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 54750
            }, {
                "name": "Fixture #2",
                "hoursPerYear": 8760,
                "wattsPerLamp": 400,
                "lampsPerFixture": 1,
                "numberOfFixtures": 5,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 17520
            }, {
                "name": "Fixture #3",
                "hoursPerYear": 8760,
                "wattsPerLamp": 100,
                "lampsPerFixture": 1,
                "numberOfFixtures": 5,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 4380
            }, {
                "name": "Fixture #4",
                "hoursPerYear": 8760,
                "wattsPerLamp": 150,
                "lampsPerFixture": 1,
                "numberOfFixtures": 4,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 5256
            }],
            "modifications": [{
                "name": "Fixture #1",
                "hoursPerYear": 8760,
                "wattsPerLamp": 50,
                "lampsPerFixture": 5,
                "numberOfFixtures": 5,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 10950
            }, {
                "name": "Fixture #2",
                "hoursPerYear": 8760,
                "wattsPerLamp": 50,
                "lampsPerFixture": 1,
                "numberOfFixtures": 5,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 2190
            }, {
                "name": "Fixture #3",
                "hoursPerYear": 8760,
                "wattsPerLamp": 20,
                "lampsPerFixture": 1,
                "numberOfFixtures": 5,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 876
            }, {
                "name": "Fixture #4",
                "hoursPerYear": 8760,
                "wattsPerLamp": 20,
                "lampsPerFixture": 1,
                "numberOfFixtures": 4,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 700.8000000000001
            }],
            "baselineElectricityCost": 0.05,
            "modificationElectricityCost": 0.05,
            "selected": true,
            "opportunitySheet": {
                "name": "Yard Lighting Replacement",
                "equipment": "Lighting",
                "description": "",
                "originator": "",
                "date": new Date(),
                "owner": "Webster",
                "businessUnits": "Exterior",
                "opportunityCost": {
                    "engineeringServices": 100,
                    "material": 18000,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 1000
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": []
            }
        }, {
            "baseline": [{
                "name": "Metal Halide 175W",
                "hoursPerYear": 8760,
                "wattsPerLamp": 175,
                "lampsPerFixture": 2,
                "numberOfFixtures": 50,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 153300
            }, {
                "name": "Metal Halide 400W",
                "hoursPerYear": 8760,
                "wattsPerLamp": 400,
                "lampsPerFixture": 1,
                "numberOfFixtures": 25,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 87600
            }, {
                "name": "Metal Halide 250W",
                "hoursPerYear": 8760,
                "wattsPerLamp": 250,
                "lampsPerFixture": 2,
                "numberOfFixtures": 20,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 87600
            }],
            "modifications": [{
                "name": "LED 25W",
                "hoursPerYear": 8760,
                "wattsPerLamp": 25,
                "lampsPerFixture": 2,
                "numberOfFixtures": 50,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 21900
            }, {
                "name": "LED 30W",
                "hoursPerYear": 8760,
                "wattsPerLamp": 30,
                "lampsPerFixture": 1,
                "numberOfFixtures": 25,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 6570
            }, {
                "name": "Fixture #3",
                "hoursPerYear": 8760,
                "wattsPerLamp": 30,
                "lampsPerFixture": 1,
                "numberOfFixtures": 20,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 5256
            }],
            "baselineElectricityCost": 0.05,
            "modificationElectricityCost": 0.05,
            "selected": true,
            "opportunitySheet": {
                "name": "Office Lighting",
                "equipment": "Lighting",
                "description": "Various lighting replacements",
                "originator": "",
                "date": new Date(),
                "owner": "Alex",
                "businessUnits": "Facilities",
                "opportunityCost": {
                    "engineeringServices": 500,
                    "material": 15000,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 1000
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": []
            }
        }, {
            "baseline": [{
                "name": "T5",
                "hoursPerYear": 8760,
                "wattsPerLamp": 54,
                "lampsPerFixture": 4,
                "numberOfFixtures": 500,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 946080
            }],
            "modifications": [{
                "name": "LED",
                "hoursPerYear": 8760,
                "wattsPerLamp": 20,
                "lampsPerFixture": 4,
                "numberOfFixtures": 500,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 350400
            }],
            "baselineElectricityCost": 0.05,
            "modificationElectricityCost": 0.05,
            "selected": true,
            "opportunitySheet": {
                "name": "Process Lighting A",
                "equipment": "Lighting",
                "description": "Replace T5s with LEDs",
                "originator": "",
                "date": new Date(),
                "owner": "Daniella",
                "businessUnits": "Process",
                "opportunityCost": {
                    "engineeringServices": 1000,
                    "material": 27000,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 3000
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": []
            }
        }, {
            "baseline": [{
                "name": "T8",
                "hoursPerYear": 8760,
                "wattsPerLamp": 32,
                "lampsPerFixture": 4,
                "numberOfFixtures": 75,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 84096
            }],
            "modifications": [{
                "name": "LED",
                "hoursPerYear": 8760,
                "wattsPerLamp": 20,
                "lampsPerFixture": 4,
                "numberOfFixtures": 75,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 52560
            }],
            "baselineElectricityCost": 0.05,
            "modificationElectricityCost": 0.05,
            "selected": true,
            "opportunitySheet": {
                "name": "Process Lighting B",
                "equipment": "Lighting",
                "description": "upgrade side room lighting",
                "originator": "",
                "date": new Date(),
                "owner": "Daniella",
                "businessUnits": "Process",
                "opportunityCost": {
                    "engineeringServices": 100,
                    "material": 6000,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 300
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": []
            }
        }],
        "compressedAirReductions": [{
            "baseline": [{
                "name": "Equipment #1",
                "hoursPerYear": 8760,
                "utilityType": 1,
                "utilityCost": 0.05,
                "compressedAirCost": 0.02,
                "electricityCost": 0.05,
                "measurementMethod": 1,
                "flowMeterMethodData": { "meterReading": 0.2 },
                "bagMethodData": {
                    "height": 46,
                    "diameter": 40,
                    "fillTime": 10
                },
                "pressureMethodData": {
                    "nozzleType": 0,
                    "numberOfNozzles": 3,
                    "supplyPressure": 80
                },
                "otherMethodData": { "consumption": 1750 },
                "compressorElectricityData": {
                    "compressorControl": 1,
                    "compressorControlAdjustment": 40,
                    "compressorSpecificPowerControl": 0,
                    "compressorSpecificPower": 0.16
                },
                "units": 3
            }],
            "modification": [{
                "name": "Equipment #1",
                "hoursPerYear": 8760,
                "utilityType": 1,
                "utilityCost": 0.05,
                "compressedAirCost": 0.02,
                "electricityCost": 0.05,
                "measurementMethod": 3,
                "flowMeterMethodData": { "meterReading": 0.2 },
                "bagMethodData": {
                    "height": 8,
                    "diameter": 12,
                    "fillTime": 80
                },
                "pressureMethodData": {
                    "nozzleType": 0,
                    "numberOfNozzles": 3,
                    "supplyPressure": 80
                },
                "otherMethodData": { "consumption": 0 },
                "compressorElectricityData": {
                    "compressorControl": 0,
                    "compressorControlAdjustment": 25,
                    "compressorSpecificPowerControl": 0,
                    "compressorSpecificPower": 0.16
                },
                "units": 1
            }],
            "selected": true,
            "opportunitySheet": {
                "name": "Eliminate Air Leaks",
                "equipment": "Compressor",
                "description": "",
                "originator": "",
                "date": new Date(),
                "owner": "Ravinder",
                "businessUnits": "Facilities",
                "opportunityCost": {
                    "engineeringServices": 0,
                    "material": 0,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 100
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": []
            }
        }, {
            "baseline": [{
                "name": "Equipment #1",
                "hoursPerYear": 8760,
                "utilityType": 1,
                "utilityCost": 0.05,
                "compressedAirCost": 0.02,
                "electricityCost": 0.05,
                "measurementMethod": 0,
                "flowMeterMethodData": { "meterReading": 6000 },
                "bagMethodData": {
                    "height": 8,
                    "diameter": 12,
                    "fillTime": 80
                },
                "pressureMethodData": {
                    "nozzleType": 0,
                    "numberOfNozzles": 3,
                    "supplyPressure": 80
                },
                "otherMethodData": { "consumption": 1750 },
                "compressorElectricityData": {
                    "compressorControl": 0,
                    "compressorControlAdjustment": 25,
                    "compressorSpecificPowerControl": 0,
                    "compressorSpecificPower": 0.16
                },
                "units": 1
            }],
            "modification": [{
                "name": "Equipment #1",
                "hoursPerYear": 8760,
                "utilityType": 1,
                "utilityCost": 0.05,
                "compressedAirCost": 0.02,
                "electricityCost": 0.05,
                "measurementMethod": 0,
                "flowMeterMethodData": { "meterReading": 5600 },
                "bagMethodData": {
                    "height": 8,
                    "diameter": 12,
                    "fillTime": 80
                },
                "pressureMethodData": {
                    "nozzleType": 0,
                    "numberOfNozzles": 3,
                    "supplyPressure": 80
                },
                "otherMethodData": { "consumption": 1750 },
                "compressorElectricityData": {
                    "compressorControl": 0,
                    "compressorControlAdjustment": 25,
                    "compressorSpecificPowerControl": 0,
                    "compressorSpecificPower": 0.16
                },
                "units": 1
            }],
            "selected": true,
            "opportunitySheet": {
                "name": "CA Pressure Reduction",
                "equipment": "Compressor",
                "description": "Reduce compressed air pressure 10 lbs",
                "originator": "",
                "date": new Date(),
                "owner": "Ravinder",
                "businessUnits": "Facilities",
                "opportunityCost": {
                    "engineeringServices": 100,
                    "material": 0,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 0
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": []
            }
        }],
        "electricityReductions": [{
            "baseline": [{
                "name": "Cooling Tower Pump 1",
                "operatingHours": 8760,
                "electricityCost": 0.05,
                "measurementMethod": 1,
                "multimeterData": {
                    "numberOfPhases": 3,
                    "supplyVoltage": 0,
                    "averageCurrent": 0,
                    "powerFactor": 0.85
                },
                "nameplateData": {
                    "ratedMotorPower": 200,
                    "variableSpeedMotor": true,
                    "operationalFrequency": 50,
                    "lineFrequency": 60,
                    "motorAndDriveEfficiency": 92,
                    "loadFactor": 90
                },
                "powerMeterData": { "power": 50 },
                "otherMethodData": { "energy": 400000 },
                "units": 1
            }, {
                "name": "Cooling Tower Pump 2",
                "operatingHours": 8760,
                "electricityCost": 0.05,
                "measurementMethod": 1,
                "multimeterData": {
                    "numberOfPhases": 3,
                    "supplyVoltage": 0,
                    "averageCurrent": 0,
                    "powerFactor": 0.85
                },
                "nameplateData": {
                    "ratedMotorPower": 100,
                    "variableSpeedMotor": true,
                    "operationalFrequency": 50,
                    "lineFrequency": 60,
                    "motorAndDriveEfficiency": 94,
                    "loadFactor": 90
                },
                "powerMeterData": { "power": 50 },
                "otherMethodData": { "energy": 400000 },
                "units": 1
            }],
            "modification": [{
                "name": "Cooling Tower Pump 1",
                "operatingHours": 7000,
                "electricityCost": 0.05,
                "measurementMethod": 1,
                "multimeterData": {
                    "numberOfPhases": 3,
                    "supplyVoltage": 0,
                    "averageCurrent": 0,
                    "powerFactor": 0.85
                },
                "nameplateData": {
                    "ratedMotorPower": 200,
                    "variableSpeedMotor": true,
                    "operationalFrequency": 50,
                    "lineFrequency": 60,
                    "motorAndDriveEfficiency": 92,
                    "loadFactor": 90
                },
                "powerMeterData": { "power": 50 },
                "otherMethodData": { "energy": 400000 },
                "units": 1
            }, {
                "name": "Cooling Tower Pump 2",
                "operatingHours": 7600,
                "electricityCost": 0.05,
                "measurementMethod": 1,
                "multimeterData": {
                    "numberOfPhases": 3,
                    "supplyVoltage": 0,
                    "averageCurrent": 0,
                    "powerFactor": 0.85
                },
                "nameplateData": {
                    "ratedMotorPower": 100,
                    "variableSpeedMotor": true,
                    "operationalFrequency": 50,
                    "lineFrequency": 60,
                    "motorAndDriveEfficiency": 94,
                    "loadFactor": 90
                },
                "powerMeterData": { "power": 50 },
                "otherMethodData": { "energy": 400000 },
                "units": 1
            }],
            "selected": true,
            "opportunitySheet": {
                "name": "Turn off cooling tower pumps",
                "equipment": "Cooling",
                "description": "Turn off cooling tower pumps during non-operation",
                "originator": "",
                "date": new Date(),
                "owner": "Jaidev",
                "businessUnits": "Process",
                "opportunityCost": {
                    "engineeringServices": 200,
                    "material": 0,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 0
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": []
            }
        }, {
            "baseline": [{
                "name": "Equipment #1",
                "operatingHours": 8736,
                "electricityCost": 0.066,
                "measurementMethod": 1,
                "multimeterData": {
                    "numberOfPhases": 3,
                    "supplyVoltage": 0,
                    "averageCurrent": 0,
                    "powerFactor": 0.85
                },
                "nameplateData": {
                    "ratedMotorPower": 30,
                    "variableSpeedMotor": false,
                    "operationalFrequency": 60,
                    "lineFrequency": 60,
                    "motorAndDriveEfficiency": 100,
                    "loadFactor": 70
                },
                "powerMeterData": { "power": 50 },
                "otherMethodData": { "energy": 400000 },
                "units": 1
            }],
            "modification": [{
                "name": "Equipment #1",
                "operatingHours": 0,
                "electricityCost": 0.066,
                "measurementMethod": 1,
                "multimeterData": {
                    "numberOfPhases": 3,
                    "supplyVoltage": 0,
                    "averageCurrent": 0,
                    "powerFactor": 0.85
                },
                "nameplateData": {
                    "ratedMotorPower": 30,
                    "variableSpeedMotor": false,
                    "operationalFrequency": 50,
                    "lineFrequency": 60,
                    "motorAndDriveEfficiency": 100,
                    "loadFactor": 70
                },
                "powerMeterData": { "power": 50 },
                "otherMethodData": { "energy": 400000 },
                "units": 1
            }],
            "selected": true,
            "opportunitySheet": {
                "name": "Turn off Exhaust Fan",
                "equipment": "HVAC System",
                "description": "Turn off the HVAC exhaust fan in the warehouse",
                "originator": "",
                "date": new Date(),
                "owner": "",
                "businessUnits": "",
                "opportunityCost": {
                    "engineeringServices": 0,
                    "material": 0,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 0
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": []
            }
        }],
        "opportunitySheets": [{
            "name": "Increase Boiler CoC",
            "equipment": "Boiler",
            "description": "Increase Boiler cycles of concentration",
            "originator": "",
            "date": new Date(),
            "owner": "Danny",
            "businessUnits": "Process",
            "opportunityCost": {
                "engineeringServices": 100,
                "material": 0,
                "otherCosts": [],
                "costDescription": "",
                "labor": 0
            },
            "baselineEnergyUseItems": [{
                "type": "Gas",
                "amount": 9
            }, {
                "type": "Water",
                "amount": 3000000
            }],
            "modificationEnergyUseItems": [{
                "type": "Gas",
                "amount": 4.2
            }, {
                "type": "Water",
                "amount": 1400000
            }],
            "selected": true
        }],
        "replaceExistingMotors": [{
            "replaceExistingData": {
                "operatingHours": 8760,
                "motorSize": 250,
                "existingEfficiency": 88,
                "load": 90,
                "electricityCost": 0.05,
                "newEfficiency": 96,
                "purchaseCost": 15000,
                "rewindCost": 8000,
                "rewindEfficiencyLoss": 1
            },
            "selected": true,
            "opportunitySheet": {
                "name": "Replace conveyor 5 motor",
                "equipment": "Motor",
                "description": "Replace old, inefficient motor",
                "originator": "",
                "date": new Date(),
                "owner": "Zhong",
                "businessUnits": "Process",
                "opportunityCost": {
                    "engineeringServices": 1000,
                    "material": 15000,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 1000
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": []
            }
        }, {
            "replaceExistingData": {
                "operatingHours": 8760,
                "motorSize": 500,
                "existingEfficiency": 75,
                "load": 90,
                "electricityCost": 0.05,
                "newEfficiency": 96,
                "purchaseCost": 30000,
                "rewindCost": 8000,
                "rewindEfficiencyLoss": 1
            },
            "selected": true,
            "opportunitySheet": {
                "name": "Replace blower motor",
                "equipment": "Motor",
                "description": "Replace old, inefficient motor",
                "originator": "",
                "date": new Date(),
                "owner": "Zhong",
                "businessUnits": "Process",
                "opportunityCost": {
                    "engineeringServices": 1000,
                    "material": 30000,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 1000
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": []
            }
        }]
    },
    "selected": true
}

export const MockTreasureHuntSettings: Settings = {
    "language": "English",
    "currency": "$ - US Dollar",
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
    "appVersion": "0.4.0-beta",
    "fanCurveType": null,
    "fanConvertedConditions": null,
    "phastRollupUnit": "MMBtu",
    "phastRollupFuelUnit": "MMBtu",
    "phastRollupElectricityUnit": "MMBtu",
    "phastRollupSteamUnit": "MMBtu",
    "defaultPanelTab": "help",
    "fuelCost": 4,
    "steamCost": 5,
    "electricityCost": 0.05,
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
    "disableFsatReportTutorial": false,
    "compressedAirCost": 0.0005,
    "otherFuelCost": 0,
    "waterCost": 0.0025,
    "waterWasteCost": 0.005,
}