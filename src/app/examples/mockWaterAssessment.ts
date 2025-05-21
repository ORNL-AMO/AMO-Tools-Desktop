import { Assessment } from "../shared/models/assessment";
import { Settings } from "../shared/models/settings";



export const MockWaterAssessment: Assessment = {
    "name": "Water Example",
    "createdDate": new Date("2025-04-29T13:39:17.170Z"),
    "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
    "type": "Water",
    "isExample": true,
    "appVersion": "1.5.12",
    "directoryId": 2,
    "water": {
        "name": "Baseline",
        "modifications": [],
        "setupDone": false,
        "systemBasics": {
            "notes": null,
            "electricityCost": .66,
            "utilityType": "Electricity",
            "conductivityUnit": "mmho",
            "productionUnit": "lb",
            "fuelCost": 3.99,
            "annualProduction": 200
        },
        "diagramWaterSystemFlows": [
            {
                "id": "n_2xhp9n6",
                "componentName": "Cooling Tower",
                "sourceWater": {
                    "total": 3,
                    "flows": [
                        {
                            "source": "n_f17xaj2",
                            "target": "n_2xhp9n6",
                            "flowValue": 3,
                            "diagramEdgeId": "xy-edge__n_f17xaj2e-n_2xhp9n6a"
                        }
                    ]
                },
                "recirculatedWater": {
                    "total": 0,
                    "flows": []
                },
                "dischargeWater": {
                    "total": 1,
                    "flows": [
                        {
                            "source": "n_2xhp9n6",
                            "target": "n_u3srsoc",
                            "flowValue": 1,
                            "diagramEdgeId": "xy-edge__n_2xhp9n6e-n_u3srsocb"
                        }
                    ]
                },
                "knownLosses": {
                    "total": 2,
                    "flows": []
                },
                "waterInProduct": {
                    "total": 0,
                    "flows": []
                }
            },
            {
                "id": "n_zs0izqw",
                "componentName": "Process Loop",
                "sourceWater": {
                    "total": 3,
                    "flows": [
                        {
                            "source": "n_6tg6mur",
                            "target": "n_zs0izqw",
                            "flowValue": 3,
                            "diagramEdgeId": "xy-edge__n_6tg6mure-n_zs0izqwa"
                        }
                    ]
                },
                "recirculatedWater": {
                    "total": 0,
                    "flows": []
                },
                "dischargeWater": {
                    "total": 0,
                    "flows": []
                },
                "knownLosses": {
                    "total": 3,
                    "flows": []
                },
                "waterInProduct": {
                    "total": 0,
                    "flows": []
                }
            },
            {
                "id": "n_j3ewbod",
                "componentName": "Quench Tank",
                "sourceWater": {
                    "total": 22,
                    "flows": [
                        {
                            "source": "n_tgz44ln",
                            "target": "n_j3ewbod",
                            "flowValue": 16,
                            "diagramEdgeId": "xy-edge__n_tgz44lne-n_j3ewboda"
                        },
                        {
                            "source": "n_w73lf6y",
                            "target": "n_j3ewbod",
                            "flowValue": 6,
                            "diagramEdgeId": "xy-edge__n_w73lf6yf-n_j3ewbodb"
                        }
                    ]
                },
                "recirculatedWater": {
                    "total": 0,
                    "flows": []
                },
                "dischargeWater": {
                    "total": 12,
                    "flows": [
                        {
                            "source": "n_j3ewbod",
                            "target": "n_dy755kl",
                            "flowValue": 12,
                            "diagramEdgeId": "xy-edge__n_j3ewbode-n_dy755kla"
                        }
                    ]
                },
                "knownLosses": {
                    "total": 10,
                    "flows": []
                },
                "waterInProduct": {
                    "total": 0,
                    "flows": []
                }
            },
            {
                "id": "n_2sjnlil",
                "componentName": "Vacuum Pumps",
                "sourceWater": {
                    "total": 16,
                    "flows": [
                        {
                            "source": "n_5dbkq13",
                            "target": "n_2sjnlil",
                            "flowValue": 16,
                            "diagramEdgeId": "xy-edge__n_5dbkq13f-n_2sjnlila"
                        }
                    ]
                },
                "recirculatedWater": {
                    "total": 0,
                    "flows": []
                },
                "dischargeWater": {
                    "total": 12,
                    "flows": [
                        {
                            "source": "n_2sjnlil",
                            "target": "n_eg0ir4y",
                            "flowValue": 12,
                            "diagramEdgeId": "xy-edge__n_2sjnlile-n_eg0ir4ya"
                        }
                    ]
                },
                "knownLosses": {
                    "total": 4,
                    "flows": []
                },
                "waterInProduct": {
                    "total": 0,
                    "flows": []
                }
            },
            {
                "id": "n_d7xoxtb",
                "componentName": "Wash Bay",
                "sourceWater": {
                    "total": 10,
                    "flows": [
                        {
                            "source": "n_wu9uibb",
                            "target": "n_d7xoxtb",
                            "flowValue": 10,
                            "diagramEdgeId": "xy-edge__n_wu9uibbe-n_d7xoxtba"
                        }
                    ]
                },
                "recirculatedWater": {
                    "total": 0,
                    "flows": []
                },
                "dischargeWater": {
                    "total": 8,
                    "flows": [
                        {
                            "source": "n_d7xoxtb",
                            "target": "n_yhhvgv7",
                            "flowValue": 8,
                            "diagramEdgeId": "xy-edge__n_d7xoxtbe-n_yhhvgv7a"
                        }
                    ]
                },
                "knownLosses": {
                    "total": 2,
                    "flows": []
                },
                "waterInProduct": {
                    "total": 0,
                    "flows": []
                }
            },
            {
                "id": "n_hfbkilc",
                "componentName": "Sanitary",
                "sourceWater": {
                    "total": 2,
                    "flows": [
                        {
                            "source": "n_wu9uibb",
                            "target": "n_hfbkilc",
                            "flowValue": 2,
                            "diagramEdgeId": "xy-edge__n_wu9uibbf-n_hfbkilca"
                        }
                    ]
                },
                "recirculatedWater": {
                    "total": 0,
                    "flows": []
                },
                "dischargeWater": {
                    "total": 1.5,
                    "flows": [
                        {
                            "source": "n_hfbkilc",
                            "target": "n_yhhvgv7",
                            "flowValue": 1.5,
                            "diagramEdgeId": "xy-edge__n_hfbkilce-n_yhhvgv7a"
                        }
                    ]
                },
                "knownLosses": {
                    "total": 0.5,
                    "flows": []
                },
                "waterInProduct": {
                    "total": 0,
                    "flows": []
                }
            }
        ],
        "intakeSources": [
            {
                "processComponentType": "water-intake",
                "createdByAssessment": true,
                "name": "Well Water",
                "className": "water-intake",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 1,
                "isValid": true,
                "disableInflowConnections": true,
                "userEnteredData": {
                    "totalDischargeFlow": 30
                },
                "diagramNodeId": "n_5dbkq13",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
                "handles": {
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
            },
            {
                "processComponentType": "water-intake",
                "createdByAssessment": true,
                "name": "City Water",
                "className": "water-intake",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 1,
                "isValid": true,
                "disableInflowConnections": true,
                "userEnteredData": {
                    "totalDischargeFlow": 20
                },
                "diagramNodeId": "n_wu9uibb",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
                "handles": {
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
                "className": "water-discharge",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 1,
                "isValid": true,
                "disableOutflowConnections": true,
                "userEnteredData": {
                    "totalSourceFlow": 16
                },
                "diagramNodeId": "n_u3srsoc",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": true,
                        "c": false,
                        "d": false
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
                "className": "water-discharge",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 1,
                "isValid": true,
                "disableOutflowConnections": true,
                "userEnteredData": {
                    "totalSourceFlow": 12.5
                },
                "diagramNodeId": "n_yhhvgv7",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
                "handles": {
                    "inflowHandles": {
                        "a": true,
                        "b": true,
                        "c": false,
                        "d": false
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
                "systemType": 0,
                "treatmentType": 0,
                "cost": 0,
                "isValid": true,
                "userEnteredData": {
                    "totalSourceFlow": 3,
                    "totalDischargeFlow": 1,
                    "totalKnownLosses": 2
                },
                "diagramNodeId": "n_2xhp9n6",
                "modifiedDate": new Date("2025-05-20T17:36:59.391Z"),
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
                "inSystemTreatment": [],
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
                    "sourceWater": 3,
                    "recirculatedWater": 0,
                    "dischargeWater": 1,
                    "knownLosses": 2,
                    "waterInProduct": 0
                }
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Process Loop",
                "className": "water-using-system",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 0,
                "isValid": true,
                "userEnteredData": {
                    "totalKnownLosses": 3,
                    "totalSourceFlow": 3
                },
                "diagramNodeId": "n_zs0izqw",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
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
                "inSystemTreatment": [],
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
                    "sourceWater": 3,
                    "recirculatedWater": 0,
                    "dischargeWater": 0,
                    "knownLosses": 3,
                    "waterInProduct": 0
                }
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Quench Tank",
                "className": "water-using-system",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 0,
                "isValid": true,
                "userEnteredData": {
                    "totalKnownLosses": 10,
                    "totalSourceFlow": 22,
                    "totalDischargeFlow": 12
                },
                "diagramNodeId": "n_j3ewbod",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
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
                "inSystemTreatment": [],
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
                    "sourceWater": 22,
                    "recirculatedWater": 0,
                    "dischargeWater": 12,
                    "knownLosses": 10,
                    "waterInProduct": 0
                }
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Vacuum Pumps",
                "className": "water-using-system",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 0,
                "isValid": true,
                "userEnteredData": {
                    "totalKnownLosses": 4,
                    "totalSourceFlow": 16,
                    "totalDischargeFlow": 12
                },
                "diagramNodeId": "n_2sjnlil",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
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
                "inSystemTreatment": [],
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
                    "sourceWater": 16,
                    "recirculatedWater": 0,
                    "dischargeWater": 12,
                    "knownLosses": 4,
                    "waterInProduct": 0
                }
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Wash Bay",
                "className": "water-using-system",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 0,
                "isValid": true,
                "userEnteredData": {
                    "totalKnownLosses": 2,
                    "totalSourceFlow": 10,
                    "totalDischargeFlow": 8
                },
                "diagramNodeId": "n_d7xoxtb",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
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
                "inSystemTreatment": [],
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
                    "sourceWater": 10,
                    "recirculatedWater": 0,
                    "dischargeWater": 8,
                    "knownLosses": 2,
                    "waterInProduct": 0
                }
            },
            {
                "processComponentType": "water-using-system",
                "createdByAssessment": true,
                "name": "Sanitary",
                "className": "water-using-system",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 0,
                "isValid": true,
                "userEnteredData": {
                    "totalKnownLosses": 0.5,
                    "totalDischargeFlow": 1.5,
                    "totalSourceFlow": 2
                },
                "diagramNodeId": "n_hfbkilc",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
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
                "inSystemTreatment": [],
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
                    "sourceWater": 2,
                    "recirculatedWater": 0,
                    "dischargeWater": 1.5,
                    "knownLosses": 0.5,
                    "waterInProduct": 0
                }
            }
        ],
        "waterTreatments": [
            {
                "processComponentType": "water-treatment",
                "createdByAssessment": false,
                "name": "Chemical Treatment 1",
                "className": "water-treatment",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 1,
                "customTreatmentType": undefined,
                "flowValue": undefined,
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": 3,
                    "totalSourceFlow": 3
                },
                "diagramNodeId": "n_f17xaj2",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
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
                }
            },
            {
                "processComponentType": "water-treatment",
                "createdByAssessment": false,
                "name": "Chemical Treatment 2",
                "className": "water-treatment",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 1,
                "customTreatmentType": undefined,
                "flowValue": undefined,
                "isValid": true,
                "userEnteredData": {
                    "totalSourceFlow": 3,
                    "totalDischargeFlow": 3
                },
                "diagramNodeId": "n_6tg6mur",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
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
                }
            },
            {
                "processComponentType": "water-treatment",
                "createdByAssessment": false,
                "name": "RO",
                "className": "water-treatment",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 1,
                "customTreatmentType": undefined,
                "flowValue": undefined,
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": 3,
                    "totalSourceFlow": 3
                },
                "diagramNodeId": "n_l5at36g",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
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
                }
            },
            {
                "processComponentType": "water-treatment",
                "createdByAssessment": false,
                "name": "Chlorine",
                "className": "water-treatment",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 1,
                "customTreatmentType": undefined,
                "flowValue": undefined,
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": 16,
                    "totalSourceFlow": 16
                },
                "diagramNodeId": "n_tgz44ln",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
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
                }
            }
        ],
        "wasteWaterTreatments": [
            {
                "processComponentType": "waste-water-treatment",
                "createdByAssessment": true,
                "name": "Sand Filtration",
                "className": "waste-water-treatment",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 1,
                "customTreatmentType": undefined,
                "flowValue": undefined,
                "isValid": true,
                "userEnteredData": {
                    "totalSourceFlow": 12,
                    "totalDischargeFlow": 12
                },
                "diagramNodeId": "n_eg0ir4y",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
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
                }
            },
            {
                "processComponentType": "waste-water-treatment",
                "createdByAssessment": true,
                "name": "PH Control",
                "className": "waste-water-treatment",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 1,
                "customTreatmentType": undefined,
                "flowValue": undefined,
                "isValid": true,
                "userEnteredData": {
                    "totalSourceFlow": 12,
                    "totalDischargeFlow": 12
                },
                "diagramNodeId": "n_w73lf6y",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
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
                }
            },
            {
                "processComponentType": "waste-water-treatment",
                "createdByAssessment": true,
                "name": "Filtration",
                "customTreatmentType": undefined,
                "flowValue": undefined,
                "className": "waste-water-treatment",
                "systemType": 0,
                "treatmentType": 0,
                "cost": 1,
                "isValid": true,
                "userEnteredData": {
                    "totalDischargeFlow": 12,
                    "totalSourceFlow": 12
                },
                "diagramNodeId": "n_dy755kl",
                "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
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
                }
            }
        ],
        "knownLosses": []
    },
    "diagramId": 1,
    "selected": false,
}


export const MockWaterAssessmentSettings: Settings = {
    "language": "English",
    "currency": "$",
    "unitsOfMeasure": "Imperial",
    "distanceMeasurement": "ft",
    "flowMeasurement": "gpm",
    "powerMeasurement": "hp",
    "pressureMeasurement": "psi",
    "currentMeasurement": null,
    "viscosityMeasurement": null,
    "voltageMeasurement": null,
    "energySourceType": "Fuel",
    "customFurnaceName": null,
    "temperatureMeasurement": "F",
    "steamTemperatureMeasurement": "F",
    "steamPressureMeasurement": "psig",
    "steamSpecificEnthalpyMeasurement": "btuLb",
    "steamSpecificEntropyMeasurement": "btulbF",
    "steamSpecificVolumeMeasurement": "ft3lb",
    "steamMassFlowMeasurement": "klb",
    "fuelCost": 3.99,
    "steamCost": 4.69,
    "electricityCost": 0.066,
    "compressedAirCost": 0.022,
    "defaultPanelTab": "results",
    "phastRollupFuelUnit": "MMBtu",
    "phastRollupElectricityUnit": "kWh",
    "phastRollupSteamUnit": "MMBtu",
    "energyResultUnit": "MMBtu",
    "phastRollupUnit": "MMBtu",
    "co2SavingsEnergyType": "electricity",
    "co2SavingsEnergySource": "Natural Gas",
    "co2SavingsFuelType": "Natural Gas",
    "totalEmissionOutputRate": 401.07,
    "emissionsUnit": "Metric",
    "totalFuelEmissionOutputRate": 0,
    "totalNaturalGasEmissionOutputRate": 53.06,
    "totalCoalEmissionOutputRate": 0,
    "totalOtherEmissionOutputRate": 0,
    "coalFuelType": "Mixed - Industrial Sector",
    "eafOtherFuelSource": "None",
    "otherFuelType": "",
    "electricityUse": 0,
    "eGridRegion": "",
    "eGridSubregion": "U.S. Average",
    "totalEmissionOutput": 0,
    "userEnteredBaselineEmissions": false,
    "userEnteredModificationEmissions": false,
    "zipcode": "00000",
    "commonRollupUnit": "MMBtu",
    "pumpsRollupUnit": "MWh",
    "fansRollupUnit": "MWh",
    "steamRollupUnit": "MMBtu",
    "wasteWaterRollupUnit": "MWh",
    "compressedAirRollupUnit": "MWh",
    "flowDecimalPrecision": 2,
    "steamPowerMeasurement": "kW",
    "steamEnergyMeasurement": "MMBtu",
    "steamVolumeMeasurement": "gal",
    "densityMeasurement": "lbscf",
    "fanFlowRate": "ft3/min",
    "fanPressureMeasurement": "inH2o",
    "fanBarometricPressure": "inHg",
    "fanSpecificHeatGas": "btulbF",
    "fanTemperatureMeasurement": "F",
    "fanPowerMeasurement": "hp",
    "disableTutorial": true,
    "disableDashboardTutorial": true,
    "disablePsatTutorial": true,
    "disableFansTutorial": true,
    "disablePhastTutorial": true,
    "disableWasteWaterTutorial": true,
    "disableSteamTutorial": true,
    "disableMotorInventoryTutorial": true,
    "disableTreasureHuntTutorial": true,
    "disableDataExplorerTutorial": true,
    "disableCompressedAirTutorial": true,
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
};




