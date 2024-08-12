import { Assessment } from "../shared/models/assessment";
import { Settings } from "../shared/models/settings";



export const MockWaterAssessment: Assessment =  {
    "name": "Water Example",
    "createdDate": new Date("2024-06-11T19:35:48.626Z"),
    "modifiedDate": new Date("2024-06-11T19:35:48.626Z"),
    "type": "Water",
    "isExample": true,
    "directoryId": 2,
    "water": {
        "name": "Baseline",
        "modifications": [],
        "setupDone": true,
        "systemBasics": {
            "utilityType": "Electricity",
            "electricityCost": 0.066,
            "notes": undefined
        },
        "intakeSources": [
            {
              "processComponentType": "water-intake",
              "name": "City Intake",
              "className": "water-intake",
              "isValid": true,
              "diagramNodeId": "dndnode_a7czeo5fx",
              "modifiedDate": new Date("2024-07-09T16:47:48.232Z"),
              "sourceType": 0,
              "annualUse": 100,
              "hasAssessmentData": true
          }
        ],
        "dischargeOutlets": [
            {
              "processComponentType": "water-discharge",
              "name": "Municipal Outlet",
              "className": "water-discharge",
              "isValid": true,
              "diagramNodeId": "dndnode_l4mvses3w",
              "modifiedDate": new Date("2024-07-09T19:23:52.173Z"),
              "outletType": 0,
              "annualUse": 200,
              "hasAssessmentData": true
          }
        ],
        "waterUsingSystems": [
          {
            "processComponentType": "water-using-system",
            "hasAssessmentData": true,
            "name": "Water Process 1",
            "className": "water-using-system",
            "isValid": true,
            "diagramNodeId": "dndnode_vq0ms2jky",
            "modifiedDate": new Date("2024-07-29T12:58:19.498Z"),
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
            "coolingTower": undefined,
            "boilerWater": undefined,
            "kitchenRestroom": undefined,
            "landscaping": undefined,
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
        }
        ],

    },
    "selected": false,
    "appVersion": "1.5.1"
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
    