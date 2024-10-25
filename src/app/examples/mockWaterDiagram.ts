import { MarkerType } from "@xyflow/react";
import { Diagram } from "../shared/models/diagram";
import { Settings } from "../shared/models/settings";



export const MockWaterdiagram: Diagram = 
{
    "createdDate": new Date("2024-09-09T19:38:17.215Z"),
    "modifiedDate": new Date("2024-09-09T20:02:00.943Z"),
    "name": "Water Example Diagram",
    "appVersion": "1.5.3",
    "type": "Water",
    "directoryId": 2,
    "waterDiagram": {
        "isValid": true,
        "flowDiagramData": {
            "nodes": [
                {
                    "id": "n_8v95pqn",
                    "type": "waterIntake",
                    "position": {
                        "x": -367,
                        "y": 214
                    },
                    "className": "water-intake",
                    "data": {
                        "processComponentType": "water-intake",
                        "createdByAssessment": true,
                        "name": "Municipal Water A",
                        "className": "water-intake",
                        "isValid": true,
                        "diagramNodeId": "n_8v95pqn",
                        "modifiedDate": "2024-10-16T16:37:36.336Z",
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
                    "style": {
                        "backgroundColor": "#75a1ff",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 219,
                        "height": 69
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_k8i3z5t",
                    "type": "waterIntake",
                    "position": {
                        "x": -329.2528762805359,
                        "y": 470.8313632781718
                    },
                    "className": "water-intake",
                    "data": {
                        "processComponentType": "water-intake",
                        "createdByAssessment": true,
                        "name": "Municipal Water B",
                        "className": "water-intake",
                        "isValid": true,
                        "diagramNodeId": "n_k8i3z5t",
                        "modifiedDate": "2024-10-16T16:37:36.336Z",
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
                    },
                    "style": {
                        "backgroundColor": "#75a1ff",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 219,
                        "height": 69
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_40pl8g8",
                    "type": "waterDischarge",
                    "position": {
                        "x": 1172.8072498029944,
                        "y": 76.39763593380613
                    },
                    "className": "water-discharge",
                    "data": {
                        "processComponentType": "water-discharge",
                        "createdByAssessment": true,
                        "name": "Municipal Sewer A",
                        "className": "water-discharge",
                        "isValid": true,
                        "diagramNodeId": "n_40pl8g8",
                        "modifiedDate": "2024-10-16T16:37:36.336Z",
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
                    "style": {
                        "backgroundColor": "#7f7fff",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 219,
                        "height": 69
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_km3rucx",
                    "type": "waterDischarge",
                    "position": {
                        "x": 1181.8928639391056,
                        "y": 612.8721217887727
                    },
                    "className": "water-discharge",
                    "data": {
                        "processComponentType": "water-discharge",
                        "createdByAssessment": true,
                        "name": "Municipal Sewer B",
                        "className": "water-discharge",
                        "isValid": true,
                        "diagramNodeId": "n_km3rucx",
                        "modifiedDate": "2024-10-16T16:37:36.336Z",
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
                    "style": {
                        "backgroundColor": "#d784f5",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 219,
                        "height": 69
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_fo9ndq3",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 298.0472795183723,
                        "y": -270.8145833333333
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Cooling Tower",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_fo9ndq3",
                        "modifiedDate": "2024-10-16T16:37:36.336Z",
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
                            "fractionGrossWaterRecirculated": 0
                        },
                        "coolingTower": {},
                        "boilerWater": {},
                        "kitchenRestroom": {},
                        "landscaping": {},
                        "heatEnergy": {
                            "heatingFuelType": 0,
                            "incomingTemp": 0,
                            "outgoingTemp": 0,
                            "heaterEfficiency": 0,
                            "wasteWaterDischarge": 0
                        },
                        "addedMotorEquipment": []
                    },
                    "style": {
                        "backgroundColor": "#00bbff",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 219,
                        "height": 69
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_35zotef",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 285.5975395538644,
                        "y": -105.25729350925091
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Water Using System",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_35zotef",
                        "modifiedDate": "2024-10-16T16:37:36.336Z",
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
                            "fractionGrossWaterRecirculated": 0
                        },
                        "coolingTower": {},
                        "boilerWater": {},
                        "kitchenRestroom": {},
                        "landscaping": {},
                        "heatEnergy": {
                            "heatingFuelType": 0,
                            "incomingTemp": 0,
                            "outgoingTemp": 0,
                            "heaterEfficiency": 0,
                            "wasteWaterDischarge": 0
                        },
                        "addedMotorEquipment": []
                    },
                    "style": {
                        "backgroundColor": "#85477c",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 219,
                        "height": 69
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_jhjsv61",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 286,
                        "y": 30
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Quench Tank",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_jhjsv61",
                        "modifiedDate": "2024-10-16T16:37:36.336Z",
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
                            "fractionGrossWaterRecirculated": 0
                        },
                        "coolingTower": {},
                        "boilerWater": {},
                        "kitchenRestroom": {},
                        "landscaping": {},
                        "heatEnergy": {
                            "heatingFuelType": 0,
                            "incomingTemp": 0,
                            "outgoingTemp": 0,
                            "heaterEfficiency": 0,
                            "wasteWaterDischarge": 0
                        },
                        "addedMotorEquipment": []
                    },
                    "style": {
                        "backgroundColor": "#9c547e",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 219,
                        "height": 69
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_9jgt12z",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 295.1084318360914,
                        "y": 324.85539795114266
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Vacuum Pumps",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_9jgt12z",
                        "modifiedDate": "2024-10-16T16:37:36.336Z",
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
                            "fractionGrossWaterRecirculated": 0
                        },
                        "coolingTower": {},
                        "boilerWater": {},
                        "kitchenRestroom": {},
                        "landscaping": {},
                        "heatEnergy": {
                            "heatingFuelType": 0,
                            "incomingTemp": 0,
                            "outgoingTemp": 0,
                            "heaterEfficiency": 0,
                            "wasteWaterDischarge": 0
                        },
                        "addedMotorEquipment": []
                    },
                    "style": {
                        "backgroundColor": "#8b4689",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 219,
                        "height": 69
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_0uc4i5b",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 559,
                        "y": 529
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Wash Bay",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_0uc4i5b",
                        "modifiedDate": "2024-10-16T16:37:36.336Z",
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
                            "fractionGrossWaterRecirculated": 0
                        },
                        "coolingTower": {},
                        "boilerWater": {},
                        "kitchenRestroom": {},
                        "landscaping": {},
                        "heatEnergy": {
                            "heatingFuelType": 0,
                            "incomingTemp": 0,
                            "outgoingTemp": 0,
                            "heaterEfficiency": 0,
                            "wasteWaterDischarge": 0
                        },
                        "addedMotorEquipment": []
                    },
                    "style": {
                        "backgroundColor": "#00bbff",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 219,
                        "height": 69
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_59n7him",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 564,
                        "y": 651
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Sanitary",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_59n7him",
                        "modifiedDate": "2024-10-16T16:37:36.336Z",
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
                            "fractionGrossWaterRecirculated": 0
                        },
                        "coolingTower": {},
                        "boilerWater": {},
                        "kitchenRestroom": {},
                        "landscaping": {},
                        "heatEnergy": {
                            "heatingFuelType": 0,
                            "incomingTemp": 0,
                            "outgoingTemp": 0,
                            "heaterEfficiency": 0,
                            "wasteWaterDischarge": 0
                        },
                        "addedMotorEquipment": []
                    },
                    "style": {
                        "backgroundColor": "#00bbff",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 219,
                        "height": 69
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_ewqu18d",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 697.8352322249998,
                        "y": -164.9213481967652
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Chillers",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_ewqu18d",
                        "modifiedDate": "2024-10-16T16:37:36.336Z",
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
                            "fractionGrossWaterRecirculated": 0
                        },
                        "coolingTower": {},
                        "boilerWater": {},
                        "kitchenRestroom": {},
                        "landscaping": {},
                        "heatEnergy": {
                            "heatingFuelType": 0,
                            "incomingTemp": 0,
                            "outgoingTemp": 0,
                            "heaterEfficiency": 0,
                            "wasteWaterDischarge": 0
                        },
                        "addedMotorEquipment": []
                    },
                    "style": {
                        "backgroundColor": "#808080",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 219,
                        "height": 69
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_zqp4xwq",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 603.0729523481295,
                        "y": 153.10388232801716
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Blending",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_zqp4xwq",
                        "modifiedDate": "2024-10-16T16:37:36.336Z",
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
                            "fractionGrossWaterRecirculated": 0
                        },
                        "coolingTower": {},
                        "boilerWater": {},
                        "kitchenRestroom": {},
                        "landscaping": {},
                        "heatEnergy": {
                            "heatingFuelType": 0,
                            "incomingTemp": 0,
                            "outgoingTemp": 0,
                            "heaterEfficiency": 0,
                            "wasteWaterDischarge": 0
                        },
                        "addedMotorEquipment": []
                    },
                    "style": {
                        "backgroundColor": "#8a8a8a",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 219,
                        "height": 69
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_kqvywf4",
                    "type": "waterTreatment",
                    "className": "water-treatment",
                    "data": {
                        "processComponentType": "water-treatment",
                        "createdByAssessment": false,
                        "name": "Chlorine",
                        "className": "water-treatment",
                        "isValid": true,
                        "diagramNodeId": "n_kqvywf4",
                        "modifiedDate": "2024-10-16T17:45:42.331Z",
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
                    "style": {
                        "backgroundColor": "#009386",
                        "color": "#ffffff"
                    },
                    "position": {
                        "x": -45.73922716079733,
                        "y": 52.11971565055478
                    },
                    "measured": {
                        "width": 219,
                        "height": 69
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_eaxzfq5",
                    "type": "waterTreatment",
                    "className": "water-treatment",
                    "data": {
                        "processComponentType": "water-treatment",
                        "createdByAssessment": false,
                        "name": "Chemical Treatment 2",
                        "className": "water-treatment",
                        "isValid": true,
                        "diagramNodeId": "n_eaxzfq5",
                        "modifiedDate": "2024-10-16T17:46:02.854Z",
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
                    "style": {
                        "backgroundColor": "#009386",
                        "color": "#ffffff"
                    },
                    "position": {
                        "x": -57.25,
                        "y": -106
                    },
                    "measured": {
                        "width": 219,
                        "height": 96
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "n_4ml8a89",
                    "type": "waterTreatment",
                    "position": {
                        "x": -66.38911969251433,
                        "y": -270.0032744271314
                    },
                    "className": "water-treatment",
                    "data": {
                        "processComponentType": "water-treatment",
                        "createdByAssessment": false,
                        "cost": 1,
                        "name": "Chemical Treatment 1",
                        "className": "water-treatment",
                        "isValid": true,
                        "diagramNodeId": "n_4ml8a89",
                        "modifiedDate": "2024-10-22T15:15:11.940Z",
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
                    },
                    "style": {
                        "backgroundColor": "#009386",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 219,
                        "height": 96
                    },
                    "selected": false,
                    "dragging": false
                }
            ],
            "edges": [
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_k8i3z5t",
                    "sourceHandle": "e",
                    "target": "n_0uc4i5b",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 2.13
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_k8i3z5te-n_0uc4i5ba"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_0uc4i5b",
                    "sourceHandle": "e",
                    "target": "n_km3rucx",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0.26
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_0uc4i5be-n_km3rucxa"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_59n7him",
                    "sourceHandle": "e",
                    "target": "n_km3rucx",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_59n7hime-n_km3rucxa",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_k8i3z5t",
                    "sourceHandle": "f",
                    "target": "n_59n7him",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_k8i3z5tf-n_59n7hima"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_8v95pqn",
                    "sourceHandle": "e",
                    "target": "n_9jgt12z",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 12.48
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_8v95pqne-n_9jgt12za",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_9jgt12z",
                    "sourceHandle": "e",
                    "target": "n_40pl8g8",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 12.48
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_9jgt12ze-n_40pl8g8a"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_jhjsv61",
                    "sourceHandle": "e",
                    "target": "n_40pl8g8",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_jhjsv61e-n_40pl8g8a"
                },
                {
                    "animated": true,
                    "type": "step",
                    "source": "n_35zotef",
                    "sourceHandle": "e",
                    "target": "n_ewqu18d",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0.06
                    },
                    "style": {
                        "stroke": "#0055ff",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_35zotefe-n_ewqu18da",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "step",
                    "source": "n_ewqu18d",
                    "sourceHandle": "e",
                    "target": "n_fo9ndq3",
                    "targetHandle": "b",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 2
                    },
                    "style": {
                        "stroke": "#d41c1c",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_ewqu18de-n_fo9ndq3b",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "step",
                    "source": "n_fo9ndq3",
                    "sourceHandle": "e",
                    "target": "n_ewqu18d",
                    "targetHandle": "b",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 2
                    },
                    "style": {
                        "stroke": "#0055ff",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_fo9ndq3e-n_ewqu18db",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_zqp4xwq",
                    "sourceHandle": "e",
                    "target": "n_ewqu18d",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 17.94
                    },
                    "style": {
                        "stroke": "#00a33f",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_zqp4xwqe-n_ewqu18da"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_ewqu18d",
                    "sourceHandle": "f",
                    "target": "n_35zotef",
                    "targetHandle": "b",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0.06
                    },
                    "style": {
                        "stroke": "#9a2151",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_ewqu18df-n_35zotefb",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_ewqu18d",
                    "sourceHandle": "e",
                    "target": "n_zqp4xwq",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 17.94
                    },
                    "style": {
                        "stroke": "#00b303",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_ewqu18de-n_zqp4xwqa"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_8v95pqn",
                    "sourceHandle": "e",
                    "target": "n_kqvywf4",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 6
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_8v95pqne-n_kqvywf4a"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_kqvywf4",
                    "sourceHandle": "e",
                    "target": "n_jhjsv61",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 5.35
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_kqvywf4e-n_jhjsv61a"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_8v95pqn",
                    "sourceHandle": "e",
                    "target": "n_eaxzfq5",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 1
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_8v95pqne-n_eaxzfq5a"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_eaxzfq5",
                    "sourceHandle": "e",
                    "target": "n_35zotef",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0.6
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_eaxzfq5e-n_35zotefa"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_8v95pqn",
                    "sourceHandle": "e",
                    "target": "n_4ml8a89",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 3
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_8v95pqne-n_4ml8a89a"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_4ml8a89",
                    "sourceHandle": "e",
                    "target": "n_fo9ndq3",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 2.5
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 6
                    },
                    "id": "reactflow__edge-n_4ml8a89e-n_fo9ndq3a"
                }
            ],
            "userDiagramOptions": {
                "edgeThickness": 10,
                "edgeType": 'default',
                "minimapVisible": false,
                "controlsVisible": true,
                "directionalArrowsVisible": false,
            }
        },
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
    

