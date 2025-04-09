import { Assessment } from "../shared/models/assessment";
import { Settings } from "../shared/models/settings";



export const MockWaterAssessment: Assessment = {
    "name": "Water Example",
    "createdDate": new Date("2024-10-31T18:32:13.111Z"),
    "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
    "type": "Water",
    "appVersion": "1.5.3",
    "directoryId": 2,
    "water": {
        "name": "Baseline",
        "modifications": [],
        "setupDone": false,
        "systemBasics": {
            "utilityType": "Electricity",
            "electricityCost": 0.066,
            "conductivityUnit": "mmho",
            "notes": ""
        },
        "intakeSources": [
            {
                "processComponentType": "water-intake",
                "createdByAssessment": true,
                "name": "Municipal Water A",
                "className": "water-intake",
                "isValid": true,
                "disableInflowConnections": true,
                "diagramNodeId": "n_sikn350",
                "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
                "handles": {
                    "outflowHandles": {
                        "e": true,
                        "f": false,
                        "g": true,
                        "h": true
                    }
                },
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
                "disableInflowConnections": true,
                "diagramNodeId": "n_fo68a9w",
                "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": true,
                        "c": false,
                        "d": false
                    },
                    "outflowHandles": {
                        "e": true,
                        "f": true,
                        "g": false,
                        "h": false
                    }
                },
                "sourceType": 0,
                "annualUse": 0,
                "addedMotorEnergy": []
            }
        ],
        "dischargeOutlets": [
            {
                "processComponentType": "water-discharge",
                "createdByAssessment": true,
                "name": "Municipal Sewer 1",
                "cost": 0,
                "className": "water-discharge",
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": undefined ,
                    "totalSourceFlow": undefined 
                  },
                "disableOutflowConnections": true,
                "diagramNodeId": "n_i8u4vhf",
                "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": true,
                        "c": false,
                        "d": false
                    },
                    "outflowHandles": {
                        "e": true,
                        "f": true,
                        "g": false,
                        "h": false
                    }
                },
                "outletType": 0,
                "annualUse": 0,
                "addedMotorEnergy": []
            },
            {
                "processComponentType": "water-discharge",
                "createdByAssessment": true,
                "name": "Municipal Sewer 2",
                "cost": 0,
                "className": "water-discharge",
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": undefined ,
                    "totalSourceFlow": undefined 
                  },
                "disableOutflowConnections": true,
                "diagramNodeId": "n_s0riw08",
                "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": true,
                        "c": false,
                        "d": false
                    },
                    "outflowHandles": {
                        "e": true,
                        "f": true,
                        "g": false,
                        "h": false
                    }
                },
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
                "cost": 0,
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": undefined ,
                    "totalSourceFlow": undefined 
                  },
                "diagramNodeId": "n_jpmgb59",
                "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": true,
                        "c": false,
                        "d": false
                    },
                    "outflowHandles": {
                        "e": true,
                        "f": true,
                        "g": false,
                        "h": false
                    }
                },
                "systemType": 0,
                "hoursPerYear": 8760,
                "userDiagramFlowOverrides": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                }, 
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
                "addedMotorEnergy": [],
                "systemFlowTotals": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                }, 
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Process Loop",
                "cost": 0,
                "className": "water-using-system",
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": undefined ,
                    "totalSourceFlow": undefined 
                  },
                "diagramNodeId": "n_bap4mdz",
                "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": true,
                        "c": false,
                        "d": false
                    },
                    "outflowHandles": {
                        "e": true,
                        "f": false,
                        "g": false,
                        "h": false
                    }
                },
                "systemType": 0,
                "hoursPerYear": 8760,
                "userDiagramFlowOverrides": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                }, 
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
                "addedMotorEnergy": [],
                "systemFlowTotals": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                },
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Quench Tank",
                "cost": 0,
                "className": "water-using-system",
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": undefined ,
                    "totalSourceFlow": undefined 
                  },
                "diagramNodeId": "n_q8z56fu",
                "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": false,
                        "c": false,
                        "d": false
                    },
                    "outflowHandles": {
                        "e": true,
                        "f": false,
                        "g": false,
                        "h": false
                    }
                },
                "systemType": 0,
                "hoursPerYear": 8760,
                "userDiagramFlowOverrides": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                }, 
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
                "addedMotorEnergy": [],
                "systemFlowTotals": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                },
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Vacuum Pump",
                "className": "water-using-system",
                "cost": 0,
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": undefined ,
                    "totalSourceFlow": undefined 
                  },
                "diagramNodeId": "n_7uv5ufq",
                "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": false,
                        "c": false,
                        "d": false
                    },
                    "outflowHandles": {
                        "e": true,
                        "f": false,
                        "g": false,
                        "h": false
                    }
                },
                "systemType": 0,
                "hoursPerYear": 8760,
                "userDiagramFlowOverrides": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                }, 
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
                "addedMotorEnergy": [],
                "systemFlowTotals": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                },
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Chillers",
                "className": "water-using-system",
                "cost": 0,
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": undefined ,
                    "totalSourceFlow": undefined 
                  },
                "diagramNodeId": "n_oy8l0zr",
                "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": true,
                        "c": false,
                        "d": false
                    },
                    "outflowHandles": {
                        "e": true,
                        "f": true,
                        "g": true,
                        "h": false
                    }
                },
                "systemType": 0,
                "hoursPerYear": 8760,
                "userDiagramFlowOverrides": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                }, 
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
                "addedMotorEnergy": [],
                "systemFlowTotals": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                },
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Blending",
                "className": "water-using-system",
                "cost": 0,
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": undefined ,
                    "totalSourceFlow": undefined 
                  },
                "diagramNodeId": "n_z5ch3bo",
                "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": false,
                        "c": false,
                        "d": false
                    },
                    "outflowHandles": {
                        "e": true,
                        "f": false,
                        "g": false,
                        "h": false
                    }
                },
                "systemType": 0,
                "hoursPerYear": 8760,
                "userDiagramFlowOverrides": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                }, 
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
                "addedMotorEnergy": [],
                "systemFlowTotals": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                },
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Wash Bay",
                "cost": 0,
                "className": "water-using-system",
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": undefined ,
                    "totalSourceFlow": undefined 
                  },
                "diagramNodeId": "n_ytvqdez",
                "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": false,
                        "c": false,
                        "d": false
                    },
                    "outflowHandles": {
                        "e": true,
                        "f": false,
                        "g": false,
                        "h": false
                    }
                },
                "systemType": 0,
                "hoursPerYear": 8760,
                "userDiagramFlowOverrides": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                }, 
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
                "addedMotorEnergy": [],
                "systemFlowTotals": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                },
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Sanitary",
                "cost": 0,
                "className": "water-using-system",
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": undefined ,
                    "totalSourceFlow": undefined 
                  },
                "diagramNodeId": "n_zxuieyv",
                "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": false,
                        "c": false,
                        "d": false
                    },
                    "outflowHandles": {
                        "e": true,
                        "f": false,
                        "g": false,
                        "h": false
                    }
                },
                "systemType": 0,
                "hoursPerYear": 8760,
                "userDiagramFlowOverrides": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                }, 
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
                "addedMotorEnergy": [],
                "systemFlowTotals": {
                    "sourceWater": undefined,
                    "recirculatedWater": undefined,
                    "dischargeWater": undefined,
                    "knownLosses": undefined,
                    "waterInProduct": undefined,
                },
            }
        ],
        "waterTreatments": [
            {
                "processComponentType": "water-treatment",
                "createdByAssessment": false,
                "name": "Chemical Treatment 1",
                "cost": 0,
                "customTreatmentType": undefined,
                "flowValue": undefined,
                "className": "water-treatment",
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": undefined ,
                    "totalSourceFlow": undefined 
                  },
                "diagramNodeId": "n_8isow7x",
                "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": true,
                        "c": false,
                        "d": false
                    },
                    "outflowHandles": {
                        "e": true,
                        "f": false,
                        "g": false,
                        "h": false
                    }
                },
                "treatmentType": 3,
            },
            {
                "processComponentType": "water-treatment",
                "cost": 0,
                "createdByAssessment": false,
                "name": "Chemical Treatment 2",
                "customTreatmentType": undefined,
                "flowValue": undefined,
                "className": "water-treatment",
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": undefined ,
                    "totalSourceFlow": undefined 
                  },
                "diagramNodeId": "n_id24c8f",
                "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": true,
                        "c": false,
                        "d": false
                    },
                    "outflowHandles": {
                        "e": true,
                        "f": false,
                        "g": false,
                        "h": false
                    }
                },
                "treatmentType": 3,
            },
            {
                "processComponentType": "water-treatment",
                "createdByAssessment": false,
                "name": "Chlorine",
                "customTreatmentType": undefined,
                "flowValue": undefined,
                "className": "water-treatment",
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": undefined ,
                    "totalSourceFlow": undefined 
                  },
                "diagramNodeId": "n_1zvy0mn",
                "modifiedDate": new Date("2024-10-31T18:32:13.111Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": true,
                        "c": false,
                        "d": false
                    },
                    "outflowHandles": {
                        "e": true,
                        "f": false,
                        "g": false,
                        "h": false
                    }
                },
                "treatmentType": 5,
                "cost": 0
            }
        ],
        "wasteWaterTreatments": []
    },
    "diagramId": 1,
    "selected": false,
    "id": 75
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




