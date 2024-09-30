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
                    "id": "n_sz5ulomtz",
                    "type": "waterIntake",
                    "position": {
                        "x": -330.2982632836129,
                        "y": -51.12647130225008
                    },
                    "className": "water-intake",
                    "data": {
                        "processComponentType": "water-intake",
                        "hasAssessmentData": false,
                        "name": "Municipal Water A",
                        "className": "water-intake",
                        "isValid": true,
                        "diagramNodeId": "n_sz5ulomtz",
                        "modifiedDate": "2024-09-19T13:06:19.098Z"
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
                    "id": "n_mxk12ss2u",
                    "type": "waterIntake",
                    "position": {
                        "x": -311.4014730547056,
                        "y": 191.3352033619054
                    },
                    "className": "water-intake",
                    "data": {
                        "processComponentType": "water-intake",
                        "hasAssessmentData": false,
                        "name": "Municipal Water B",
                        "className": "water-intake",
                        "isValid": true,
                        "diagramNodeId": "n_mxk12ss2u",
                        "modifiedDate": "2024-09-19T13:06:20.542Z"
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
                    "id": "n_ry7pcg7y1",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 241.77588576605717,
                        "y": -449.0941731943854
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": false,
                        "name": "Cooling Tower",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_ry7pcg7y1",
                        "modifiedDate": "2024-09-19T13:06:23.744Z"
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
                    "id": "n_l731t9dli",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 235.75335547823067,
                        "y": -156.3436769375287
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": false,
                        "name": "Process Loop",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_l731t9dli",
                        "modifiedDate": "2024-09-19T13:06:25.303Z"
                    },
                    "style": {
                        "backgroundColor": "#cd9323",
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
                    "id": "n_dakkr4b7i",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 246.56002264222468,
                        "y": -66.43496986328078
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": false,
                        "name": "Quench Tank",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_dakkr4b7i",
                        "modifiedDate": "2024-09-19T13:06:27.080Z"
                    },
                    "style": {
                        "backgroundColor": "#cd9323",
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
                    "id": "n_innffif3i",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 303.8896656742626,
                        "y": 277.2070158963215
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": false,
                        "name": "Wash Bay",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_innffif3i",
                        "modifiedDate": "2024-09-19T13:06:28.668Z"
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
                    "id": "n_wgkadbp9x",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 300.73979573914335,
                        "y": 392.4315155777389
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": false,
                        "name": "Sanitary",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_wgkadbp9x",
                        "modifiedDate": "2024-09-19T13:06:30.641Z"
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
                    "id": "n_jlq55u5pt",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 594.5488526257843,
                        "y": -304.6582833176652
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": false,
                        "name": "Chillers",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_jlq55u5pt",
                        "modifiedDate": "2024-09-19T13:06:35.060Z"
                    },
                    "style": {
                        "backgroundColor": "#7a7a7a",
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
                    "id": "n_5yxu1fhwv",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 682.9384196711303,
                        "y": 77.58139331927484
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": false,
                        "name": "Blending",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_5yxu1fhwv",
                        "modifiedDate": "2024-09-19T13:06:37.043Z"
                    },
                    "style": {
                        "backgroundColor": "#878787",
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
                    "id": "n_krrdnugeq",
                    "type": "waterDischarge",
                    "position": {
                        "x": 866.6568907343953,
                        "y": -175.2046507731065
                    },
                    "className": "water-discharge",
                    "data": {
                        "processComponentType": "water-discharge",
                        "hasAssessmentData": false,
                        "name": "Municipal Sewer",
                        "className": "water-discharge",
                        "isValid": true,
                        "diagramNodeId": "n_krrdnugeq",
                        "modifiedDate": "2024-09-19T13:06:38.666Z"
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
                    "id": "n_mkjkxrzz0",
                    "type": "waterDischarge",
                    "position": {
                        "x": 814.5076680194097,
                        "y": 349.0748703004328
                    },
                    "className": "water-discharge",
                    "data": {
                        "processComponentType": "water-discharge",
                        "hasAssessmentData": false,
                        "name": "Municipal Sewer",
                        "className": "water-discharge",
                        "isValid": true,
                        "diagramNodeId": "n_mkjkxrzz0",
                        "modifiedDate": "2024-09-19T13:06:40.504Z"
                    },
                    "style": {
                        "backgroundColor": "#9999f5",
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
                    "id": "n_xfb32zunn",
                    "type": "waterUsingSystem",
                    "position": {
                        "x": 250.8696261721974,
                        "y": 25.986870308695615
                    },
                    "className": "water-using-system",
                    "data": {
                        "processComponentType": "water-using-system",
                        "hasAssessmentData": false,
                        "name": "Vacuum Pumps",
                        "className": "water-using-system",
                        "isValid": true,
                        "diagramNodeId": "n_xfb32zunn",
                        "modifiedDate": "2024-09-19T13:07:06.789Z"
                    },
                    "style": {
                        "backgroundColor": "#cd9323",
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
                    "source": "n_mxk12ss2u",
                    "sourceHandle": "b",
                    "target": "n_innffif3i",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": "2.13"
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_mxk12ss2ub-n_innffif3ia"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_mxk12ss2u",
                    "sourceHandle": "b",
                    "target": "n_wgkadbp9x",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": ".26"
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_mxk12ss2ub-n_wgkadbp9xa"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_sz5ulomtz",
                    "sourceHandle": "b",
                    "target": "n_xfb32zunn",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": "4"
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_sz5ulomtzb-n_xfb32zunna"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_sz5ulomtz",
                    "sourceHandle": "b",
                    "target": "n_dakkr4b7i",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": "6"
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_sz5ulomtzb-n_dakkr4b7ia"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_sz5ulomtz",
                    "sourceHandle": "b",
                    "target": "n_l731t9dli",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": "2"
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_sz5ulomtzb-n_l731t9dlia"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_sz5ulomtz",
                    "sourceHandle": "b",
                    "target": "n_ry7pcg7y1",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": "8"
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_sz5ulomtzb-n_ry7pcg7y1a"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_ry7pcg7y1",
                    "sourceHandle": "b",
                    "target": "n_jlq55u5pt",
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
                    "id": "reactflow__edge-n_ry7pcg7y1b-n_jlq55u5pta"
                },
                {
                    "animated": true,
                    "type": "step",
                    "source": "n_jlq55u5pt",
                    "sourceHandle": "b",
                    "target": "n_ry7pcg7y1",
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
                    "id": "reactflow__edge-n_jlq55u5ptb-n_ry7pcg7y1a"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_5yxu1fhwv",
                    "sourceHandle": "b",
                    "target": "n_jlq55u5pt",
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
                    "id": "reactflow__edge-n_5yxu1fhwvb-n_jlq55u5pta"
                },
                {
                    "animated": true,
                    "type": "step",
                    "source": "n_l731t9dli",
                    "sourceHandle": "b",
                    "target": "n_jlq55u5pt",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": "1"
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_l731t9dlib-n_jlq55u5pta"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_xfb32zunn",
                    "sourceHandle": "b",
                    "target": "n_krrdnugeq",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": "1"
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_xfb32zunnb-n_krrdnugeqa"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_dakkr4b7i",
                    "sourceHandle": "b",
                    "target": "n_krrdnugeq",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": "1"
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_dakkr4b7ib-n_krrdnugeqa"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_wgkadbp9x",
                    "sourceHandle": "b",
                    "target": "n_mkjkxrzz0",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": ".078"
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_wgkadbp9xb-n_mkjkxrzz0a"
                },
                {
                    "animated": true,
                    "type": "default",
                    "source": "n_innffif3i",
                    "sourceHandle": "b",
                    "target": "n_mkjkxrzz0",
                    "targetHandle": "a",
                    "markerEnd": {
                        "type": MarkerType.ArrowClosed,
                        "width": 25,
                        "height": 25
                    },
                    "data": {
                        "flowPercent": ".078"
                    },
                    "style": {
                        "stroke": "#6c757d"
                    },
                    "id": "reactflow__edge-n_innffif3ib-n_mkjkxrzz0a"
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
    

