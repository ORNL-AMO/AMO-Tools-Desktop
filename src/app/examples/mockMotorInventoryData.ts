import { InventoryItem } from "../shared/models/inventory/inventory";



export const MockMotorInventory: InventoryItem = {
    "motorInventoryData": {
        "co2SavingsData": {
            "energyType": 'electricity',
            "energySource": '',
            "fuelType": '',
            "totalEmissionOutputRate": 401.07,
            "electricityUse": 0,
            "eGridRegion": '',
            "eGridSubregion": 'U.S. Average',
            "totalEmissionOutput": 0,
            "userEnteredBaselineEmissions": false,
            "userEnteredModificationEmissions": true,
            "zipcode": '00000',
        },
        "departments": [
            {
                "name": "Design and Paint",
                "operatingHours": 8760,
                "description": "This department designs and decorates the product",
                "id": "a2jd7ua9i",
                "catalog": [
                    {
                        "id": "59264rw8x",
                        "departmentId": "a2jd7ua9i",
                        "description": "This motor mixes the paint for smaller batches",
                        "name": "Small Paint Mixer ",
                        "batchAnalysisData": {
                            "modifiedCost": 14166,
                            "modifiedPower": 100,
                            "modifiedEfficiency": 95.5,
                            "modifiedPercentLoad": 95,
                            "rewindCost": 1000,
                            "rewindEfficiencyLoss": 1
                        },
                        "loadCharacteristicData": {
                            "efficiency75": 94.66,
                            "efficiency50": 94.16,
                            "efficiency25": 91.72,
                            "powerFactor100": 86,
                            "powerFactor75": 83,
                            "powerFactor50": 76,
                            "powerFactor25": 57,
                            "ampsIdle": 116
                        },
                        "manualSpecificationData": {
                            "synchronousSpeed": 1800,
                            "frame": "445U",
                            "shaftPosiion": "Horizontal",
                            "windingResistance": 10500,
                            "rotorBars": 46,
                            "statorSlots": 60,
                            "ampsLockedRotor": 384,
                            "poles": 4,
                            "currentType": "AC",
                            "ratedSpeed": 1750
                        },
                        "nameplateData": {
                            "ratedMotorPower": 100,
                            "efficiencyClass": 1,
                            "lineFrequency": 60,
                            "nominalEfficiency": 94.5,
                            "manufacturer": "Baldor-Reliance",
                            "model": "AUTOMOTIVE APPROVED,7EH",
                            "motorType": "NEMA B",
                            "enclosureType": "TEFC",
                            "ratedVoltage": 460,
                            "serviceFactor": 115,
                            "insulationClass": "H",
                            "weight": 68,
                            "numberOfPhases": 3,
                            "fullLoadSpeed": 1780,
                            "fullLoadAmps": 113.84
                        },
                        "operationData": {
                            "location": "Next to Paint Sprayer",
                            "annualOperatingHours": 8760,
                            "averageLoadFactor": 95,
                            "utilizationFactor": 100,
                            "efficiencyAtAverageLoad": 94.57,
                            "powerFactorAtLoad": 87.67,
                            "currentAtLoad": 100
                        },
                        "otherData": {
                            "driveType": 2,
                            "isVFD": false,
                            "hasLoggerData": false,
                            "voltageConnectionType": "Delta"
                        },
                        "purchaseInformationData": {
                            "catalogId": "AEM4400-4",
                            "listPrice": 13000,
                            "warranty": null,
                            "directReplacementCost": 13000
                        },
                        "torqueData": {
                            "torqueFullLoad": 295,
                            "torqueBreakDown": 931,
                            "torqueLockedRotor": 384
                        }
                    },
                    {
                        "id": "5m8mzlhqx",
                        "departmentId": "a2jd7ua9i",
                        "description": "The pump moves the pait from storage to the paint line",
                        "name": "Paint Pump",
                        "batchAnalysisData": {
                            "modifiedCost": 6429,
                            "modifiedPower": 50,
                            "modifiedEfficiency": 94,
                            "modifiedPercentLoad": 75,
                            "rewindCost": 2000,
                            "rewindEfficiencyLoss": 1
                        },
                        "loadCharacteristicData": {
                            "efficiency75": 94.08,
                            "efficiency50": 93.41,
                            "efficiency25": 90.36,
                            "powerFactor100": 90,
                            "powerFactor75": 89,
                            "powerFactor50": 83,
                            "powerFactor25": 67,
                            "ampsIdle": 34.7
                        },
                        "manualSpecificationData": {
                            "synchronousSpeed": 3600,
                            "frame": "404TS",
                            "shaftPosiion": "Horizontal",
                            "windingResistance": 174,
                            "rotorBars": 28,
                            "statorSlots": 36,
                            "ampsLockedRotor": 897,
                            "poles": 2,
                            "currentType": "AC",
                            "ratedSpeed": 3600
                        },
                        "nameplateData": {
                            "ratedMotorPower": 125,
                            "efficiencyClass": 1,
                            "lineFrequency": 60,
                            "nominalEfficiency": 94,
                            "manufacturer": "Baldor-Reliance",
                            "model": "GENERAL PURPOSE",
                            "motorType": "NEMA B",
                            "enclosureType": "TEFC",
                            "ratedVoltage": 460,
                            "serviceFactor": 115,
                            "insulationClass": "F",
                            "weight": 806,
                            "numberOfPhases": 3,
                            "fullLoadSpeed": 3550,
                            "fullLoadAmps": 149
                        },
                        "operationData": {
                            "location": "Outside of Storage",
                            "annualOperatingHours": 8760,
                            "averageLoadFactor": 30,
                            "utilizationFactor": 75,
                            "efficiencyAtAverageLoad": 91,
                            "powerFactorAtLoad": 70,
                            "currentAtLoad": 57.12
                        },
                        "otherData": {
                            "driveType": 1,
                            "isVFD": true,
                            "hasLoggerData": true,
                            "voltageConnectionType": "Wye"
                        },
                        "purchaseInformationData": {
                            "catalogId": "M2554T-4",
                            "listPrice": 16605,
                            "warranty": null,
                            "directReplacementCost": 16605
                        },
                        "torqueData": {
                            "torqueFullLoad": 184,
                            "torqueBreakDown": 644,
                            "torqueLockedRotor": 232
                        }
                    },
                    {
                        "id": "a2co5dxm8",
                        "departmentId": "a2jd7ua9i",
                        "description": "Drys the Painted Toys",
                        "name": "Large Blower",
                        "batchAnalysisData": {
                            "modifiedCost": 19538,
                            "modifiedPower": 150,
                            "modifiedEfficiency": 95,
                            "modifiedPercentLoad": 75,
                            "rewindCost": 1000,
                            "rewindEfficiencyLoss": 1
                        },
                        "loadCharacteristicData": {
                            "efficiency75": 94.1,
                            "efficiency50": 93,
                            "efficiency25": 88,
                            "powerFactor100": 89,
                            "powerFactor75": 89,
                            "powerFactor50": 86,
                            "powerFactor25": 74,
                            "ampsIdle": 35
                        },
                        "manualSpecificationData": {
                            "synchronousSpeed": 3600,
                            "frame": "315S",
                            "shaftPosiion": "Horizontal",
                            "windingResistance": 24,
                            "rotorBars": 28,
                            "statorSlots": 36,
                            "ampsLockedRotor": 1031,
                            "poles": 2,
                            "currentType": "AC",
                            "ratedSpeed": 3550
                        },
                        "nameplateData": {
                            "ratedMotorPower": 150,
                            "efficiencyClass": 1,
                            "lineFrequency": 60,
                            "nominalEfficiency": 94.5,
                            "manufacturer": "Lafert",
                            "model": "General Purpose",
                            "motorType": "IEC",
                            "enclosureType": "TEFC",
                            "ratedVoltage": 460,
                            "serviceFactor": 110,
                            "insulationClass": "F",
                            "weight": 487,
                            "numberOfPhases": 3,
                            "fullLoadSpeed": 3585,
                            "fullLoadAmps": 165
                        },
                        "operationData": {
                            "location": "In Drying Tunnel ",
                            "annualOperatingHours": 8760,
                            "averageLoadFactor": 75,
                            "utilizationFactor": 100,
                            "efficiencyAtAverageLoad": 75,
                            "powerFactorAtLoad": 89,
                            "currentAtLoad": undefined
                        },
                        "otherData": {
                            "driveType": 2,
                            "isVFD": false,
                            "hasLoggerData": false,
                            "voltageConnectionType": "Delta"
                        },
                        "purchaseInformationData": {
                            "catalogId": "A315SZE2460B5",
                            "listPrice": 18498,
                            "warranty": null,
                            "directReplacementCost": 18498
                        },
                        "torqueData": {
                            "torqueFullLoad": 221,
                            "torqueBreakDown": 942,
                            "torqueLockedRotor": 460
                        }
                    },
                    {
                        "id": "grvscvqqv",
                        "departmentId": "a2jd7ua9i",
                        "description": "Agitates the and shakes the paint barrels.",
                        "name": "Large Paint Mixer",
                        "batchAnalysisData": {
                            "modifiedCost": 23120,
                            "modifiedPower": 200,
                            "modifiedEfficiency": 96.26,
                            "modifiedPercentLoad": 75,
                            "rewindCost": 1000,
                            "rewindEfficiencyLoss": 1
                        },
                        "loadCharacteristicData": {
                            "efficiency75": undefined,
                            "efficiency50": undefined,
                            "efficiency25": undefined,
                            "powerFactor100": undefined,
                            "powerFactor75": undefined,
                            "powerFactor50": undefined,
                            "powerFactor25": undefined,
                            "ampsIdle": undefined
                        },
                        "manualSpecificationData": {
                            "synchronousSpeed": 1800,
                            "frame": null,
                            "shaftPosiion": null,
                            "windingResistance": null,
                            "rotorBars": null,
                            "statorSlots": null,
                            "ampsLockedRotor": null,
                            "poles": null,
                            "currentType": null,
                            "ratedSpeed": null
                        },
                        "nameplateData": {
                            "ratedMotorPower": 200,
                            "efficiencyClass": 2,
                            "lineFrequency": 60,
                            "nominalEfficiency": 96.2,
                            "manufacturer": "Teco/Westinghouse",
                            "model": "MAX-E2",
                            "motorType": "NEMA B",
                            "enclosureType": "TEFC",
                            "ratedVoltage": 460,
                            "serviceFactor": 115,
                            "insulationClass": "F",
                            "weight": 297,
                            "numberOfPhases": 3,
                            "fullLoadSpeed": 1786,
                            "fullLoadAmps": 224.45
                        },
                        "operationData": {
                            "annualOperatingHours": 8760,
                            "location": null,
                            "averageLoadFactor": 75,
                            "utilizationFactor": null,
                            "efficiencyAtAverageLoad": 96.26,
                            "powerFactorAtLoad": 84.82,
                            "currentAtLoad": 172.01
                        },
                        "otherData": {
                            "driveType": undefined,
                            "isVFD": false,
                            "hasLoggerData": false,
                            "voltageConnectionType": undefined
                        },
                        "purchaseInformationData": {
                            "catalogId": null,
                            "listPrice": 23120,
                            "warranty": null,
                            "directReplacementCost": 23120
                        },
                        "torqueData": {
                            "torqueFullLoad": undefined,
                            "torqueBreakDown": undefined,
                            "torqueLockedRotor": undefined
                        }
                    },
                    {
                        "id": "r1hkhnkxp",
                        "departmentId": "a2jd7ua9i",
                        "description": "",
                        "name": "Adhesive Agitator ",
                        "batchAnalysisData": {
                            "modifiedCost": 19538,
                            "modifiedPower": 150,
                            "modifiedEfficiency": 95,
                            "modifiedPercentLoad": 100,
                            "rewindCost": 1000,
                            "rewindEfficiencyLoss": 1
                        },
                        "loadCharacteristicData": {
                            "efficiency75": 94.1,
                            "efficiency50": 93,
                            "efficiency25": 88,
                            "powerFactor100": 89,
                            "powerFactor75": 89,
                            "powerFactor50": 86,
                            "powerFactor25": 74,
                            "ampsIdle": 35
                        },
                        "manualSpecificationData": {
                            "synchronousSpeed": 3600,
                            "frame": null,
                            "shaftPosiion": "Horizontal",
                            "windingResistance": 24,
                            "rotorBars": 28,
                            "statorSlots": 36,
                            "ampsLockedRotor": 1031.8,
                            "poles": null,
                            "currentType": "AC",
                            "ratedSpeed": 3585
                        },
                        "nameplateData": {
                            "efficiencyClass": 1,
                            "lineFrequency": 60,
                            "ratedMotorPower": 150,
                            "nominalEfficiency": 94.5,
                            "manufacturer": "Lafert",
                            "model": "General Purpose",
                            "motorType": "IEC",
                            "enclosureType": "ODP",
                            "ratedVoltage": 460,
                            "serviceFactor": 115,
                            "insulationClass": "F",
                            "weight": 1654,
                            "numberOfPhases": 3,
                            "fullLoadSpeed": 3585,
                            "fullLoadAmps": 165
                        },
                        "operationData": {
                            "annualOperatingHours": 8760,
                            "location": "Fluid Mixer",
                            "averageLoadFactor": 100,
                            "utilizationFactor": 30,
                            "efficiencyAtAverageLoad": 92.03,
                            "powerFactorAtLoad": 92.49,
                            "currentAtLoad": 165
                        },
                        "otherData": {
                            "driveType": 1,
                            "isVFD": false,
                            "hasLoggerData": false,
                            "voltageConnectionType": "Wye"
                        },
                        "purchaseInformationData": {
                            "catalogId": null,
                            "listPrice": 18201,
                            "warranty": null,
                            "directReplacementCost": 18201
                        },
                        "torqueData": {
                            "torqueFullLoad": 221,
                            "torqueBreakDown": 663,
                            "torqueLockedRotor": 619.5
                        }
                    }
                ]
            },
            {
                "name": "Toy Molding",
                "operatingHours": 8760,
                "description": "This department molds plastic toys",
                "id": "232esdnnc",
                "catalog": [
                    {
                        "id": "6vd6prled",
                        "departmentId": "232esdnnc",
                        "description": "",
                        "name": "Pellet Shaker ",
                        "batchAnalysisData": {
                            "modifiedCost": 4288,
                            "modifiedPower": 30,
                            "modifiedEfficiency": 93.6,
                            "modifiedPercentLoad": 84,
                            "rewindCost": 1000,
                            "rewindEfficiencyLoss": 2
                        },
                        "loadCharacteristicData": {
                            "efficiency75": 90.39,
                            "efficiency50": 89.95,
                            "efficiency25": 87.47,
                            "powerFactor100": 87,
                            "powerFactor75": 81,
                            "powerFactor50": 71,
                            "powerFactor25": 49,
                            "ampsIdle": 19.5
                        },
                        "manualSpecificationData": {
                            "synchronousSpeed": 1800,
                            "frame": null,
                            "shaftPosiion": "Horizontal",
                            "windingResistance": 1230,
                            "rotorBars": 40,
                            "statorSlots": 48,
                            "ampsLockedRotor": 300,
                            "poles": null,
                            "currentType": "AC",
                            "ratedSpeed": null
                        },
                        "nameplateData": {
                            "efficiencyClass": 1,
                            "lineFrequency": 60,
                            "ratedMotorPower": 40,
                            "nominalEfficiency": 90,
                            "manufacturer": "Baldor-Reliance",
                            "model": "INVERTER EXPL PROOF",
                            "motorType": "NEMA Design B",
                            "enclosureType": "TEFC",
                            "ratedVoltage": 575,
                            "serviceFactor": 115,
                            "insulationClass": "F",
                            "weight": 116,
                            "numberOfPhases": 3,
                            "fullLoadSpeed": 1780,
                            "fullLoadAmps": 37.59
                        },
                        "operationData": {
                            "annualOperatingHours": 8760,
                            "location": "Near plastic hopper",
                            "averageLoadFactor": 63,
                            "utilizationFactor": 50,
                            "efficiencyAtAverageLoad": 90.34,
                            "powerFactorAtLoad": 79.99,
                            "currentAtLoad": 25.15
                        },
                        "otherData": {
                            "driveType": 0,
                            "isVFD": true,
                            "hasLoggerData": true,
                            "voltageConnectionType": "Wye"
                        },
                        "purchaseInformationData": {
                            "catalogId": null,
                            "listPrice": 5700,
                            "warranty": null,
                            "directReplacementCost": 5700
                        },
                        "torqueData": {
                            "torqueFullLoad": 118,
                            "torqueBreakDown": 346,
                            "torqueLockedRotor": 171
                        }
                    },
                    {
                        "id": "uakgp8xpz",
                        "departmentId": "232esdnnc",
                        "description": "",
                        "name": "Toy Press 1",
                        "batchAnalysisData": {
                            "modifiedCost": 48000,
                            "modifiedPower": 500,
                            "modifiedEfficiency": 95.6,
                            "modifiedPercentLoad": 85,
                            "rewindCost": 1000,
                            "rewindEfficiencyLoss": 1
                        },
                        "loadCharacteristicData": {
                            "efficiency75": 95.4,
                            "efficiency50": 94,
                            "efficiency25": null,
                            "powerFactor100": 91.7,
                            "powerFactor75": 91,
                            "powerFactor50": 87,
                            "powerFactor25": null,
                            "ampsIdle": 84.7
                        },
                        "manualSpecificationData": {
                            "synchronousSpeed": 3600,
                            "frame": null,
                            "shaftPosiion": "Horizontal",
                            "windingResistance": null,
                            "rotorBars": null,
                            "statorSlots": null,
                            "ampsLockedRotor": 3625,
                            "poles": null,
                            "currentType": "AC",
                            "ratedSpeed": null
                        },
                        "nameplateData": {
                            "efficiencyClass": 1,
                            "lineFrequency": 60,
                            "ratedMotorPower": 500,
                            "nominalEfficiency": 95.8,
                            "manufacturer": "Teco/Westinghouse",
                            "model": "MAX-E1-8N",
                            "motorType": "NEMA Design B",
                            "enclosureType": "ODP",
                            "ratedVoltage": 4000,
                            "serviceFactor": 115,
                            "insulationClass": "F",
                            "weight": 5300,
                            "numberOfPhases": 3,
                            "fullLoadSpeed": 3580,
                            "fullLoadAmps": 62.88
                        },
                        "operationData": {
                            "annualOperatingHours": 8760,
                            "location": "Compression Molding",
                            "averageLoadFactor": 85,
                            "utilizationFactor": 50,
                            "efficiencyAtAverageLoad": 95.6,
                            "powerFactorAtLoad": 91.4,
                            "currentAtLoad": null
                        },
                        "otherData": {
                            "driveType": 0,
                            "isVFD": true,
                            "hasLoggerData": false,
                            "voltageConnectionType": "Delta"
                        },
                        "purchaseInformationData": {
                            "catalogId": null,
                            "listPrice": 48000,
                            "warranty": null,
                            "directReplacementCost": 48000
                        },
                        "torqueData": {
                            "torqueFullLoad": 733,
                            "torqueBreakDown": 1686,
                            "torqueLockedRotor": 587
                        }
                    },
                    {
                        "id": "q5pg1ui2r",
                        "departmentId": "232esdnnc",
                        "description": "",
                        "name": "Toy Press 2 ",
                        "batchAnalysisData": {
                            "modifiedCost": 41000,
                            "modifiedPower": 400,
                            "modifiedEfficiency": 95.2,
                            "modifiedPercentLoad": 69,
                            "rewindCost": 1000,
                            "rewindEfficiencyLoss": 1
                        },
                        "loadCharacteristicData": {
                            "efficiency75": 93.6,
                            "efficiency50": 91,
                            "efficiency25": null,
                            "powerFactor100": 89.5,
                            "powerFactor75": 86.5,
                            "powerFactor50": 81.5,
                            "powerFactor25": null,
                            "ampsIdle": 16.2
                        },
                        "manualSpecificationData": {
                            "synchronousSpeed": 1800,
                            "frame": null,
                            "shaftPosiion": null,
                            "windingResistance": null,
                            "rotorBars": null,
                            "statorSlots": null,
                            "ampsLockedRotor": null,
                            "poles": null,
                            "currentType": "AC",
                            "ratedSpeed": null
                        },
                        "nameplateData": {
                            "efficiencyClass": 1,
                            "lineFrequency": 60,
                            "ratedMotorPower": 500,
                            "nominalEfficiency": 94,
                            "manufacturer": "Teco/Westinghouse",
                            "model": "GLOBAL-HD WPI MED VOLT",
                            "motorType": "NEMA Design B",
                            "enclosureType": "TENV",
                            "ratedVoltage": 2300,
                            "serviceFactor": 115,
                            "insulationClass": "F",
                            "weight": 5115,
                            "numberOfPhases": 3,
                            "fullLoadSpeed": 1780,
                            "fullLoadAmps": 111.59
                        },
                        "operationData": {
                            "annualOperatingHours": 8760,
                            "location": "Compression Molding",
                            "averageLoadFactor": 55,
                            "utilizationFactor": 20,
                            "efficiencyAtAverageLoad": 91.3,
                            "powerFactorAtLoad": 89.8,
                            "currentAtLoad": null
                        },
                        "otherData": {
                            "driveType": 0,
                            "isVFD": true,
                            "hasLoggerData": false,
                            "voltageConnectionType": "Delta"
                        },
                        "purchaseInformationData": {
                            "catalogId": null,
                            "listPrice": 48000,
                            "warranty": null,
                            "directReplacementCost": 48000
                        },
                        "torqueData": {
                            "torqueFullLoad": 1473,
                            "torqueBreakDown": 2946,
                            "torqueLockedRotor": 1473
                        }
                    },
                    {
                        "id": "exqipyj39",
                        "departmentId": "232esdnnc",
                        "description": "",
                        "name": "Injection Mold 1",
                        "batchAnalysisData": {
                            "modifiedCost": 45000,
                            "modifiedPower": 300,
                            "modifiedEfficiency": 96,
                            "modifiedPercentLoad": 85,
                            "rewindCost": 2000,
                            "rewindEfficiencyLoss": 1
                        },
                        "loadCharacteristicData": {
                            "efficiency75": 95.59,
                            "efficiency50": 94.86,
                            "efficiency25": 93.42,
                            "powerFactor100": null,
                            "powerFactor75": null,
                            "powerFactor50": null,
                            "powerFactor25": null,
                            "ampsIdle": null
                        },
                        "manualSpecificationData": {
                            "synchronousSpeed": 3600,
                            "frame": null,
                            "shaftPosiion": null,
                            "windingResistance": null,
                            "rotorBars": null,
                            "statorSlots": null,
                            "ampsLockedRotor": null,
                            "poles": null,
                            "currentType": null,
                            "ratedSpeed": null
                        },
                        "nameplateData": {
                            "efficiencyClass": 0,
                            "lineFrequency": 60,
                            "ratedMotorPower": 300,
                            "nominalEfficiency": 94,
                            "manufacturer": null,
                            "model": null,
                            "motorType": null,
                            "enclosureType": null,
                            "ratedVoltage": 460,
                            "serviceFactor": null,
                            "insulationClass": null,
                            "weight": null,
                            "numberOfPhases": null,
                            "fullLoadSpeed": 3580,
                            "fullLoadAmps": 334.35
                        },
                        "operationData": {
                            "annualOperatingHours": 8760,
                            "location": null,
                            "averageLoadFactor": 85,
                            "utilizationFactor": null,
                            "efficiencyAtAverageLoad": 94.07,
                            "powerFactorAtLoad": 84.19,
                            "currentAtLoad": 189.62
                        },
                        "otherData": {
                            "driveType": undefined,
                            "isVFD": false,
                            "hasLoggerData": false,
                            "voltageConnectionType": undefined
                        },
                        "purchaseInformationData": {
                            "catalogId": null,
                            "listPrice": 45000,
                            "warranty": null,
                            "directReplacementCost": 45000
                        },
                        "torqueData": {
                            "torqueFullLoad": undefined,
                            "torqueBreakDown": undefined,
                            "torqueLockedRotor": undefined
                        }
                    },
                    {
                        "id": "1ueb4mr7x",
                        "departmentId": "232esdnnc",
                        "description": "",
                        "name": "Dryer Blower",
                        "batchAnalysisData": {
                            "modifiedCost": undefined,
                            "modifiedPower": undefined,
                            "modifiedEfficiency": undefined,
                            "modifiedPercentLoad": undefined,
                            "rewindCost": undefined,
                            "rewindEfficiencyLoss": undefined
                        },
                        "loadCharacteristicData": {
                            "efficiency75": 93.03,
                            "efficiency50": 92.57,
                            "efficiency25": 91.4,
                            "powerFactor100": null,
                            "powerFactor75": null,
                            "powerFactor50": null,
                            "powerFactor25": null,
                            "ampsIdle": null
                        },
                        "manualSpecificationData": {
                            "synchronousSpeed": 1800,
                            "frame": null,
                            "shaftPosiion": null,
                            "windingResistance": null,
                            "rotorBars": null,
                            "statorSlots": null,
                            "ampsLockedRotor": null,
                            "poles": null,
                            "currentType": null,
                            "ratedSpeed": null
                        },
                        "nameplateData": {
                            "efficiencyClass": 0,
                            "lineFrequency": 60,
                            "ratedMotorPower": 1000,
                            "nominalEfficiency": 90,
                            "manufacturer": null,
                            "model": null,
                            "motorType": null,
                            "enclosureType": null,
                            "ratedVoltage": 2300,
                            "serviceFactor": 115,
                            "insulationClass": null,
                            "weight": null,
                            "numberOfPhases": null,
                            "fullLoadSpeed": 1780,
                            "fullLoadAmps": 225.75
                        },
                        "operationData": {
                            "annualOperatingHours": 8760,
                            "location": null,
                            "averageLoadFactor": 94,
                            "utilizationFactor": null,
                            "efficiencyAtAverageLoad": 90.06,
                            "powerFactorAtLoad": 87.78,
                            "currentAtLoad": 178.81
                        },
                        "otherData": {
                            "driveType": 0,
                            "isVFD": true,
                            "hasLoggerData": true,
                            "voltageConnectionType": null
                        },
                        "purchaseInformationData": {
                            "catalogId": null,
                            "listPrice": 100178,
                            "warranty": null,
                            "directReplacementCost": 100178
                        },
                        "torqueData": {
                            "torqueFullLoad": undefined,
                            "torqueBreakDown": undefined,
                            "torqueLockedRotor": undefined
                        }
                    }
                ]
            },
            {
                "name": "Testing and Quality",
                "operatingHours": 2000,
                "description": "This department physically tests the toys for defects and to confirm safety ratings.",
                "id": "x262ugdp5",
                "catalog": [
                    {
                        "id": "kvag8gt6e",
                        "departmentId": "x262ugdp5",
                        "description": "This motor is used to determine the force required to brake the toy when compressed",
                        "name": "Toy Crusher",
                        "nemaTable": "Table 12-11",
                        "voltageLimit": 600,
                        "batchAnalysisData": {
                            "modifiedCost": 5500,
                            "modifiedPower": 50,
                            "modifiedEfficiency": 94,
                            "modifiedPercentLoad": 75,
                            "rewindCost": 2000,
                            "rewindEfficiencyLoss": 5
                        },
                        "loadCharacteristicData": {
                            "efficiency75": 94.18,
                            "efficiency50": 93.51,
                            "efficiency25": 90.45,
                            "powerFactor100": 87,
                            "powerFactor75": 81,
                            "powerFactor50": 71,
                            "powerFactor25": 49,
                            "ampsIdle": 19.5
                        },
                        "manualSpecificationData": {
                            "synchronousSpeed": 1800,
                            "frame": null,
                            "shaftPosiion": "Horizontal",
                            "windingResistance": 1230,
                            "rotorBars": 40,
                            "statorSlots": 48,
                            "ampsLockedRotor": 300,
                            "poles": 6,
                            "currentType": "AC",
                            "ratedSpeed": 1750
                        },
                        "nameplateData": {
                            "ratedMotorPower": 125,
                            "efficiencyClass": 1,
                            "lineFrequency": 60,
                            "nominalEfficiency": 94.1,
                            "manufacturer": "G.E.",
                            "model": "General Purpose ",
                            "motorType": "NEMA A",
                            "enclosureType": "TEFC",
                            "ratedVoltage": 460,
                            "serviceFactor": 115,
                            "insulationClass": "F",
                            "weight": 806,
                            "numberOfPhases": 3,
                            "fullLoadSpeed": 1780,
                            "fullLoadAmps": 138.68
                        },
                        "operationData": {
                            "location": null,
                            "annualOperatingHours": 8760,
                            "averageLoadFactor": 30,
                            "utilizationFactor": 75,
                            "efficiencyAtAverageLoad": 92.06,
                            "powerFactorAtLoad": 67.55,
                            "currentAtLoad": 56.39,
                            "operatingHours": {
                                "weeksPerYear": 52.14,
                                "daysPerWeek": 7,
                                "hoursPerDay": 24,
                                "minutesPerHour": 60,
                                "secondsPerMinute": 60,
                                "hoursPerYear": 8760
                            }
                        },
                        "otherData": {
                            "driveType": 1,
                            "isVFD": true,
                            "hasLoggerData": false,
                            "voltageConnectionType": "Delta"
                        },
                        "purchaseInformationData": {
                            "catalogId": "AEM4400-4",
                            "listPrice": 6000,
                            "warranty": null,
                            "directReplacementCost": 5000
                        },
                        "torqueData": {
                            "torqueFullLoad": 925,
                            "torqueBreakDown": 931,
                            "torqueLockedRotor": 384
                        }
                    },
                    {
                        "id": "lefdrs3oc",
                        "departmentId": "x262ugdp5",
                        "description": "This motor is used to drop toys at various heights to test durability ",
                        "name": "Toy Dropper",
                        "nemaTable": "Table 12-11",
                        "voltageLimit": 600,
                        "batchAnalysisData": {
                            "modifiedCost": 4500,
                            "modifiedPower": 30,
                            "modifiedEfficiency": 93.6,
                            "modifiedPercentLoad": 84,
                            "rewindCost": 1000,
                            "rewindEfficiencyLoss": 2
                        },
                        "loadCharacteristicData": {
                            "efficiency75": 92.84,
                            "efficiency50": 92.34,
                            "efficiency25": 89.64,
                            "powerFactor100": 88,
                            "powerFactor75": 82,
                            "powerFactor50": 72,
                            "powerFactor25": 49,
                            "ampsIdle": 19.5
                        },
                        "manualSpecificationData": {
                            "synchronousSpeed": 1800,
                            "frame": null,
                            "shaftPosiion": "Vertical",
                            "windingResistance": 1230,
                            "rotorBars": 40,
                            "statorSlots": 48,
                            "ampsLockedRotor": 300,
                            "poles": 4,
                            "currentType": "AC",
                            "ratedSpeed": null
                        },
                        "nameplateData": {
                            "ratedMotorPower": 30,
                            "efficiencyClass": 1,
                            "lineFrequency": 60,
                            "nominalEfficiency": 92.4,
                            "manufacturer": "Siemens",
                            "model": null,
                            "motorType": "Nema B",
                            "enclosureType": "ODP",
                            "ratedVoltage": 575,
                            "serviceFactor": 115,
                            "insulationClass": "F",
                            "weight": 116,
                            "numberOfPhases": 3,
                            "fullLoadSpeed": 1780,
                            "fullLoadAmps": 28.77
                        },
                        "operationData": {
                            "location": null,
                            "annualOperatingHours": 8760,
                            "averageLoadFactor": 63,
                            "utilizationFactor": 100,
                            "efficiencyAtAverageLoad": 92.78,
                            "powerFactorAtLoad": 78.94,
                            "currentAtLoad": 19.33,
                            "operatingHours": {
                                "weeksPerYear": 52.14,
                                "daysPerWeek": 7,
                                "hoursPerDay": 24,
                                "minutesPerHour": 60,
                                "secondsPerMinute": 60,
                                "hoursPerYear": 8760
                            }
                        },
                        "otherData": {
                            "driveType": 2,
                            "isVFD": false,
                            "hasLoggerData": false,
                            "voltageConnectionType": "Delta"
                        },
                        "purchaseInformationData": {
                            "catalogId": null,
                            "listPrice": 5500,
                            "warranty": new Date("2025-10-05"),
                            "directReplacementCost": 5500
                        },
                        "torqueData": {
                            "torqueFullLoad": 118,
                            "torqueBreakDown": 346,
                            "torqueLockedRotor": 171
                        }
                    },
                    {
                        "id": "jdd86lj1o",
                        "departmentId": "x262ugdp5",
                        "description": "",
                        "name": "Tensile Testing",
                        "nemaTable": "Table 12-11",
                        "voltageLimit": 600,
                        "batchAnalysisData": {
                            "modifiedCost": 4000,
                            "modifiedPower": 30,
                            "modifiedEfficiency": 93.6,
                            "modifiedPercentLoad": 84,
                            "rewindCost": 1000,
                            "rewindEfficiencyLoss": 0.5
                        },
                        "loadCharacteristicData": {
                            "efficiency75": 93.36,
                            "efficiency50": 92.92,
                            "efficiency25": 90.39,
                            "powerFactor100": 94,
                            "powerFactor75": 93,
                            "powerFactor50": 87,
                            "powerFactor25": 75,
                            "ampsIdle": 20
                        },
                        "manualSpecificationData": {
                            "synchronousSpeed": 1800,
                            "frame": null,
                            "shaftPosiion": "Vertical",
                            "windingResistance": 1230,
                            "rotorBars": 40,
                            "statorSlots": 48,
                            "ampsLockedRotor": 300,
                            "poles": 4,
                            "currentType": "AC",
                            "ratedSpeed": null
                        },
                        "nameplateData": {
                            "ratedMotorPower": 50,
                            "efficiencyClass": 1,
                            "lineFrequency": 60,
                            "nominalEfficiency": 93,
                            "manufacturer": "GE",
                            "model": null,
                            "motorType": "NEMA B",
                            "enclosureType": "ODP",
                            "ratedVoltage": 460,
                            "serviceFactor": 115,
                            "insulationClass": "F",
                            "weight": 150,
                            "numberOfPhases": 3,
                            "fullLoadSpeed": 1780,
                            "fullLoadAmps": 58.68
                        },
                        "operationData": {
                            "location": null,
                            "annualOperatingHours": 8760,
                            "averageLoadFactor": 85,
                            "utilizationFactor": 100,
                            "efficiencyAtAverageLoad": 93.27,
                            "powerFactorAtLoad": 84.58,
                            "currentAtLoad": 50.44,
                            "operatingHours": {
                                "weeksPerYear": 52.14,
                                "daysPerWeek": 7,
                                "hoursPerDay": 24,
                                "minutesPerHour": 60,
                                "secondsPerMinute": 60,
                                "hoursPerYear": 8760
                            }
                        },
                        "otherData": {
                            "driveType": 3,
                            "isVFD": false,
                            "hasLoggerData": false,
                            "voltageConnectionType": "Delta"
                        },
                        "purchaseInformationData": {
                            "catalogId": null,
                            "listPrice": 4500,
                            "warranty": null,
                            "directReplacementCost": 4500
                        },
                        "torqueData": {
                            "torqueFullLoad": 118,
                            "torqueBreakDown": 346,
                            "torqueLockedRotor": 171
                        }
                    }
                ]
            }
        ],
        "displayOptions": {
            "batchAnalysisOptions": {
                "displayBatchAnalysis": true,
                "modifiedCost": true,
                "modifiedPower": true,
                "modifiedEfficiency": true,
                "modifiedPercentLoad": true,
                "rewindCost": true,
                "rewindEfficiencyLoss": true
            },
            "loadCharactersticOptions": {
                "displayLoadCharacteristics": true,
                "efficiency75": true,
                "efficiency50": true,
                "efficiency25": true,
                "powerFactor100": true,
                "powerFactor75": true,
                "powerFactor50": true,
                "powerFactor25": true,
                "ampsIdle": true
            },
            "manualSpecificationOptions": {
                "displayManualSpecifications": true,
                "frame": true,
                "shaftPosiion": true,
                "windingResistance": true,
                "rotorBars": true,
                "statorSlots": true,
                "ampsLockedRotor": true,
                "poles": true,
                "currentType": true,
                "ratedSpeed": true
            },
            "nameplateDataOptions": {
                "displayNameplateData": true,
                "manufacturer": true,
                "model": true,
                "motorType": true,
                "enclosureType": true,
                "ratedVoltage": true,
                "serviceFactor": true,
                "insulationClass": true,
                "weight": true,
                "numberOfPhases": true,
                "fullLoadSpeed": true,
                "fullLoadAmps": true
            },
            "operationDataOptions": {
                "displayOperationData": true,
                "location": true,
                "annualOperatingHours": true,
                "averageLoadFactor": true,
                "utilizationFactor": true,
                "efficiencyAtAverageLoad": true,
                "powerFactorAtLoad": true,
                "currentAtLoad": true
            },
            "otherOptions": {
                "displayOther": true,
                "driveType": true,
                "isVFD": true,
                "hasLoggerData": true,
                "voltageConnectionType": true
            },
            "purchaseInformationOptions": {
                "displayPurchaseInformation": true,
                "catalogId": true,
                "listPrice": true,
                "warranty": true,
                "directReplacementCost": true
            },
            "torqueOptions": {
                "displayTorque": true,
                "torqueFullLoad": true,
                "torqueBreakDown": true,
                "torqueLockedRotor": true
            }
        }
    },
    "createdDate": new Date(),
    "modifiedDate": new Date(),
    "type": "motorInventory",
    "name": "Toy Factory",
    "appVersion": "0.7.0-beta",
    "isExample": true,
}