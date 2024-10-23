import { Assessment } from "../shared/models/assessment";
import { Settings } from "../shared/models/settings";



export const MockWaterAssessment: Assessment = {
    "name": "Water Example",
    "createdDate": new Date("2024-10-16T16:37:36.336Z"),
    "modifiedDate": new Date("2024-10-16T16:37:36.336Z"),
    "type": "Water",
    "appVersion": "1.5.2",
    "directoryId": 2,
    "water": {
        "name": "Baseline",
        "modifications": [],
        "setupDone": false,
        "systemBasics": {
            "utilityType": "Electricity",
            "electricityCost": 0.066,
            "conductivityUnit": "MuS/cm",
            "notes": ""
        },
        "intakeSources": [
            {
                "processComponentType": "water-intake",
                "createdByAssessment": true,
                "name": "Municipal Water A",
                "className": "water-intake",
                "isValid": true,
                "diagramNodeId": "n_8v95pqn",
                "modifiedDate": new Date("2024-10-16T16:37:36.336Z"),
                "handles": [
                    {
                        "id": "a",
                        "visible": true
                    },
                    {
                        "id": "b",
                        "visible": false
                    },
                    {
                        "id": "c",
                        "visible": false
                    },
                    {
                        "id": "d",
                        "visible": false
                    },
                    {
                        "id": "e",
                        "visible": true
                    },
                    {
                        "id": "f",
                        "visible": false
                    },
                    {
                        "id": "g",
                        "visible": false
                    },
                    {
                        "id": "h",
                        "visible": false
                    }
                ],
                "sourceType": 0,
                "annualUse": 0,
                "addedMotorEnergy": []
            },
            {
                "processComponentType": "water-intake",
                "createdByAssessment": true,
                "name": "Municipal Water B",
                "className": "water-intake",
                "isValid": true,
                "diagramNodeId": "n_k8i3z5t",
                "modifiedDate": new Date("2024-10-16T16:37:36.336Z"),
                "handles": [
                    {
                        "id": "a",
                        "visible": true
                    },
                    {
                        "id": "b",
                        "visible": true
                    },
                    {
                        "id": "c",
                        "visible": false
                    },
                    {
                        "id": "d",
                        "visible": false
                    },
                    {
                        "id": "e",
                        "visible": true
                    },
                    {
                        "id": "f",
                        "visible": true
                    },
                    {
                        "id": "g",
                        "visible": false
                    },
                    {
                        "id": "h",
                        "visible": false
                    }
                ],
                "sourceType": 0,
                "annualUse": 0,
                "addedMotorEnergy": []
            }
        ],
        "dischargeOutlets": [
            {
                "processComponentType": "water-discharge",
                "createdByAssessment": true,
                "name": "Municipal Sewer A",
                "className": "water-discharge",
                "isValid": true,
                "diagramNodeId": "n_40pl8g8",
                "modifiedDate": new Date("2024-10-16T16:37:36.336Z"),
                "handles": [
                    {
                        "id": "a",
                        "visible": true
                    },
                    {
                        "id": "b",
                        "visible": true
                    },
                    {
                        "id": "c",
                        "visible": false
                    },
                    {
                        "id": "d",
                        "visible": false
                    },
                    {
                        "id": "e",
                        "visible": true
                    },
                    {
                        "id": "f",
                        "visible": true
                    },
                    {
                        "id": "g",
                        "visible": false
                    },
                    {
                        "id": "h",
                        "visible": false
                    }
                ],
                "outletType": 0,
                "annualUse": 0,
                "addedMotorEnergy": []
            },
            {
                "processComponentType": "water-discharge",
                "createdByAssessment": true,
                "name": "Municipal Sewer B",
                "className": "water-discharge",
                "isValid": true,
                "diagramNodeId": "n_km3rucx",
                "modifiedDate": new Date("2024-10-16T16:37:36.336Z"),
                "handles": [
                    {
                        "id": "a",
                        "visible": true
                    },
                    {
                        "id": "b",
                        "visible": true
                    },
                    {
                        "id": "c",
                        "visible": false
                    },
                    {
                        "id": "d",
                        "visible": false
                    },
                    {
                        "id": "e",
                        "visible": true
                    },
                    {
                        "id": "f",
                        "visible": true
                    },
                    {
                        "id": "g",
                        "visible": false
                    },
                    {
                        "id": "h",
                        "visible": false
                    }
                ],
                "outletType": 0,
                "annualUse": 0,
                "addedMotorEnergy": []
            }
        ],
        "waterUsingSystems": [
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Cooling Tower",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_fo9ndq3",
                "modifiedDate": new Date("2024-10-16T16:37:36.336Z"),
                "handles": [
                    {
                        "id": "a",
                        "visible": true
                    },
                    {
                        "id": "b",
                        "visible": true
                    },
                    {
                        "id": "c",
                        "visible": false
                    },
                    {
                        "id": "d",
                        "visible": false
                    },
                    {
                        "id": "e",
                        "visible": true
                    },
                    {
                        "id": "f",
                        "visible": true
                    },
                    {
                        "id": "g",
                        "visible": false
                    },
                    {
                        "id": "h",
                        "visible": false
                    }
                ],
                "systemType": 0,
                "hoursPerYear": 8760,
                "intakeSources": [
                    {
                        "sourceType": 0,
                        "annualUse": 0
                    }
                ],
                "processUse": {
                    "waterRequiredMetric": 0,
                    "waterRequiredMetricValue": 0,
                    "waterConsumedMetric": 0,
                    "waterConsumedMetricValue": 0,
                    "waterLossMetric": 0,
                    "waterLossMetricValue": 0,
                    "annualProduction": 0,
                    "fractionGrossWaterRecirculated": 0,
                },
                "coolingTower": {
                    "tonnage": undefined,
                    "loadFactor": undefined,
                    "evaporationRateDegree": undefined,
                    "temperatureDrop": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "boilerWater": {
                    "power": undefined,
                    "loadFactor": undefined,
                    "steamPerPower": undefined,
                    "feedwaterConductivity": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "kitchenRestroom": {
                    "employeeCount": undefined,
                    "workdaysPerYear": undefined,
                    "dailyUsePerEmployee": undefined
                },
                "landscaping": {
                    "areaIrrigated": undefined,
                    "yearlyInchesIrrigated": undefined,
                },
                "heatEnergy": {
                    "heatingFuelType": 0,
                    "incomingTemp": 0,
                    "outgoingTemp": 0,
                    "heaterEfficiency": 0,
                    "wasteWaterDischarge": 0
                },
                "addedMotorEquipment": [],
                "sourceWater": undefined,
                "recycledWater": undefined,
                "recirculatedWater": undefined,
                "dischargeWater": undefined,
                "dischargeWaterRecycled": undefined,
                "waterInProduct": undefined,
                "knownLosses": undefined,
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Water Using System",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_35zotef",
                "modifiedDate": new Date("2024-10-16T16:37:36.336Z"),
                "handles": [
                    {
                        "id": "a",
                        "visible": true
                    },
                    {
                        "id": "b",
                        "visible": true
                    },
                    {
                        "id": "c",
                        "visible": false
                    },
                    {
                        "id": "d",
                        "visible": false
                    },
                    {
                        "id": "e",
                        "visible": true
                    },
                    {
                        "id": "f",
                        "visible": true
                    },
                    {
                        "id": "g",
                        "visible": false
                    },
                    {
                        "id": "h",
                        "visible": false
                    }
                ],
                "systemType": 0,
                "hoursPerYear": 8760,
                "intakeSources": [
                    {
                        "sourceType": 0,
                        "annualUse": 0
                    }
                ],
                "processUse": {
                    "waterRequiredMetric": 0,
                    "waterRequiredMetricValue": 0,
                    "waterConsumedMetric": 0,
                    "waterConsumedMetricValue": 0,
                    "waterLossMetric": 0,
                    "waterLossMetricValue": 0,
                    "annualProduction": 0,
                    "fractionGrossWaterRecirculated": 0,
                },
                "coolingTower": {
                    "tonnage": undefined,
                    "loadFactor": undefined,
                    "evaporationRateDegree": undefined,
                    "temperatureDrop": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "boilerWater": {
                    "power": undefined,
                    "loadFactor": undefined,
                    "steamPerPower": undefined,
                    "feedwaterConductivity": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "kitchenRestroom": {
                    "employeeCount": undefined,
                    "workdaysPerYear": undefined,
                    "dailyUsePerEmployee": undefined
                },
                "landscaping": {
                    "areaIrrigated": undefined,
                    "yearlyInchesIrrigated": undefined,
                },
                "heatEnergy": {
                    "heatingFuelType": 0,
                    "incomingTemp": 0,
                    "outgoingTemp": 0,
                    "heaterEfficiency": 0,
                    "wasteWaterDischarge": 0
                },
                "addedMotorEquipment": [],
                "sourceWater": undefined,
                "recycledWater": undefined,
                "recirculatedWater": undefined,
                "dischargeWater": undefined,
                "dischargeWaterRecycled": undefined,
                "waterInProduct": undefined,
                "knownLosses": undefined,
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Quench Tank",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_jhjsv61",
                "modifiedDate": new Date("2024-10-16T16:37:36.336Z"),
                "handles": [
                    {
                        "id": "a",
                        "visible": true
                    },
                    {
                        "id": "b",
                        "visible": true
                    },
                    {
                        "id": "c",
                        "visible": false
                    },
                    {
                        "id": "d",
                        "visible": false
                    },
                    {
                        "id": "e",
                        "visible": true
                    },
                    {
                        "id": "f",
                        "visible": true
                    },
                    {
                        "id": "g",
                        "visible": false
                    },
                    {
                        "id": "h",
                        "visible": false
                    }
                ],
                "systemType": 0,
                "hoursPerYear": 8760,
                "intakeSources": [
                    {
                        "sourceType": 0,
                        "annualUse": 0
                    }
                ],
                "processUse": {
                    "waterRequiredMetric": 0,
                    "waterRequiredMetricValue": 0,
                    "waterConsumedMetric": 0,
                    "waterConsumedMetricValue": 0,
                    "waterLossMetric": 0,
                    "waterLossMetricValue": 0,
                    "annualProduction": 0,
                    "fractionGrossWaterRecirculated": 0,
                },
                "coolingTower": {
                    "tonnage": undefined,
                    "loadFactor": undefined,
                    "evaporationRateDegree": undefined,
                    "temperatureDrop": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "boilerWater": {
                    "power": undefined,
                    "loadFactor": undefined,
                    "steamPerPower": undefined,
                    "feedwaterConductivity": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "kitchenRestroom": {
                    "employeeCount": undefined,
                    "workdaysPerYear": undefined,
                    "dailyUsePerEmployee": undefined
                },
                "landscaping": {
                    "areaIrrigated": undefined,
                    "yearlyInchesIrrigated": undefined,
                },
                "heatEnergy": {
                    "heatingFuelType": 0,
                    "incomingTemp": 0,
                    "outgoingTemp": 0,
                    "heaterEfficiency": 0,
                    "wasteWaterDischarge": 0
                },
                "addedMotorEquipment": [],
                "sourceWater": undefined,
                "recycledWater": undefined,
                "recirculatedWater": undefined,
                "dischargeWater": undefined,
                "dischargeWaterRecycled": undefined,
                "waterInProduct": undefined,
                "knownLosses": undefined,
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Vacuum Pumps",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_9jgt12z",
                "modifiedDate": new Date("2024-10-16T16:37:36.336Z"),
                "handles": [
                    {
                        "id": "a",
                        "visible": true
                    },
                    {
                        "id": "b",
                        "visible": true
                    },
                    {
                        "id": "c",
                        "visible": false
                    },
                    {
                        "id": "d",
                        "visible": false
                    },
                    {
                        "id": "e",
                        "visible": true
                    },
                    {
                        "id": "f",
                        "visible": true
                    },
                    {
                        "id": "g",
                        "visible": false
                    },
                    {
                        "id": "h",
                        "visible": false
                    }
                ],
                "systemType": 0,
                "hoursPerYear": 8760,
                "intakeSources": [
                    {
                        "sourceType": 0,
                        "annualUse": 0
                    }
                ],
                "processUse": {
                    "waterRequiredMetric": 0,
                    "waterRequiredMetricValue": 0,
                    "waterConsumedMetric": 0,
                    "waterConsumedMetricValue": 0,
                    "waterLossMetric": 0,
                    "waterLossMetricValue": 0,
                    "annualProduction": 0,
                    "fractionGrossWaterRecirculated": 0,
                },
                "coolingTower": {
                    "tonnage": undefined,
                    "loadFactor": undefined,
                    "evaporationRateDegree": undefined,
                    "temperatureDrop": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "boilerWater": {
                    "power": undefined,
                    "loadFactor": undefined,
                    "steamPerPower": undefined,
                    "feedwaterConductivity": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "kitchenRestroom": {
                    "employeeCount": undefined,
                    "workdaysPerYear": undefined,
                    "dailyUsePerEmployee": undefined
                },
                "landscaping": {
                    "areaIrrigated": undefined,
                    "yearlyInchesIrrigated": undefined,
                },
                "heatEnergy": {
                    "heatingFuelType": 0,
                    "incomingTemp": 0,
                    "outgoingTemp": 0,
                    "heaterEfficiency": 0,
                    "wasteWaterDischarge": 0
                },
                "addedMotorEquipment": [],
                "sourceWater": undefined,
                "recycledWater": undefined,
                "recirculatedWater": undefined,
                "dischargeWater": undefined,
                "dischargeWaterRecycled": undefined,
                "waterInProduct": undefined,
                "knownLosses": undefined,
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Wash Bay",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_0uc4i5b",
                "modifiedDate": new Date("2024-10-16T16:37:36.336Z"),
                "handles": [
                    {
                        "id": "a",
                        "visible": true
                    },
                    {
                        "id": "b",
                        "visible": true
                    },
                    {
                        "id": "c",
                        "visible": false
                    },
                    {
                        "id": "d",
                        "visible": false
                    },
                    {
                        "id": "e",
                        "visible": true
                    },
                    {
                        "id": "f",
                        "visible": true
                    },
                    {
                        "id": "g",
                        "visible": false
                    },
                    {
                        "id": "h",
                        "visible": false
                    }
                ],
                "systemType": 0,
                "hoursPerYear": 8760,
                "intakeSources": [
                    {
                        "sourceType": 0,
                        "annualUse": 0
                    }
                ],
                "processUse": {
                    "waterRequiredMetric": 0,
                    "waterRequiredMetricValue": 0,
                    "waterConsumedMetric": 0,
                    "waterConsumedMetricValue": 0,
                    "waterLossMetric": 0,
                    "waterLossMetricValue": 0,
                    "annualProduction": 0,
                    "fractionGrossWaterRecirculated": 0,
                },
                "coolingTower": {
                    "tonnage": undefined,
                    "loadFactor": undefined,
                    "evaporationRateDegree": undefined,
                    "temperatureDrop": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "boilerWater": {
                    "power": undefined,
                    "loadFactor": undefined,
                    "steamPerPower": undefined,
                    "feedwaterConductivity": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "kitchenRestroom": {
                    "employeeCount": undefined,
                    "workdaysPerYear": undefined,
                    "dailyUsePerEmployee": undefined
                },
                "landscaping": {
                    "areaIrrigated": undefined,
                    "yearlyInchesIrrigated": undefined,
                },
                "heatEnergy": {
                    "heatingFuelType": 0,
                    "incomingTemp": 0,
                    "outgoingTemp": 0,
                    "heaterEfficiency": 0,
                    "wasteWaterDischarge": 0
                },
                "addedMotorEquipment": [],
                "sourceWater": undefined,
                "recycledWater": undefined,
                "recirculatedWater": undefined,
                "dischargeWater": undefined,
                "dischargeWaterRecycled": undefined,
                "waterInProduct": undefined,
                "knownLosses": undefined,
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Sanitary",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_59n7him",
                "modifiedDate": new Date("2024-10-16T16:37:36.336Z"),
                "handles": [
                    {
                        "id": "a",
                        "visible": true
                    },
                    {
                        "id": "b",
                        "visible": true
                    },
                    {
                        "id": "c",
                        "visible": false
                    },
                    {
                        "id": "d",
                        "visible": false
                    },
                    {
                        "id": "e",
                        "visible": true
                    },
                    {
                        "id": "f",
                        "visible": true
                    },
                    {
                        "id": "g",
                        "visible": false
                    },
                    {
                        "id": "h",
                        "visible": false
                    }
                ],
                "systemType": 0,
                "hoursPerYear": 8760,
                "intakeSources": [
                    {
                        "sourceType": 0,
                        "annualUse": 0
                    }
                ],
                "processUse": {
                    "waterRequiredMetric": 0,
                    "waterRequiredMetricValue": 0,
                    "waterConsumedMetric": 0,
                    "waterConsumedMetricValue": 0,
                    "waterLossMetric": 0,
                    "waterLossMetricValue": 0,
                    "annualProduction": 0,
                    "fractionGrossWaterRecirculated": 0,
                },
                "coolingTower": {
                    "tonnage": undefined,
                    "loadFactor": undefined,
                    "evaporationRateDegree": undefined,
                    "temperatureDrop": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "boilerWater": {
                    "power": undefined,
                    "loadFactor": undefined,
                    "steamPerPower": undefined,
                    "feedwaterConductivity": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "kitchenRestroom": {
                    "employeeCount": undefined,
                    "workdaysPerYear": undefined,
                    "dailyUsePerEmployee": undefined
                },
                "landscaping": {
                    "areaIrrigated": undefined,
                    "yearlyInchesIrrigated": undefined,
                },
                "heatEnergy": {
                    "heatingFuelType": 0,
                    "incomingTemp": 0,
                    "outgoingTemp": 0,
                    "heaterEfficiency": 0,
                    "wasteWaterDischarge": 0
                },
                "addedMotorEquipment": [],
                "sourceWater": undefined,
                "recycledWater": undefined,
                "recirculatedWater": undefined,
                "dischargeWater": undefined,
                "dischargeWaterRecycled": undefined,
                "waterInProduct": undefined,
                "knownLosses": undefined,
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Chillers",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_ewqu18d",
                "modifiedDate": new Date("2024-10-16T16:37:36.336Z"),
                "handles": [
                    {
                        "id": "a",
                        "visible": true
                    },
                    {
                        "id": "b",
                        "visible": true
                    },
                    {
                        "id": "c",
                        "visible": false
                    },
                    {
                        "id": "d",
                        "visible": false
                    },
                    {
                        "id": "e",
                        "visible": true
                    },
                    {
                        "id": "f",
                        "visible": true
                    },
                    {
                        "id": "g",
                        "visible": false
                    },
                    {
                        "id": "h",
                        "visible": false
                    }
                ],
                "systemType": 0,
                "hoursPerYear": 8760,
                "intakeSources": [
                    {
                        "sourceType": 0,
                        "annualUse": 0
                    }
                ],
                "processUse": {
                    "waterRequiredMetric": 0,
                    "waterRequiredMetricValue": 0,
                    "waterConsumedMetric": 0,
                    "waterConsumedMetricValue": 0,
                    "waterLossMetric": 0,
                    "waterLossMetricValue": 0,
                    "annualProduction": 0,
                    "fractionGrossWaterRecirculated": 0,
                },
                "coolingTower": {
                    "tonnage": undefined,
                    "loadFactor": undefined,
                    "evaporationRateDegree": undefined,
                    "temperatureDrop": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "boilerWater": {
                    "power": undefined,
                    "loadFactor": undefined,
                    "steamPerPower": undefined,
                    "feedwaterConductivity": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "kitchenRestroom": {
                    "employeeCount": undefined,
                    "workdaysPerYear": undefined,
                    "dailyUsePerEmployee": undefined
                },
                "landscaping": {
                    "areaIrrigated": undefined,
                    "yearlyInchesIrrigated": undefined,
                },
                "heatEnergy": {
                    "heatingFuelType": 0,
                    "incomingTemp": 0,
                    "outgoingTemp": 0,
                    "heaterEfficiency": 0,
                    "wasteWaterDischarge": 0
                },
                "addedMotorEquipment": [],
                "sourceWater": undefined,
                "recycledWater": undefined,
                "recirculatedWater": undefined,
                "dischargeWater": undefined,
                "dischargeWaterRecycled": undefined,
                "waterInProduct": undefined,
                "knownLosses": undefined,
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Blending",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_zqp4xwq",
                "modifiedDate": new Date("2024-10-16T16:37:36.336Z"),
                "handles": [
                    {
                        "id": "a",
                        "visible": true
                    },
                    {
                        "id": "b",
                        "visible": false
                    },
                    {
                        "id": "c",
                        "visible": false
                    },
                    {
                        "id": "d",
                        "visible": false
                    },
                    {
                        "id": "e",
                        "visible": true
                    },
                    {
                        "id": "f",
                        "visible": false
                    },
                    {
                        "id": "g",
                        "visible": false
                    },
                    {
                        "id": "h",
                        "visible": false
                    }
                ],
                "systemType": 0,
                "hoursPerYear": 8760,
                "intakeSources": [
                    {
                        "sourceType": 0,
                        "annualUse": 0
                    }
                ],
                "processUse": {
                    "waterRequiredMetric": 0,
                    "waterRequiredMetricValue": 0,
                    "waterConsumedMetric": 0,
                    "waterConsumedMetricValue": 0,
                    "waterLossMetric": 0,
                    "waterLossMetricValue": 0,
                    "annualProduction": 0,
                    "fractionGrossWaterRecirculated": 0,
                },
                "coolingTower": {
                    "tonnage": undefined,
                    "loadFactor": undefined,
                    "evaporationRateDegree": undefined,
                    "temperatureDrop": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "boilerWater": {
                    "power": undefined,
                    "loadFactor": undefined,
                    "steamPerPower": undefined,
                    "feedwaterConductivity": undefined,
                    "makeupConductivity": undefined,
                    "blowdownConductivity": undefined,
                },
                "kitchenRestroom": {
                    "employeeCount": undefined,
                    "workdaysPerYear": undefined,
                    "dailyUsePerEmployee": undefined
                },
                "landscaping": {
                    "areaIrrigated": undefined,
                    "yearlyInchesIrrigated": undefined,
                },
                "heatEnergy": {
                    "heatingFuelType": 0,
                    "incomingTemp": 0,
                    "outgoingTemp": 0,
                    "heaterEfficiency": 0,
                    "wasteWaterDischarge": 0
                },
                "addedMotorEquipment": [],
                "sourceWater": undefined,
                "recycledWater": undefined,
                "recirculatedWater": undefined,
                "dischargeWater": undefined,
                "dischargeWaterRecycled": undefined,
                "waterInProduct": undefined,
                "knownLosses": undefined,
            }
        ],
        "waterTreatments": [
            {
                "processComponentType": "water-treatment",
                "createdByAssessment": false,
                "name": "Chlorine",
                "className": "water-treatment",
                "isValid": true,
                "diagramNodeId": "n_kqvywf4",
                "modifiedDate": new Date("2024-10-16T17:45:42.331Z"),
                "handles": [
                    {
                        "id": "a",
                        "visible": true
                    },
                    {
                        "id": "b",
                        "visible": true
                    },
                    {
                        "id": "c",
                        "visible": false
                    },
                    {
                        "id": "d",
                        "visible": false
                    },
                    {
                        "id": "e",
                        "visible": true
                    },
                    {
                        "id": "f",
                        "visible": true
                    },
                    {
                        "id": "g",
                        "visible": false
                    },
                    {
                        "id": "h",
                        "visible": false
                    }
                ],
                "treatmentType": 5,
                "customTreatmentType": null,
                "cost": 2,
                "flowValue": 0
            },
            {
                "processComponentType": "water-treatment",
                "createdByAssessment": false,
                "name": "Chemical Treatment 2",
                "className": "water-treatment",
                "isValid": true,
                "diagramNodeId": "n_eaxzfq5",
                "modifiedDate": new Date("2024-10-16T17:46:02.854Z"),
                "handles": [
                    {
                        "id": "a",
                        "visible": true
                    },
                    {
                        "id": "b",
                        "visible": true
                    },
                    {
                        "id": "c",
                        "visible": false
                    },
                    {
                        "id": "d",
                        "visible": false
                    },
                    {
                        "id": "e",
                        "visible": true
                    },
                    {
                        "id": "f",
                        "visible": true
                    },
                    {
                        "id": "g",
                        "visible": false
                    },
                    {
                        "id": "h",
                        "visible": false
                    }
                ],
                "treatmentType": 7,
                "customTreatmentType": null,
                "cost": 2,
                "flowValue": 0
            },
            {
                "processComponentType": "water-treatment",
                "createdByAssessment": false,
                "cost": 1,
                "name": "Chemical Treatment 1",
                "className": "water-treatment",
                "isValid": true,
                "diagramNodeId": "n_4ml8a89",
                "modifiedDate": new Date("2024-10-22T15:15:11.940Z"),
                "handles": [
                    {
                        "id": "a",
                        "visible": true
                    },
                    {
                        "id": "b",
                        "visible": true
                    },
                    {
                        "id": "c",
                        "visible": false
                    },
                    {
                        "id": "d",
                        "visible": false
                    },
                    {
                        "id": "e",
                        "visible": true
                    },
                    {
                        "id": "f",
                        "visible": true
                    },
                    {
                        "id": "g",
                        "visible": false
                    },
                    {
                        "id": "h",
                        "visible": false
                    }
                ],
                "treatmentType": 1,
                "customTreatmentType": null,
                "flowValue": null
            }
        ],
        "wasteWaterTreatments": []
    },
    "id": 75,
    "diagramId": 1
}





export const MockWaterAssessmentSettings: Settings = {
    "language": "English",
    "currency": "$",
    "unitsOfMeasure": "Imperial",
    "distanceMeasurement": "ft",
    "flowMeasurement": "MGD",
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
    "disablePsatTutorial": false,
    "disableFansTutorial": false,
    "disablePhastTutorial": false,
    "disableWasteWaterTutorial": false,
    "disableSteamTutorial": false,
    "disableMotorInventoryTutorial": false,
    "disableTreasureHuntTutorial": false,
    "disableDataExplorerTutorial": false,
    facilityInfo: {
        companyName: "ORNL",
        facilityName: "ORNL Test Facility",
        address: {
            street: "1 Bethel Valley Rd.",
            city: "Oak Ridge",
            state: "TN",
            country: "U.S.",
            zip: "37831"
        },
        facilityContact: {
            contactName: "T. Owner",
            phoneNumber: 8655767658,
            email: "t.owner@ornl.com"
        },
        assessmentContact: {
            contactName: "D.O. Energy",
            phoneNumber: 1234567890,
            email: "AMO_ToolHelpDesk@ee.doe.gov"
        },
        date: "Tue Dec 04 2018"
    },
    "commonRollupUnit": "MMBtu",
    "pumpsRollupUnit": "MWh",
    "fansRollupUnit": "MWh",
    "steamRollupUnit": "MMBtu",
    "wasteWaterRollupUnit": "MWh",
    "compressedAirRollupUnit": "MWh"
};




