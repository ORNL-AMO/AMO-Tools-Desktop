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
                        "x": -153,
                        "y": 156
                    },
                    "className": "water-intake",
                    "data": {
                        "processComponentType": "water-intake",
                        "hasAssessmentData": true,
                        "name": "Municipal Water A",
                        "className": "water-intake",
                        "isValid": true,
                        "diagramNodeId": "n_8v95pqn",
                        "modifiedDate": "2024-10-16T15:41:39.156Z",
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
                        "x": -107,
                        "y": 533
                    },
                    "className": "water-intake",
                    "data": {
                        "processComponentType": "water-intake",
                        "hasAssessmentData": true,
                        "name": "Municipal Water B",
                        "className": "water-intake",
                        "isValid": true,
                        "diagramNodeId": "n_k8i3z5t",
                        "modifiedDate": "2024-10-16T15:41:41.597Z",
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
                        "x": 1207,
                        "y": 151
                    },
                    "className": "water-discharge",
                    "data": {
                        "processComponentType": "water-discharge",
                        "hasAssessmentData": true,
                        "name": "Municipal Sewer A",
                        "className": "water-discharge",
                        "isValid": true,
                        "diagramNodeId": "n_40pl8g8",
                        "modifiedDate": "2024-10-16T15:41:58.374Z",
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
                        "hasAssessmentData": true,
                        "name": "Municipal Sewer B",
                        "className": "water-discharge",
                        "isValid": true,
                        "diagramNodeId": "n_km3rucx",
                        "modifiedDate": "2024-10-16T15:42:00.037Z",
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
                        "x": 308.0472795183723,
                        "y": -146.81458333333333
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": true,
                        "name": "Cooling Tower",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_fo9ndq3",
                        "modifiedDate": "2024-10-16T15:41:43.132Z",
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
                        "x": 321,
                        "y": 38
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": true,
                        "name": "Water Using System",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_35zotef",
                        "modifiedDate": "2024-10-16T15:41:44.719Z",
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
                        "x": 304,
                        "y": 158
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": true,
                        "name": "Quench Tank",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_jhjsv61",
                        "modifiedDate": "2024-10-16T15:41:45.761Z",
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
                        "x": 292,
                        "y": 286
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": true,
                        "name": "Vacuum Pumps",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_9jgt12z",
                        "modifiedDate": "2024-10-16T15:41:46.932Z",
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
                        "hasAssessmentData": true,
                        "name": "Wash Bay",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_0uc4i5b",
                        "modifiedDate": "2024-10-16T15:41:49.451Z",
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
                        "hasAssessmentData": true,
                        "name": "Sanitary",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_59n7him",
                        "modifiedDate": "2024-10-16T15:41:51.107Z",
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
                        "x": 773.5580848648738,
                        "y": -53.87320004861701
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": true,
                        "name": "Chillers",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_ewqu18d",
                        "modifiedDate": "2024-10-16T15:41:54.751Z",
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
                        "x": 889.0486812685394,
                        "y": 322.513417394999
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": true,
                        "name": "Blending",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_zqp4xwq",
                        "modifiedDate": "2024-10-16T15:41:56.202Z",
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
                    "selected": true,
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
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 2.13
                    },
                    "style": {
                        "stroke": "#6c757d"
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
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 0.26
                    },
                    "style": {
                        "stroke": "#6c757d"
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
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 0
                    },
                    "style": {
                        "stroke": "#6c757d"
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
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 0
                    },
                    "style": {
                        "stroke": "#6c757d"
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
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 12.48
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_8v95pqne-n_9jgt12za"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_8v95pqn",
                    "sourceHandle": "e",
                    "target": "n_jhjsv61",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 5.35
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_8v95pqne-n_jhjsv61a"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_8v95pqn",
                    "sourceHandle": "e",
                    "target": "n_35zotef",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 0.06
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_8v95pqne-n_35zotefa"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_9jgt12z",
                    "sourceHandle": "e",
                    "target": "n_40pl8g8",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 0
                    },
                    "style": {
                        "stroke": "#6c757d"
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
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 0
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_jhjsv61e-n_40pl8g8a"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_35zotef",
                    "sourceHandle": "e",
                    "target": "n_ewqu18d",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 0.06
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_35zotefe-n_ewqu18da"
                },
                {
                    "animated": true,
                    "type": "step",
                    "source": "n_ewqu18d",
                    "sourceHandle": "e",
                    "target": "n_fo9ndq3",
                    "targetHandle": "b",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 2
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_ewqu18de-n_fo9ndq3b",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_fo9ndq3",
                    "sourceHandle": "e",
                    "target": "n_ewqu18d",
                    "targetHandle": "b",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 2
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_fo9ndq3e-n_ewqu18db"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_zqp4xwq",
                    "sourceHandle": "e",
                    "target": "n_ewqu18d",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 17.94
                    },
                    "style": {
                        "stroke": "#00a33f"
                    },
                    "id": "reactflow__edge-n_zqp4xwqe-n_ewqu18da"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_8v95pqn",
                    "sourceHandle": "e",
                    "target": "n_fo9ndq3",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 2.61
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_8v95pqne-n_fo9ndq3a"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_ewqu18d",
                    "sourceHandle": "f",
                    "target": "n_35zotef",
                    "targetHandle": "b",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 0.06
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_ewqu18df-n_35zotefb"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_ewqu18d",
                    "sourceHandle": "e",
                    "target": "n_zqp4xwq",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": 17.94
                    },
                    "style": {
                        "stroke": "#00b303"
                    },
                    "id": "reactflow__edge-n_ewqu18de-n_zqp4xwqa"
                }
            ]
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
    

