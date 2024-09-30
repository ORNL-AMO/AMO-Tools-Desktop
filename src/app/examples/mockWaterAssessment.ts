import { Assessment } from "../shared/models/assessment";
import { Settings } from "../shared/models/settings";



export const MockWaterAssessment: Assessment = {
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
            "notes": undefined,
            "conductivityUnit": "MuS/cm"
        },
        "intakeSources": [
            {
                "processComponentType": "water-intake",
                "hasAssessmentData": true,
                "name": "Municipal Water A",
                "className": "water-intake",
                "isValid": true,
                "diagramNodeId": "n_sz5ulomtz",
                "modifiedDate": new Date("2024-09-19T13:06:19.098Z"),
                "sourceType": 0,
                "annualUse": 0,
                "addedMotorEnergy": []
            },
            {
                "processComponentType": "water-intake",
                "hasAssessmentData": true,
                "name": "Municipal Water B",
                "className": "water-intake",
                "isValid": true,
                "diagramNodeId": "n_mxk12ss2u",
                "modifiedDate": new Date("2024-09-19T13:06:20.542Z"),
                "sourceType": 0,
                "annualUse": 0,
                "addedMotorEnergy": []
            }
        ],
        "dischargeOutlets": [
            {
                "processComponentType": "water-discharge",
                "hasAssessmentData": true,
                "name": "Municipal Sewer",
                "className": "water-discharge",
                "isValid": true,
                "diagramNodeId": "n_krrdnugeq",
                "modifiedDate": new Date("2024-09-19T13:06:38.666Z"),
                "outletType": 0,
                "annualUse": 0,
                "addedMotorEnergy": []
            },
            {
                "processComponentType": "water-discharge",
                "hasAssessmentData": true,
                "name": "Municipal Sewer",
                "className": "water-discharge",
                "isValid": true,
                "diagramNodeId": "n_mkjkxrzz0",
                "modifiedDate": new Date("2024-09-19T13:06:40.504Z"),
                "outletType": 0,
                "annualUse": 0,
                "addedMotorEnergy": []
            }
        ],
        "waterUsingSystems": [
            {
                "processComponentType": "water-using-system",
                "hasAssessmentData": true,
                "name": "Cooling Tower",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_ry7pcg7y1",
                "modifiedDate": new Date("2024-09-19T13:06:23.744Z"),
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
                "knownLosses": undefined

            },
            {
                "processComponentType": "water-using-system",
                "hasAssessmentData": true,
                "name": "Process Loop",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_l731t9dli",
                "modifiedDate": new Date("2024-09-19T13:06:25.303Z"),
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
                "knownLosses": undefined

            },
            {
                "processComponentType": "water-using-system",
                "hasAssessmentData": true,
                "name": "Quench Tank",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_dakkr4b7i",
                "modifiedDate": new Date("2024-09-19T13:06:27.080Z"),
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
                "knownLosses": undefined

            },
            {
                "processComponentType": "water-using-system",
                "hasAssessmentData": true,
                "name": "Wash Bay",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_innffif3i",
                "modifiedDate": new Date("2024-09-19T13:06:28.668Z"),
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
                "knownLosses": undefined

            },
            {
                "processComponentType": "water-using-system",
                "hasAssessmentData": true,
                "name": "Sanitary",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_wgkadbp9x",
                "modifiedDate": new Date("2024-09-19T13:06:30.641Z"),
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
                "knownLosses": undefined

            },
            {
                "processComponentType": "water-using-system",
                "hasAssessmentData": true,
                "name": "Chillers",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_jlq55u5pt",
                "modifiedDate": new Date("2024-09-19T13:06:35.060Z"),
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
                "knownLosses": undefined

            },
            {
                "processComponentType": "water-using-system",
                "hasAssessmentData": true,
                "name": "Blending",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_5yxu1fhwv",
                "modifiedDate": new Date("2024-09-19T13:06:37.043Z"),
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
                "knownLosses": undefined

            },
            {
                "processComponentType": "water-using-system",
                "hasAssessmentData": true,
                "name": "Vacuum Pumps",
                "className": "water-using-system",
                "isValid": true,
                "diagramNodeId": "n_xfb32zunn",
                "modifiedDate": new Date("2024-09-19T13:07:06.789Z"),
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
                "knownLosses": undefined
            }
        ],
        "waterTreatments": [],
        "wasteWaterTreatments": []
    },
    "selected": false,
    "appVersion": "1.5.3"
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




