import { MarkerType } from "@xyflow/react";
import { Diagram } from "../shared/models/diagram";
import { Settings } from "../shared/models/settings";



export const MockWaterdiagram: Diagram =
{
    "createdDate": new Date("2025-04-29T13:39:17.170Z"),
    "modifiedDate": new Date("2025-04-29T13:39:17.170Z"),
    "name": "Water Example Diagram",
    "appVersion": "1.5.12",
    "type": "Water",
    "directoryId": 2,
    "waterDiagram": {
        "isValid": true,
        "flowDiagramData": {
            "name": "Water Example Diagram",
            "nodes": [
                {
                    "id": "n_5dbkq13",
                    "type": "waterIntake",
                    "position": {
                        "x": -1345.3333333333335,
                        "y": 169.33333333333331
                    },
                    "className": "water-intake",
                    "data": {
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
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                    "style": {
                        "backgroundColor": "#75a1ff",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 221,
                        "height": 88
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_wu9uibb",
                    "type": "waterIntake",
                    "position": {
                        "x": -1334.5833333333333,
                        "y": 793.8333333333333
                    },
                    "className": "water-intake",
                    "data": {
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
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                    "style": {
                        "backgroundColor": "#75a1ff",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 221,
                        "height": 88
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_u3srsoc",
                    "type": "waterDischarge",
                    "position": {
                        "x": 1168.9301112912565,
                        "y": 320.56444084153844
                    },
                    "className": "water-discharge",
                    "data": {
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
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                    "style": {
                        "backgroundColor": "#7f7fff",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 221,
                        "height": 88
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_yhhvgv7",
                    "type": "waterDischarge",
                    "position": {
                        "x": 1194.1666666666667,
                        "y": 803.8333333333333
                    },
                    "className": "water-discharge",
                    "data": {
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
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                    "style": {
                        "backgroundColor": "#7f7fff",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 221,
                        "height": 88
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_2xhp9n6",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 30.87176321724914,
                        "y": -141.10515551327845
                    },
                    "className": "water-using-system",
                    "data": {
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
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                        "userDiagramFlowOverrides": {},
                        "processUse": {
                            "waterRequiredMetric": 0,
                            "waterConsumedMetric": 0,
                            "waterLossMetric": 0
                        },
                        "coolingTower": {},
                        "boilerWater": {},
                        "kitchenRestroom": {},
                        "landscaping": {},
                        "heatEnergy": {
                            "heatingFuelType": 0
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
                    "style": {
                        "backgroundColor": "#9e9e9e",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 221,
                        "height": 71
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_zs0izqw",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 49.6598123031942,
                        "y": 49.450907772904685
                    },
                    "className": "water-using-system",
                    "data": {
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
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                        "userDiagramFlowOverrides": {},
                        "processUse": {
                            "waterRequiredMetric": 0,
                            "waterConsumedMetric": 0,
                            "waterLossMetric": 0
                        },
                        "coolingTower": {},
                        "boilerWater": {},
                        "kitchenRestroom": {},
                        "landscaping": {},
                        "heatEnergy": {
                            "heatingFuelType": 0
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
                    "style": {
                        "backgroundColor": "#a6a6a6",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 221,
                        "height": 71
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_j3ewbod",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 81.56139445777296,
                        "y": 329.1190976314541
                    },
                    "className": "water-using-system",
                    "data": {
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
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                        "userDiagramFlowOverrides": {},
                        "processUse": {
                            "waterRequiredMetric": 0,
                            "waterConsumedMetric": 0,
                            "waterLossMetric": 0
                        },
                        "coolingTower": {},
                        "boilerWater": {},
                        "kitchenRestroom": {},
                        "landscaping": {},
                        "heatEnergy": {
                            "heatingFuelType": 0
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
                    "style": {
                        "backgroundColor": "#9e9e9e",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 221,
                        "height": 71
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_2sjnlil",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": -215.99923840405853,
                        "y": 574.7872874900037
                    },
                    "className": "water-using-system",
                    "data": {
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
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                        "userDiagramFlowOverrides": {},
                        "processUse": {
                            "waterRequiredMetric": 0,
                            "waterConsumedMetric": 0,
                            "waterLossMetric": 0
                        },
                        "coolingTower": {},
                        "boilerWater": {},
                        "kitchenRestroom": {},
                        "landscaping": {},
                        "heatEnergy": {
                            "heatingFuelType": 0
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
                    "style": {
                        "backgroundColor": "#949494",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 221,
                        "height": 71
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_d7xoxtb",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": -117.83333333333326,
                        "y": 803.8333333333333
                    },
                    "className": "water-using-system",
                    "data": {
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
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                        "userDiagramFlowOverrides": {},
                        "processUse": {
                            "waterRequiredMetric": 0,
                            "waterConsumedMetric": 0,
                            "waterLossMetric": 0
                        },
                        "coolingTower": {},
                        "boilerWater": {},
                        "kitchenRestroom": {},
                        "landscaping": {},
                        "heatEnergy": {
                            "heatingFuelType": 0
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
                    "style": {
                        "backgroundColor": "#b5b5b5",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 221,
                        "height": 71
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_hfbkilc",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": -101.83333333333326,
                        "y": 983.0833333333333
                    },
                    "className": "water-using-system",
                    "data": {
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
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                        "userDiagramFlowOverrides": {},
                        "processUse": {
                            "waterRequiredMetric": 0,
                            "waterConsumedMetric": 0,
                            "waterLossMetric": 0
                        },
                        "coolingTower": {},
                        "boilerWater": {},
                        "kitchenRestroom": {},
                        "landscaping": {},
                        "heatEnergy": {
                            "heatingFuelType": 0
                        },
                        "addedMotorEnergy": [],
                        "systemFlowTotals": {
                            "sourceWater": 2,
                            "recirculatedWater": 0,
                            "dischargeWater": 1.5,
                            "knownLosses": 0.5,
                            "waterInProduct": 0
                        }
                    },
                    "style": {
                        "backgroundColor": "#a3a3a3",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 221,
                        "height": 71
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_f17xaj2",
                    "type": "waterTreatment",
                    "position": {
                        "x": -314.6734576631968,
                        "y": -154.90648017187135
                    },
                    "className": "water-treatment",
                    "data": {
                        "processComponentType": "water-treatment",
                        "createdByAssessment": false,
                        "name": "Chemical Treatment 1",
                        "className": "water-treatment",
                        "systemType": 0,
                        "treatmentType": 0,
                        "cost": 1,
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": 3,
                            "totalSourceFlow": 3
                        },
                        "diagramNodeId": "n_f17xaj2",
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                    "style": {
                        "backgroundColor": "#009386",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 221,
                        "height": 98
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_6tg6mur",
                    "type": "waterTreatment",
                    "position": {
                        "x": -306.2422181831257,
                        "y": 36.201329698146424
                    },
                    "className": "water-treatment",
                    "data": {
                        "processComponentType": "water-treatment",
                        "createdByAssessment": false,
                        "name": "Chemical Treatment 2",
                        "className": "water-treatment",
                        "systemType": 0,
                        "treatmentType": 0,
                        "cost": 1,
                        "isValid": true,
                        "userEnteredData": {
                            "totalSourceFlow": 3,
                            "totalDischargeFlow": 3
                        },
                        "diagramNodeId": "n_6tg6mur",
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                    "style": {
                        "backgroundColor": "#009386",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 221,
                        "height": 98
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_l5at36g",
                    "type": "waterTreatment",
                    "position": {
                        "x": -640.895258753419,
                        "y": 49.36697245177194
                    },
                    "className": "water-treatment",
                    "data": {
                        "processComponentType": "water-treatment",
                        "createdByAssessment": false,
                        "name": "RO",
                        "className": "water-treatment",
                        "systemType": 0,
                        "treatmentType": 0,
                        "cost": 1,
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": 3,
                            "totalSourceFlow": 3
                        },
                        "diagramNodeId": "n_l5at36g",
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                    "style": {
                        "backgroundColor": "#009386",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 221,
                        "height": 71
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_tgz44ln",
                    "type": "waterTreatment",
                    "position": {
                        "x": -387.5775958508251,
                        "y": 326.80257890802795
                    },
                    "className": "water-treatment",
                    "data": {
                        "processComponentType": "water-treatment",
                        "createdByAssessment": false,
                        "name": "Chlorine",
                        "className": "water-treatment",
                        "systemType": 0,
                        "treatmentType": 0,
                        "cost": 1,
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": 16,
                            "totalSourceFlow": 16
                        },
                        "diagramNodeId": "n_tgz44ln",
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                    "style": {
                        "backgroundColor": "#009386",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 221,
                        "height": 71
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_eg0ir4y",
                    "type": "wasteWaterTreatment",
                    "position": {
                        "x": 202.16666666666674,
                        "y": 575.8333333333333
                    },
                    "className": "waste-water-treatment",
                    "data": {
                        "processComponentType": "waste-water-treatment",
                        "createdByAssessment": true,
                        "name": "Sand Filtration",
                        "className": "waste-water-treatment",
                        "systemType": 0,
                        "treatmentType": 0,
                        "cost": 1,
                        "isValid": true,
                        "userEnteredData": {
                            "totalSourceFlow": 12,
                            "totalDischargeFlow": 12
                        },
                        "diagramNodeId": "n_eg0ir4y",
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                    "style": {
                        "backgroundColor": "#93e200",
                        "color": "#000"
                    },
                    "measured": {
                        "width": 221,
                        "height": 71
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_w73lf6y",
                    "type": "wasteWaterTreatment",
                    "position": {
                        "x": 642.7642062205312,
                        "y": 573.9915057490293
                    },
                    "className": "waste-water-treatment",
                    "data": {
                        "processComponentType": "waste-water-treatment",
                        "createdByAssessment": true,
                        "name": "PH Control",
                        "className": "waste-water-treatment",
                        "systemType": 0,
                        "treatmentType": 0,
                        "cost": 1,
                        "isValid": true,
                        "userEnteredData": {
                            "totalSourceFlow": 12,
                            "totalDischargeFlow": 12
                        },
                        "diagramNodeId": "n_w73lf6y",
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                    "style": {
                        "backgroundColor": "#93e200",
                        "color": "#000"
                    },
                    "measured": {
                        "width": 221,
                        "height": 71
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_dy755kl",
                    "type": "wasteWaterTreatment",
                    "position": {
                        "x": 519.8348565252162,
                        "y": 328.4892209612051
                    },
                    "className": "waste-water-treatment",
                    "data": {
                        "processComponentType": "waste-water-treatment",
                        "createdByAssessment": true,
                        "name": "Filtration",
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
                        "modifiedDate": "2025-05-20T17:36:59.391Z",
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
                    "style": {
                        "backgroundColor": "#93e200",
                        "color": "#000"
                    },
                    "measured": {
                        "width": 221,
                        "height": 71
                    },
                    "selected": false,
                    "dragging": false
                }
            ],
            "nodeErrors": {},
            "edges": [
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_5dbkq13",
                    "sourceHandle": "e",
                    "target": "n_f17xaj2",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 3
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_5dbkq13e-n_f17xaj2a"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_5dbkq13",
                    "sourceHandle": "e",
                    "target": "n_l5at36g",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 3
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_5dbkq13e-n_l5at36ga"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_l5at36g",
                    "sourceHandle": "e",
                    "target": "n_6tg6mur",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 3
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_l5at36ge-n_6tg6mura"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_5dbkq13",
                    "sourceHandle": "f",
                    "target": "n_tgz44ln",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 8
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_5dbkq13f-n_tgz44lna"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_f17xaj2",
                    "sourceHandle": "e",
                    "target": "n_2xhp9n6",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 3
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_f17xaj2e-n_2xhp9n6a"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_6tg6mur",
                    "sourceHandle": "e",
                    "target": "n_zs0izqw",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 3
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_6tg6mure-n_zs0izqwa"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_tgz44ln",
                    "sourceHandle": "e",
                    "target": "n_j3ewbod",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 16
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_tgz44lne-n_j3ewboda"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_5dbkq13",
                    "sourceHandle": "f",
                    "target": "n_2sjnlil",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 16
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_5dbkq13f-n_2sjnlila"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_2sjnlil",
                    "sourceHandle": "e",
                    "target": "n_eg0ir4y",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 12
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_2sjnlile-n_eg0ir4ya"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_j3ewbod",
                    "sourceHandle": "e",
                    "target": "n_dy755kl",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 12
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_j3ewbode-n_dy755kla"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_dy755kl",
                    "sourceHandle": "e",
                    "target": "n_u3srsoc",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 12
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_dy755kle-n_u3srsoca"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_2xhp9n6",
                    "sourceHandle": "e",
                    "target": "n_u3srsoc",
                    "targetHandle": "b",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 1
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_2xhp9n6e-n_u3srsocb"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_w73lf6y",
                    "sourceHandle": "f",
                    "target": "n_j3ewbod",
                    "targetHandle": "b",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 6
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_w73lf6yf-n_j3ewbodb"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_eg0ir4y",
                    "sourceHandle": "e",
                    "target": "n_w73lf6y",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 12
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_eg0ir4ye-n_w73lf6ya"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_w73lf6y",
                    "sourceHandle": "e",
                    "target": "n_u3srsoc",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 3
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_w73lf6ye-n_u3srsoca"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_wu9uibb",
                    "sourceHandle": "e",
                    "target": "n_d7xoxtb",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 10
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_wu9uibbe-n_d7xoxtba"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_wu9uibb",
                    "sourceHandle": "f",
                    "target": "n_hfbkilc",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 2
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_wu9uibbf-n_hfbkilca"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_w73lf6y",
                    "sourceHandle": "e",
                    "target": "n_yhhvgv7",
                    "targetHandle": "b",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 3
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_w73lf6ye-n_yhhvgv7b"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_d7xoxtb",
                    "sourceHandle": "e",
                    "target": "n_yhhvgv7",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 8
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_d7xoxtbe-n_yhhvgv7a"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_hfbkilc",
                    "sourceHandle": "e",
                    "target": "n_yhhvgv7",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 1.5
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_hfbkilce-n_yhhvgv7a"
                },
                {
                    "animated": true,
                    "type": "smoothstep",
                    "source": "n_wu9uibb",
                    "sourceHandle": "e",
                    "target": "n_tgz44ln",
                    "targetHandle": "b",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowValue": 8
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 2
                    },
                    "id": "xy-edge__n_wu9uibbe-n_tgz44lnb"
                }
            ],
            "settings": {
                "electricityCost": 1,
                "flowDecimalPrecision": 2,
                "unitsOfMeasure": "Imperial",
                "conductivityUnit": "mmho"
            },
            "userDiagramOptions": {
                "strokeWidth": 2,
                "edgeType": "smoothstep",
                "minimapVisible": false,
                "controlsVisible": true,
                "directionalArrowsVisible": true,
                "showFlowLabels": true,
                "flowLabelSize": 1,
                "animated": true
            },
            "calculatedData": {
                "nodes": {
                    "n_5dbkq13": {
                        "totalDischargeFlow": 30
                    },
                    "n_f17xaj2": {
                        "totalSourceFlow": 3
                    },
                    "n_l5at36g": {
                        "totalSourceFlow": 3
                    },
                    "n_tgz44ln": {
                        "totalSourceFlow": 16
                    },
                    "n_2sjnlil": {
                        "totalSourceFlow": 16,
                        "totalDischargeFlow": 12
                    },
                    "n_wu9uibb": {
                        "totalDischargeFlow": 20
                    },
                    "n_d7xoxtb": {
                        "totalSourceFlow": 10,
                        "totalDischargeFlow": 8
                    },
                    "n_hfbkilc": {
                        "totalSourceFlow": 2,
                        "totalDischargeFlow": 1.5
                    },
                    "n_w73lf6y": {
                        "totalDischargeFlow": 12,
                        "totalSourceFlow": 12
                    },
                    "n_j3ewbod": {
                        "totalSourceFlow": 22,
                        "totalDischargeFlow": 12
                    },
                    "n_u3srsoc": {
                        "totalSourceFlow": 4
                    },
                    "n_yhhvgv7": {
                        "totalSourceFlow": 12.5
                    },
                    "n_eg0ir4y": {
                        "totalSourceFlow": 12,
                        "totalDischargeFlow": 12
                    },
                    "n_dy755kl": {
                        "totalSourceFlow": 12
                    }
                }
            },
            "recentNodeColors": [
                "#75a1ff",
                "#7f7fff",
                "#00bbff",
                "#009386",
                "#93e200"
            ],
            "recentEdgeColors": [
                "#75a1ff",
                "#7f7fff",
                "#00bbff",
                "#009386",
                "#93e200"
            ]
        },
        "assessmentId": 75
    },
}

export const MockWaterDiagramSettings: Settings = {
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


