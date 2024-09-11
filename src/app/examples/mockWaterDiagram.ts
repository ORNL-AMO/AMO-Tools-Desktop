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
                    "id": "dndnode_a7czeo5fx",
                    "type": "waterIntake",
                    "className": "water-intake",
                    "data": {
                        "processComponentType": "water-intake",
                        "name": "City Municipal Intake",
                        "className": "water-intake",
                        "isValid": true,
                        "diagramNodeId": "dndnode_a7czeo5fx",
                        "modifiedDate": "2024-07-09T16:47:48.232Z",
                        "sourceType": 0,
                        "annualUse": 100,
                        "hasAssessmentData": true
                    },
                    "style": {
                        backgroundColor: '#75a1ff'
                    },
                    "position": {
                        "x": -28.094686485743182,
                        "y": 201.03209583403844
                    },
                    "measured": {
                        "width": 219,
                        "height": 63
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "dndnode_x5sqp862d",
                    "type": "waterIntake",
                    "position": {
                        "x": -40.27471699593872,
                        "y": 50.800418149801175
                    },
                    "className": "water-intake",
                    "data": {
                        "processComponentType": "water-intake",
                        "hasAssessmentData": true,
                        "name": "Reservoir",
                        "className": "water-intake",
                        "isValid": true,
                        "diagramNodeId": "dndnode_x5sqp862d",
                        "modifiedDate": "2024-09-09T19:39:38.681Z",
                        "sourceType": 0,
                        "annualUse": 0
                    },
                    "style": {
                        backgroundColor: '#75a1ff'
                      },
                    "measured": {
                        "width": 219,
                        "height": 63
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "dndnode_l4mvses3w",
                    "type": "waterDischarge",
                    "className": "water-discharge",
                    "data": {
                        "processComponentType": "water-discharge",
                        "name": "Municipal Outlet",
                        "className": "water-discharge",
                        "isValid": true,
                        "diagramNodeId": "dndnode_l4mvses3w",
                        "modifiedDate": "2024-07-09T19:23:52.173Z",
                        "outletType": 0,
                        "annualUse": 200,
                        "hasAssessmentData": true
                    },
                    "style": {
                        backgroundColor: '#7f7fff'
                      },
                    "position": {
                        "x": 852.2043883258892,
                        "y": 183.9824047039503
                    },
                    "measured": {
                        "width": 219,
                        "height": 63
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "dndnode_vq0ms2jky",
                    "type": "waterUsingSystem",
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": true,
                        "name": "Water Process 1",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "dndnode_vq0ms2jky",
                        "modifiedDate": "2024-07-29T12:58:19.498Z",
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
                        "heatEnergy": {
                            "heatingFuelType": 0,
                            "incomingTemp": 0,
                            "outgoingTemp": 0,
                            "heaterEfficiency": 0,
                            "wasteWaterDischarge": 0
                        },
                        "addedMotorEquipment": [],
                        "sourceWater": 500,
                        "recycledWater": 200,
                        "recirculatedWater": 100,
                        "dischargeWater": 100,
                        "dischargeWaterRecycled": 25,
                        "waterInProduct": 75,
                        "knownLosses": 15
                    },
                    style: {
                        backgroundColor: '#00bbff'
                      },
                    "position": {
                        "x": 369.4698724818088,
                        "y": 247.85415607284884
                    },
                    "measured": {
                        "width": 219,
                        "height": 63
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "dndnode_82iznjpgf",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 332.4784803441494,
                        "y": 118.86694543320078
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": true,
                        "name": "Cooling Tower 1",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "dndnode_82iznjpgf",
                        "modifiedDate": "2024-09-09T19:38:55.824Z",
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
                    style: {
                        backgroundColor: '#00bbff'
                      },
                    "measured": {
                        "width": 219,
                        "height": 63
                    },
                    "selected": false,
                    "dragging": false
                },
                {
                    "id": "dndnode_nltvr1zs8",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 319.78320242512063,
                        "y": -14.922774105254234
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": true,
                        "name": "Cooling Tower 2",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "dndnode_nltvr1zs8",
                        "modifiedDate": "2024-09-09T19:38:57.117Z",
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
                        backgroundColor: '#00bbff'
                      },
                    "measured": {
                        "width": 219,
                        "height": 63
                    },
                    "selected": false,
                    "dragging": false
                }
            ],
            "edges": [
                {
                    "animated": true,
                    "type": "default",
                    "source": "dndnode_a7czeo5fx",
                    "sourceHandle": "b",
                    "target": "dndnode_vq0ms2jky",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "style": {
                        "stroke": "#0088ff"
                    },
                    "id": "reactflow__edge-dndnode_a7czeo5fxb-dndnode_vq0ms2jkya",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "dndnode_vq0ms2jky",
                    "sourceHandle": "b",
                    "target": "dndnode_l4mvses3w",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "style": {
                        "stroke": "#0088ff"
                    },
                    "id": "reactflow__edge-dndnode_vq0ms2jkyb-dndnode_l4mvses3wa",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "dndnode_a7czeo5fx",
                    "sourceHandle": "b",
                    "target": "dndnode_82iznjpgf",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-dndnode_a7czeo5fxb-dndnode_82iznjpgfa"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "dndnode_a7czeo5fx",
                    "sourceHandle": "b",
                    "target": "dndnode_nltvr1zs8",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-dndnode_a7czeo5fxb-dndnode_nltvr1zs8a",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "step",
                    "source": "dndnode_x5sqp862d",
                    "sourceHandle": "b",
                    "target": "dndnode_nltvr1zs8",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-dndnode_x5sqp862db-dndnode_nltvr1zs8a",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "step",
                    "source": "dndnode_nltvr1zs8",
                    "sourceHandle": "b",
                    "target": "dndnode_l4mvses3w",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-dndnode_nltvr1zs8b-dndnode_l4mvses3wa",
                    "selected": false
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "dndnode_82iznjpgf",
                    "sourceHandle": "b",
                    "target": "dndnode_l4mvses3w",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-dndnode_82iznjpgfb-dndnode_l4mvses3wa"
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
    
