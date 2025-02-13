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
            "calculatedData": {},
            "recentEdgeColors": [],
            "recentNodeColors": [],
            "settings": {
                "flowDecimalPrecision": 2,
                "unitsOfMeasure": 'Imperial'
            },
            "nodes": [
                {
                    "id": "n_07ezr25",
                    "type": "splitterNodeFour",
                    "position": {
                        "x": 1094.511576543104,
                        "y": 185.5472577406199
                    },
                    "className": "splitter-node-4",
                    "data": {},
                    "measured": {
                        "width": 169,
                        "height": 10
                    },
                    "selected": false,
                    "dragging": false,
                    "resizing": false,
                    "width": 169,
                    "height": 10
                },
                {
                    "id": "n_838vgxz",
                    "type": "splitterNodeFour",
                    "position": {
                        "x": 816.1033145044203,
                        "y": 619.3899840344272
                    },
                    "className": "splitter-node-4",
                    "data": {},
                    "measured": {
                        "width": 186,
                        "height": 10
                    },
                    "selected": false,
                    "dragging": false,
                    "width": 186,
                    "height": 10,
                    "resizing": false
                },
                {
                    "id": "n_sikn350",
                    "type": "waterIntake",
                    "position": {
                        "x": -357.39880433311055,
                        "y": 220.1704269974408
                    },
                    "className": "water-intake",
                    "data": {
                        "processComponentType": "water-intake",
                        "createdByAssessment": true,
                        "name": "Municipal Water A",
                        "className": "water-intake",
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": undefined,
                            "totalSourceFlow": undefined
                        },
                        "disableInflowConnections": true,
                        "diagramNodeId": "n_sikn350",
                        "modifiedDate": new Date("2024-10-31T15:32:42.800Z"),
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
                    "id": "n_fo68a9w",
                    "type": "waterIntake",
                    "position": {
                        "x": -337.4253083243775,
                        "y": 464.0952547660403
                    },
                    "className": "water-intake",
                    "data": {
                        "processComponentType": "water-intake",
                        "createdByAssessment": true,
                        "name": "Municipal Water B",
                        "className": "water-intake",
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": undefined,
                            "totalSourceFlow": undefined
                        },
                        "disableInflowConnections": true,
                        "diagramNodeId": "n_fo68a9w",
                        "modifiedDate": new Date("2024-10-31T15:32:42.800Z"),
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
                    "id": "n_i8u4vhf",
                    "type": "waterDischarge",
                    "position": {
                        "x": 1365.310800590494,
                        "y": 122.84231838007167
                    },
                    "className": "water-discharge",
                    "data": {
                        "processComponentType": "water-discharge",
                        "createdByAssessment": true,
                        "name": "Municipal Sewer 1",
                        "className": "water-discharge",
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": undefined,
                            "totalSourceFlow": undefined
                        },
                        "disableOutflowConnections": true,
                        "diagramNodeId": "n_i8u4vhf",
                        "modifiedDate": new Date("2024-10-31T15:32:42.800Z"),
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
                    "id": "n_s0riw08",
                    "type": "waterDischarge",
                    "position": {
                        "x": 1131.6739481564612,
                        "y": 591.421417167448
                    },
                    "className": "water-discharge",
                    "data": {
                        "processComponentType": "water-discharge",
                        "createdByAssessment": true,
                        "name": "Municipal Sewer 2",
                        "className": "water-discharge",
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": undefined,
                            "totalSourceFlow": undefined
                        },
                        "disableOutflowConnections": true,
                        "diagramNodeId": "n_s0riw08",
                        "modifiedDate": new Date("2024-10-31T15:32:42.800Z"),
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
                    "id": "n_jpmgb59",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 373.69298213243223,
                        "y": -223.52708948367834
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Cooling Tower",
                        "className": "water-using-system",
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": undefined,
                            "totalSourceFlow": undefined
                        },
                        "diagramNodeId": "n_jpmgb59",
                        "modifiedDate": new Date("2024-10-31T15:32:42.800Z"),
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
                            "recycledSourceWater": undefined,
                            "recirculatedWater": undefined,
                            "dischargeWater": undefined,
                            "dischargeWaterRecycled": undefined,
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
                        "addedMotorEnergy": []
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
                    "id": "n_bap4mdz",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 427.18591854895385,
                        "y": 85.91206843448447
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Process Loop",
                        "className": "water-using-system",
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": undefined,
                            "totalSourceFlow": undefined
                        },
                        "diagramNodeId": "n_bap4mdz",
                        "modifiedDate": new Date("2024-10-31T15:32:42.800Z"),
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
                            "recycledSourceWater": undefined,
                            "recirculatedWater": undefined,
                            "dischargeWater": undefined,
                            "dischargeWaterRecycled": undefined,
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
                        "addedMotorEnergy": []
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
                    "id": "n_q8z56fu",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 429.4702121283731,
                        "y": 182.00319690883032
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Quench Tank",
                        "className": "water-using-system",
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": undefined,
                            "totalSourceFlow": undefined
                        },
                        "diagramNodeId": "n_q8z56fu",
                        "modifiedDate": new Date("2024-10-31T15:32:42.800Z"),
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
                            "recycledSourceWater": undefined,
                            "recirculatedWater": undefined,
                            "dischargeWater": undefined,
                            "dischargeWaterRecycled": undefined,
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
                        "addedMotorEnergy": []
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
                    "id": "n_7uv5ufq",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 428.8526590962797,
                        "y": 274.32606813348286
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Vacuum Pump",
                        "className": "water-using-system",
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": undefined,
                            "totalSourceFlow": undefined
                        },
                        "diagramNodeId": "n_7uv5ufq",
                        "modifiedDate": new Date("2024-10-31T15:32:42.800Z"),
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
                            "recycledSourceWater": undefined,
                            "recirculatedWater": undefined,
                            "dischargeWater": undefined,
                            "dischargeWaterRecycled": undefined,
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
                        "addedMotorEnergy": []
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
                    "id": "n_oy8l0zr",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 820.3335078671764,
                        "y": -112.96009904972772
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Chillers",
                        "className": "water-using-system",
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": undefined,
                            "totalSourceFlow": undefined
                        },
                        "diagramNodeId": "n_oy8l0zr",
                        "modifiedDate": new Date("2024-10-31T15:32:42.800Z"),
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
                            "recycledSourceWater": undefined,
                            "recirculatedWater": undefined,
                            "dischargeWater": undefined,
                            "dischargeWaterRecycled": undefined,
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
                        "addedMotorEnergy": []
                    },
                    "style": {
                        "backgroundColor": "#adadad",
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
                    "id": "n_z5ch3bo",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 974.4170302027794,
                        "y": 330.7930833530255
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Blending",
                        "className": "water-using-system",
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": undefined,
                            "totalSourceFlow": undefined
                        },
                        "diagramNodeId": "n_z5ch3bo",
                        "modifiedDate": new Date("2024-10-31T15:32:42.800Z"),
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
                            "recycledSourceWater": undefined,
                            "recirculatedWater": undefined,
                            "dischargeWater": undefined,
                            "dischargeWaterRecycled": undefined,
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
                        "addedMotorEnergy": []
                    },
                    "style": {
                        "backgroundColor": "#b0b0b0",
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
                    "id": "n_ytvqdez",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 402.7930833530255,
                        "y": 480.4984015455848
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Wash Bay",
                        "className": "water-using-system",
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": undefined,
                            "totalSourceFlow": undefined
                        },
                        "diagramNodeId": "n_ytvqdez",
                        "modifiedDate": new Date("2024-10-31T15:32:42.800Z"),
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
                            "recycledSourceWater": undefined,
                            "recirculatedWater": undefined,
                            "dischargeWater": undefined,
                            "dischargeWaterRecycled": undefined,
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
                        "addedMotorEnergy": []
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
                    "id": "n_zxuieyv",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 407.0877651604661,
                        "y": 610.9372273479155
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "createdByAssessment": true,
                        "name": "Sanitary",
                        "className": "water-using-system",
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": undefined,
                            "totalSourceFlow": undefined
                        },
                        "diagramNodeId": "n_zxuieyv",
                        "modifiedDate": new Date("2024-10-31T15:32:42.800Z"),
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
                            "recycledSourceWater": undefined,
                            "recirculatedWater": undefined,
                            "dischargeWater": undefined,
                            "dischargeWaterRecycled": undefined,
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
                        "addedMotorEnergy": []
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
                    "id": "n_8isow7x",
                    "type": "waterTreatment",
                    "position": {
                        "x": 23.967684291093747,
                        "y": -154.2408480721541
                    },
                    "className": "water-treatment",
                    "data": {
                        "processComponentType": "water-treatment",
                        "createdByAssessment": false,
                        "name": "Chemical Treatment 1",
                        "className": "water-treatment",
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": undefined,
                            "totalSourceFlow": undefined
                        },
                        "diagramNodeId": "n_8isow7x",
                        "modifiedDate": new Date("2024-10-31T15:32:42.800Z"),
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
                        "cost": 0
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
                },
                {
                    "id": "n_id24c8f",
                    "type": "waterTreatment",
                    "position": {
                        "x": 29,
                        "y": -6
                    },
                    "className": "water-treatment",
                    "data": {
                        "processComponentType": "water-treatment",
                        "createdByAssessment": false,
                        "name": "Chemical Treatment 2",
                        "className": "water-treatment",
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": undefined,
                            "totalSourceFlow": undefined
                        },
                        "diagramNodeId": "n_id24c8f",
                        "modifiedDate": new Date("2024-10-31T15:32:42.800Z"),
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
                        "cost": 0
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
                },
                {
                    "id": "n_1zvy0mn",
                    "type": "waterTreatment",
                    "position": {
                        "x": 28,
                        "y": 158
                    },
                    "className": "water-treatment",
                    "data": {
                        "processComponentType": "water-treatment",
                        "createdByAssessment": false,
                        "name": "Chlorine",
                        "className": "water-treatment",
                        "isValid": true,
                        "userEnteredData": {
                            "totalDischargeFlow": undefined,
                            "totalSourceFlow": undefined
                        },
                        "diagramNodeId": "n_1zvy0mn",
                        "modifiedDate": new Date("2024-10-31T15:32:42.800Z"),
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
                    },
                    "style": {
                        "backgroundColor": "#009386",
                        "color": "#ffffff"
                    },
                    "measured": {
                        "width": 219,
                        "height": 69
                    },
                    "selected": false,
                    "dragging": false
                }
            ],
            "edges": [
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_fo68a9w",
                    "sourceHandle": "e",
                    "target": "n_ytvqdez",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 2.13
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_fo68a9we-n_ytvqdeza"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_fo68a9w",
                    "sourceHandle": "f",
                    "target": "n_zxuieyv",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0.26
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_fo68a9wf-n_zxuieyva",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_sikn350",
                    "sourceHandle": "e",
                    "target": "n_8isow7x",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 4
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_sikn350e-n_8isow7xa"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_sikn350",
                    "sourceHandle": "h",
                    "target": "n_id24c8f",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 1
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_sikn350h-n_id24c8fa"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_sikn350",
                    "sourceHandle": "g",
                    "target": "n_1zvy0mn",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 6
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_sikn350g-n_1zvy0mna",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_sikn350",
                    "sourceHandle": "e",
                    "target": "n_7uv5ufq",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 12.48
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_sikn350e-n_7uv5ufqa",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_1zvy0mn",
                    "sourceHandle": "e",
                    "target": "n_q8z56fu",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 5.35
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_1zvy0mne-n_q8z56fua",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_id24c8f",
                    "sourceHandle": "e",
                    "target": "n_bap4mdz",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0.06
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_id24c8fe-n_bap4mdza",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_8isow7x",
                    "sourceHandle": "e",
                    "target": "n_jpmgb59",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 2.61
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_8isow7xe-n_jpmgb59a"
                },
                {
                    "animated": true,
                    "type": "step",
                    "source": "n_oy8l0zr",
                    "sourceHandle": "e",
                    "target": "n_z5ch3bo",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0,
                        "hasOwnEdgeType": "step"
                    },
                    "style": {
                        "stroke": "#1a53d8",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_oy8l0zre-n_z5ch3boa",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_jpmgb59",
                    "sourceHandle": "f",
                    "target": "n_oy8l0zr",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0
                    },
                    "style": {
                        "stroke": "#cd9323",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_jpmgb59f-n_oy8l0zra"
                },
                {
                    "animated": true,
                    "type": "step",
                    "source": "n_oy8l0zr",
                    "sourceHandle": "f",
                    "target": "n_jpmgb59",
                    "targetHandle": "b",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0,
                        "hasOwnEdgeType": "step"
                    },
                    "style": {
                        "stroke": "#1a53d8",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_oy8l0zrf-n_jpmgb59b",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "step",
                    "source": "n_oy8l0zr",
                    "sourceHandle": "g",
                    "target": "n_bap4mdz",
                    "targetHandle": "b",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0,
                        "hasOwnEdgeType": "step"
                    },
                    "style": {
                        "stroke": "#1a53d8",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_oy8l0zrg-n_bap4mdzb",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_bap4mdz",
                    "sourceHandle": "e",
                    "target": "n_oy8l0zr",
                    "targetHandle": "b",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0.06
                    },
                    "style": {
                        "stroke": "#cd9323",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_bap4mdze-n_oy8l0zrb"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_jpmgb59",
                    "sourceHandle": "e",
                    "target": "n_oy8l0zr",
                    "targetHandle": "b",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0
                    },
                    "style": {
                        "stroke": "#cd9323",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_jpmgb59e-n_oy8l0zrb"
                },
                {
                    "animated": true,
                    "type": "step",
                    "source": "n_jpmgb59",
                    "sourceHandle": "e",
                    "target": "n_07ezr25",
                    "targetHandle": "b",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0.43,
                        "hasOwnEdgeType": "step"
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_jpmgb59e-n_07ezr25b",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_q8z56fu",
                    "sourceHandle": "e",
                    "target": "n_07ezr25",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 5
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_q8z56fue-n_07ezr25a",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_7uv5ufq",
                    "sourceHandle": "e",
                    "target": "n_07ezr25",
                    "targetHandle": "e",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_7uv5ufqe-n_07ezr25e",
                    "selected": true
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_07ezr25",
                    "sourceHandle": "f",
                    "target": "n_i8u4vhf",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 17.94
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_07ezr25f-n_i8u4vhfa"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_ytvqdez",
                    "sourceHandle": "e",
                    "target": "n_838vgxz",
                    "targetHandle": "b",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 1.5
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_ytvqdeze-n_838vgxzb"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_zxuieyv",
                    "sourceHandle": "e",
                    "target": "n_838vgxz",
                    "targetHandle": "e",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0.5
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_zxuieyve-n_838vgxze",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_838vgxz",
                    "sourceHandle": "f",
                    "target": "n_s0riw08",
                    "targetHandle": "a",
                    "markerEnd": "",
                    "data": {
                        "flowValue": 0.165
                    },
                    "style": {
                        "stroke": "#6c757d",
                        "strokeWidth": 4
                    },
                    "id": "reactflow__edge-n_838vgxzf-n_s0riw08a"
                }
            ],
            "userDiagramOptions": {
                "strokeWidth": 4,
                "edgeType": "default",
                "minimapVisible": false,
                "controlsVisible": true,
                "directionalArrowsVisible": false,
                "animated": true,
                "showFlowLabels": true,
                "flowLabelSize": 1,
            }
        }
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
    

