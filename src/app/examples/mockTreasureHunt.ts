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
            "hoursPerYear": 8760
        },
        "currentEnergyUsage": {
            "electricityUsage": 32000000,
            "electricityCosts": 1600000,
            "electricityUsed": true,
            "electricityCO2SavingsData":{
                "energyType": 'electricity',
                "energySource": '',
                "fuelType": '',
                "totalEmissionOutputRate": .40107,
                "electricityUse": 0,
                "eGridRegion": '',
                "eGridSubregion": 'U.S. Average',
                "totalEmissionOutput": 0,
                "userEnteredBaselineEmissions": false,
                "userEnteredModificationEmissions": false,
                "zipcode": '00000',
            },
            "naturalGasUsage": 125000,
            "naturalGasCosts": 500000,
            "naturalGasUsed": true,
            "naturalGasCO2SavingsData":{
                "energyType": 'fuel',
                "energySource": 'Natural Gas',
                "fuelType": 'Natural Gas',
                "totalEmissionOutputRate": 53.06,
                "electricityUse": 0,
                "eGridRegion": '',
                "eGridSubregion": '',
                "totalEmissionOutput": 0,
                "userEnteredBaselineEmissions": false,
                "userEnteredModificationEmissions": false,
                "zipcode": '',
            },
            "otherFuelUsage": 0,
            "otherFuelCosts": 0,
            "otherFuelUsed": false,
            "otherFuelCO2SavingsData":{
                "energyType": 'fuel',
                "energySource": 'Petroleum-based fuels',
                "fuelType": 'Motor Gasoline',
                "totalEmissionOutputRate": 70.22,
                "electricityUse": 0,
                "eGridRegion": '',
                "eGridSubregion": '',
                "totalEmissionOutput": 0,
                "userEnteredBaselineEmissions": false,
                "userEnteredModificationEmissions": false,
                "zipcode": '',
            },
            "waterUsage": 40000000,
            "waterCosts": 100000,
            "waterUsed": true,
            "waterCO2OutputRate": 0,
            "wasteWaterUsage": 0,
            "wasteWaterCosts": 0,
            "wasteWaterUsed": false,
            "wasteWaterCO2OutputRate": 0,
            "compressedAirUsage": 0,
            "compressedAirCosts": 0,
            "compressedAirUsed": false,
            "compressedAirCO2OutputRate": 0,
            "steamUsage": 0,
            "steamCosts": 0,
            "steamUsed": false,
            "steamCO2OutputRate": 0
        },
        "naturalGasReductions": [{
            "baseline": [{
                "name": "Equipment #1",
                "operatingHours": 8760,
                "fuelCost": 4,
                "measurementMethod": 0,
                "flowMeterMethodData": {
                    "flowRate": 5000
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
                    "airMassFlowNameplateData": {
                        "airFlow": 50
                    },
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
                "flowMeterMethodData": {
                    "flowRate": 5
                },
                "otherMethodData": {
                    "consumption": 39000
                },
                "airMassFlowData": {
                    "isNameplate": true,
                    "airMassFlowMeasuredData": {
                        "areaOfDuct": 5,
                        "airVelocity": 10
                    },
                    "airMassFlowNameplateData": {
                        "airFlow": 50
                    },
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
            "opportunitySheet": {
                "name": "Insulate Hoses in Yard",
                "equipment": "steam",
                "description": "Boiler",
                "originator": "",
                "date": new Date(),
                "owner": "Utilities",
                "businessUnits": "Julio",
                "opportunityCost": {
                    "engineeringServices": 200,
                    "material": 9000,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 300,
                    "implementationEffort": 4
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": [],
                "opportunityType": "opportunity-sheet"
            },
            "opportunityType": "natural-gas-reduction",
            "selected": true
        },
        {
            "baseline": [{
                "name": "Equipment #1",
                "operatingHours": 8760,
                "fuelCost": 4.0,
                "measurementMethod": 3,
                "flowMeterMethodData": {
                    "flowRate": 5
                },
                "otherMethodData": {
                    "consumption": 125
                },
                "airMassFlowData": {
                    "isNameplate": true,
                    "airMassFlowMeasuredData": {
                        "areaOfDuct": 5,
                        "airVelocity": 10
                    },
                    "airMassFlowNameplateData": {
                        "airFlow": 50
                    },
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
                "fuelCost": 4.0,
                "measurementMethod": 3,
                "flowMeterMethodData": {
                    "flowRate": 5
                },
                "otherMethodData": {
                    "consumption": 0
                },
                "airMassFlowData": {
                    "isNameplate": true,
                    "airMassFlowMeasuredData": {
                        "areaOfDuct": 5,
                        "airVelocity": 10
                    },
                    "airMassFlowNameplateData": {
                        "airFlow": 50
                    },
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
                "equipment": "pump",
                "description": "Add insulation to 2 pumps",
                "originator": "",
                "date": new Date(),
                "owner": "Process",
                "businessUnits": "Kerry",
                "opportunityCost": {
                    "engineeringServices": 200,
                    "material": 300,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 200,
                    "implementationEffort": 3
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": [],
                "opportunityType": "opportunity-sheet"
            },
            "opportunityType": "natural-gas-reduction"
        },
        {
            "baseline": [{
                "name": "Equipment #1",
                "operatingHours": 8760,
                "fuelCost": 4,
                "measurementMethod": 0,
                "flowMeterMethodData": {
                    "flowRate": 5500
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
                    "airMassFlowNameplateData": {
                        "airFlow": 50
                    },
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
                "flowMeterMethodData": {
                    "flowRate": 5
                },
                "otherMethodData": {
                    "consumption": 44894
                },
                "airMassFlowData": {
                    "isNameplate": true,
                    "airMassFlowMeasuredData": {
                        "areaOfDuct": 5,
                        "airVelocity": 10
                    },
                    "airMassFlowNameplateData": {
                        "airFlow": 50
                    },
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
            "opportunitySheet": {
                "name": "Insulate pipe near burner",
                "equipment": "steam",
                "description": "Boiler",
                "originator": "",
                "date": new Date(),
                "owner": "Utilities",
                "businessUnits": "Julio",
                "opportunityCost": {
                    "engineeringServices": 0,
                    "material": 0,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 0,
                    "implementationEffort": 1
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": [],
                "opportunityType": "opportunity-sheet"
            },
            "opportunityType": "natural-gas-reduction",
            "selected": true
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
                "electricityUse": 54750,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            },
            {
                "name": "Fixture #2",
                "hoursPerYear": 8760,
                "wattsPerLamp": 400,
                "lampsPerFixture": 1,
                "numberOfFixtures": 5,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 17520,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            },
            {
                "name": "Fixture #3",
                "hoursPerYear": 8760,
                "wattsPerLamp": 100,
                "lampsPerFixture": 1,
                "numberOfFixtures": 5,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 4380,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            },
            {
                "name": "Fixture #4",
                "hoursPerYear": 8760,
                "wattsPerLamp": 150,
                "lampsPerFixture": 1,
                "numberOfFixtures": 4,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 5256,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            }],
            "modifications": [{
                "name": "Fixture #1",
                "hoursPerYear": 8760,
                "wattsPerLamp": 50,
                "lampsPerFixture": 5,
                "numberOfFixtures": 5,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 10950,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            },
            {
                "name": "Fixture #2",
                "hoursPerYear": 8760,
                "wattsPerLamp": 50,
                "lampsPerFixture": 1,
                "numberOfFixtures": 5,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 2190,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            },
            {
                "name": "Fixture #3",
                "hoursPerYear": 8760,
                "wattsPerLamp": 20,
                "lampsPerFixture": 1,
                "numberOfFixtures": 5,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 876,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            },
            {
                "name": "Fixture #4",
                "hoursPerYear": 8760,
                "wattsPerLamp": 20,
                "lampsPerFixture": 1,
                "numberOfFixtures": 4,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 700.8,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            }],
            "baselineElectricityCost": 0.05,
            "modificationElectricityCost": 0.05,
            "selected": true,
            "opportunitySheet": {
                "name": "Yard Lighting Replacement",
                "equipment": "lights",
                "description": "",
                "originator": "",
                "date": new Date(),
                "owner": "Facilities",
                "businessUnits": "Alisha",
                "opportunityCost": {
                    "engineeringServices": 100,
                    "material": 18000,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 1000,
                    "implementationEffort": 8,
                    "additionalAnnualSavings": {
                        "description": "Other Annual Savings",
                        "cost": 1500
                    }
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": [],
                "opportunityType": "opportunity-sheet"
            },
            "opportunityType": "lighting-replacement"
        },
        {
            "baseline": [{
                "name": "Metal Halide 175W",
                "hoursPerYear": 8760,
                "wattsPerLamp": 175,
                "lampsPerFixture": 2,
                "numberOfFixtures": 50,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 153300,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            },
            {
                "name": "Metal Halide 400W",
                "hoursPerYear": 8760,
                "wattsPerLamp": 400,
                "lampsPerFixture": 1,
                "numberOfFixtures": 25,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 87600,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            },
            {
                "name": "Metal Halide 250W",
                "hoursPerYear": 8760,
                "wattsPerLamp": 250,
                "lampsPerFixture": 2,
                "numberOfFixtures": 20,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 87600,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            }],
            "modifications": [{
                "name": "LED 25W",
                "hoursPerYear": 8760,
                "wattsPerLamp": 25,
                "lampsPerFixture": 2,
                "numberOfFixtures": 50,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 21900,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            },
            {
                "name": "LED 30W",
                "hoursPerYear": 8760,
                "wattsPerLamp": 30,
                "lampsPerFixture": 1,
                "numberOfFixtures": 25,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 6570,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            },
            {
                "name": "Fixture #3",
                "hoursPerYear": 8760,
                "wattsPerLamp": 30,
                "lampsPerFixture": 1,
                "numberOfFixtures": 20,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 5256,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            }],
            "baselineElectricityCost": 0.05,
            "modificationElectricityCost": 0.05,
            "opportunitySheet": {
                "name": "Office Lighting",
                "equipment": "lights",
                "description": "Various lighting replacements",
                "originator": "",
                "date": new Date(),
                "owner": "Facilities",
                "businessUnits": "Alisha",
                "opportunityCost": {
                    "engineeringServices": 500,
                    "material": 15000,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 1000,
                    "implementationEffort": 3,
                    "additionalSavings": {
                        "description": "Rebate Savings",
                        "cost": 1000
                    },
                    "additionalAnnualSavings": {
                        "description": "Maint. Annual Savings",
                        "cost": 1500
                    }
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": [],
                "opportunityType": "opportunity-sheet"
            },
            "opportunityType": "lighting-replacement",
            "selected": true
        },
        {
            "baseline": [{
                "name": "T5",
                "hoursPerYear": 8760,
                "wattsPerLamp": 54,
                "lampsPerFixture": 4,
                "numberOfFixtures": 500,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 946080,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            }],
            "modifications": [{
                "name": "LED",
                "hoursPerYear": 8760,
                "wattsPerLamp": 20,
                "lampsPerFixture": 4,
                "numberOfFixtures": 500,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 350400,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            }],
            "baselineElectricityCost": 0.05,
            "modificationElectricityCost": 0.05,
            "opportunitySheet": {
                "name": "Process Lighting A",
                "equipment": "lights",
                "description": "Replace T5s with LEDs",
                "originator": "",
                "date": new Date(),
                "owner": "Process",
                "businessUnits": "Alisha",
                "opportunityCost": {
                    "engineeringServices": 1000,
                    "material": 27000,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 3000,
                    "implementationEffort": 5,
                    "additionalSavings": {
                        "description": "Rebate Savings",
                        "cost": 1000
                    },
                    "additionalAnnualSavings": {
                        "description": "Maint. Annual Savings",
                        "cost": 500
                    }
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": [],
                "opportunityType": "opportunity-sheet"
            },
            "opportunityType": "lighting-replacement",
            "selected": true
        },
        {
            "baseline": [{
                "name": "T8",
                "hoursPerYear": 8760,
                "wattsPerLamp": 32,
                "lampsPerFixture": 4,
                "numberOfFixtures": 75,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 84096,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            }],
            "modifications": [{
                "name": "LED",
                "hoursPerYear": 8760,
                "wattsPerLamp": 20,
                "lampsPerFixture": 4,
                "numberOfFixtures": 75,
                "lumensPerLamp": 0,
                "totalLighting": 0,
                "electricityUse": 52560,
                "ballastFactor": 1,
                "lumenDegradationFactor": 1,
                "coefficientOfUtilization": 1,
                "category": 0
            }],
            "baselineElectricityCost": 0.05,
            "modificationElectricityCost": 0.05,
            "selected": true,
            "opportunitySheet": {
                "name": "Process Lighting B",
                "equipment": "lights",
                "description": "upgrade side room lighting",
                "originator": "",
                "date": new Date(),
                "owner": "Facilities",
                "businessUnits": "Alisha",
                "opportunityCost": {
                    "engineeringServices": 100,
                    "material": 6000,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 300,
                    "implementationEffort": 1
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": [],
                "opportunityType": "opportunity-sheet"
            },
            "opportunityType": "lighting-replacement"
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
                "flowMeterMethodData": {
                    "meterReading": 0.2
                },
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
                "otherMethodData": {
                    "consumption": 1750
                },
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
                "flowMeterMethodData": {
                    "meterReading": 0.2
                },
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
                "otherMethodData": {
                    "consumption": 0
                },
                "compressorElectricityData": {
                    "compressorControl": 0,
                    "compressorControlAdjustment": 25,
                    "compressorSpecificPowerControl": 0,
                    "compressorSpecificPower": 0.16
                },
                "units": 1
            }],
            "opportunitySheet": {
                "name": "Eliminate Air Leaks",
                "equipment": "compressedAir",
                "description": "",
                "originator": "",
                "date": new Date(),
                "owner": "Utilities",
                "businessUnits": "Frank",
                "opportunityCost": {
                    "engineeringServices": 0,
                    "material": 0,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 100,
                    "implementationEffort": 1
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": [],
                "opportunityType": "opportunity-sheet"
            },
            "opportunityType": "compressed-air-reduction",
            "selected": true
        },
        {
            "baseline": [{
                "name": "Equipment #1",
                "hoursPerYear": 8760,
                "utilityType": 1,
                "utilityCost": 0.05,
                "compressedAirCost": 0.02,
                "electricityCost": 0.05,
                "measurementMethod": 0,
                "flowMeterMethodData": {
                    "meterReading": 6000
                },
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
                "otherMethodData": {
                    "consumption": 1750
                },
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
                "flowMeterMethodData": {
                    "meterReading": 5600
                },
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
                "otherMethodData": {
                    "consumption": 1750
                },
                "compressorElectricityData": {
                    "compressorControl": 0,
                    "compressorControlAdjustment": 25,
                    "compressorSpecificPowerControl": 0,
                    "compressorSpecificPower": 0.16
                },
                "units": 1
            }],
            "opportunitySheet": {
                "name": "CA Flow Reduction",
                "equipment": "compressedAir",
                "description": "Reduce compressed air pressure 10 lbs",
                "originator": "",
                "date": new Date(),
                "owner": "Utilities",
                "businessUnits": "Frank",
                "opportunityCost": {
                    "engineeringServices": 100,
                    "material": 0,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 0,
                    "implementationEffort": 1
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": [],
                "opportunityType": "opportunity-sheet"
            },
            "opportunityType": "compressed-air-reduction",
            "selected": true
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
                "powerMeterData": {
                    "power": 50
                },
                "otherMethodData": {
                    "energy": 400000
                },
                "units": 1,
                "userSelectedHP": true
            },
            {
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
                "powerMeterData": {
                    "power": 50
                },
                "otherMethodData": {
                    "energy": 400000
                },
                "units": 1,
                "userSelectedHP": true
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
                "powerMeterData": {
                    "power": 50
                },
                "otherMethodData": {
                    "energy": 400000
                },
                "units": 1,
                "userSelectedHP": true
            },
            {
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
                "powerMeterData": {
                    "power": 50
                },
                "otherMethodData": {
                    "energy": 400000
                },
                "units": 1,
                "userSelectedHP": true
            }],
            "selected": true,
            "opportunitySheet": {
                "name": "Turn off cooling tower pumps",
                "equipment": "processCooling",
                "description": "Turn off cooling tower pumps during non-operation",
                "originator": "",
                "date": new Date(),
                "owner": "Process",
                "businessUnits": "Jorge",
                "opportunityCost": {
                    "engineeringServices": 200,
                    "material": 0,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 0,
                    "implementationEffort": 1,
                    "additionalAnnualSavings": {
                        "description": "Other Annual Savings",
                        "cost": 200
                    }
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": [],
                "opportunityType": "opportunity-sheet"
            },
            "opportunityType": "electricity-reduction"
        },
        {
            "baseline": [{
                "name": "Equipment #1",
                "operatingHours": 8760,
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
                "powerMeterData": {
                    "power": 50
                },
                "otherMethodData": {
                    "energy": 400000
                },
                "units": 1,
                "userSelectedHP": true
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
                "powerMeterData": {
                    "power": 50
                },
                "otherMethodData": {
                    "energy": 400000
                },
                "units": 1,
                "userSelectedHP": true
            }],
            "selected": true,
            "opportunitySheet": {
                "name": "Turn off Exhaust Fan",
                "equipment": "hvac",
                "description": "Turn off the HVAC exhaust fan in the warehouse",
                "originator": "",
                "date": new Date(),
                "owner": "Facilities",
                "businessUnits": "Amy",
                "opportunityCost": {
                    "engineeringServices": 0,
                    "material": 0,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 0,
                    "implementationEffort": 1
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": [],
                "opportunityType": "opportunity-sheet"
            },
            "opportunityType": "electricity-reduction"
        }],
        "opportunitySheets": [{
            "name": "Increase Boiler CoC",
            "equipment": "steam",
            "description": "Increase Boiler cycles of concentration",
            "originator": "",
            "date": new Date(),
            "owner": "Utilities",
            "businessUnits": "Reyes",
            "opportunityCost": {
                "engineeringServices": 100,
                "material": 0,
                "otherCosts": [],
                "costDescription": "",
                "labor": 0,
                "implementationEffort": 2
            },
            "baselineEnergyUseItems": [{
                "type": "Gas",
                "amount": 9
            },
            {
                "type": "Water",
                "amount": 3000000
            }],
            "modificationEnergyUseItems": [{
                "type": "Gas",
                "amount": 4.2
            },
            {
                "type": "Water",
                "amount": 1400000
            }],
            "opportunityType": "opportunity-sheet",
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
                "equipment": "motor",
                "description": "Replace old, inefficient motor",
                "originator": "",
                "date": new Date(),
                "owner": "Process",
                "businessUnits": "Garth",
                "opportunityCost": {
                    "engineeringServices": 1000,
                    "material": 15000,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 1000,
                    "implementationEffort": 10
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": [],
                "opportunityType": "opportunity-sheet"
            },
            "opportunityType": "replace-existing"
        },
        {
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
            "opportunitySheet": {
                "name": "Replace blower motor",
                "equipment": "motor",
                "description": "Replace old, inefficient motor",
                "originator": "",
                "date": new Date(),
                "owner": "Process",
                "businessUnits": "Frank",
                "opportunityCost": {
                    "engineeringServices": 1000,
                    "material": 30000,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 1000,
                    "implementationEffort": 3
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": [],
                "opportunityType": "opportunity-sheet"
            },
            "opportunityType": "replace-existing",
            "selected": true
        }],
        "waterReductions": [{
            "baseline": [{
                "name": "Equipment #1",
                "hoursPerYear": 8760,
                "waterCost": 0.0025,
                "measurementMethod": 2,
                "meteredFlowMethodData": {
                    "meterReading": 100
                },
                "volumeMeterMethodData": {
                    "initialMeterReading": 4235,
                    "finalMeterReading": 5842,
                    "elapsedTime": 15
                },
                "bucketMethodData": {
                    "bucketVolume": 10,
                    "bucketFillTime": 20
                },
                "otherMethodData": {
                    "consumption": 15000
                },
                "isWastewater": false
            }],
            "modification": [{
                "name": "Equipment #1",
                "hoursPerYear": 8760,
                "waterCost": 0.0025,
                "measurementMethod": 0,
                "meteredFlowMethodData": {
                    "meterReading": 28
                },
                "volumeMeterMethodData": {
                    "initialMeterReading": 4235,
                    "finalMeterReading": 5842,
                    "elapsedTime": 15
                },
                "bucketMethodData": {
                    "bucketVolume": 10,
                    "bucketFillTime": 20
                },
                "otherMethodData": {
                    "consumption": 15000
                },
                "isWastewater": false
            }],
            "opportunitySheet": {
                "name": "Eliminate Pipe Leaks",
                "equipment": "steam",
                "description": "",
                "originator": "",
                "date": new Date(),
                "owner": "Process",
                "businessUnits": "Araceli",
                "opportunityCost": {
                    "engineeringServices": 300,
                    "material": 1000,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 1000,
                    "implementationEffort": 7
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": [],
                "opportunityType": "opportunity-sheet"
            },
            "opportunityType": "water-reduction",
            "selected": true
        }],
        "compressedAirPressureReductions": [{
            "baseline": [{
                "name": "Equipment #1",
                "powerType": "Measured",
                "isBaseline": true,
                "hoursPerYear": 8760,
                "electricityCost": 0.05,
                "compressorPower": 300,
                "pressure": 120,
                "proposedPressure": 0,
                "pressureRated": 100,
                "atmosphericPressure": 14.7
            }],
            "modification": [{
                "name": "Equipment #1",
                "powerType": "Measured",
                "isBaseline": false,
                "hoursPerYear": 8760,
                "electricityCost": 0.05,
                "compressorPower": 300,
                "pressure": 120,
                "proposedPressure": 110,
                "pressureRated": 100,
                "atmosphericPressure": 14.7
            }],
            "opportunitySheet": {
                "name": "CA Pressure Reduction",
                "equipment": "compressedAir",
                "description": "",
                "originator": "",
                "date": new Date(),
                "owner": "Utilities",
                "businessUnits": "Frank",
                "opportunityCost": {
                    "engineeringServices": 100,
                    "material": 0,
                    "otherCosts": [],
                    "costDescription": "",
                    "labor": 50,
                    "implementationEffort": 2
                },
                "baselineEnergyUseItems": [{
                    "type": "Electricity",
                    "amount": 0
                }],
                "modificationEnergyUseItems": [],
                "opportunityType": "opportunity-sheet"
            },
            "opportunityType": "compressed-air-pressure-reduction",
            "selected": true
        }]


    },
    "createdDate": new Date(),
    "modifiedDate": new Date(),
    "selected": false,
}

export const MockTreasureHuntSettings: Settings = {
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
    "appVersion": "0.4.0-beta",
    "fanCurveType": null,
    "fanConvertedConditions": null,
    "phastRollupUnit": "MMBtu",
    "phastRollupFuelUnit": "MMBtu",
    "phastRollupElectricityUnit": "MMBtu",
    "phastRollupSteamUnit": "MMBtu",
    "defaultPanelTab": "results",
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
    "disableDashboardTutorial": false,
    "disablePsatTutorial": false,
    "disableFansTutorial": false,
    "disablePhastTutorial": false,
    "disableWasteWaterTutorial": false,
    "disableSteamTutorial": false,
    "disableMotorInventoryTutorial": false,
    "disableTreasureHuntTutorial": false,
    "disableDataExplorerTutorial": false,
    "compressedAirCost": 0.0005,
    "otherFuelCost": 0,
    "waterCost": 0.0025,
    "waterWasteCost": 0.005,
    "totalEmissionOutputRate": 955.587,
    "commonRollupUnit": "MMBtu",
    "pumpsRollupUnit": "MWh",
    "fansRollupUnit": "MWh",
    "steamRollupUnit": "MMBtu",
    "wasteWaterRollupUnit": "MWh",
    "compressedAirRollupUnit": "MWh"
}