import { Assessment } from "../shared/models/assessment";
import { Calculator } from "../shared/models/calculators";
import { Settings } from "../shared/models/settings";

export const MockPsat: Assessment = {
    "name": "Basic Pump Example",
    "type": "PSAT",
    "isExample": true,
    "psat": {
        "inputs": {
            "pump_style": 6,
            "pump_specified": null,
            "pump_rated_speed": 2000,
            "drive": 1,
            "kinematic_viscosity": 1.107,
            "specific_gravity": 1.002,
            "stages": 1,
            "fixed_speed": 0,
            "line_frequency": 60,
            "motor_rated_power": 350.01,
            "motor_rated_speed": 2000,
            "efficiency_class": 0,
            "efficiency": 95,
            "motor_rated_voltage": 460,
            "load_estimation_method": 1,
            "motor_rated_fla": 172.63,
            "margin": 0,
            "operating_hours": 8760,
            "flow_rate": 2500,
            "head": 410,
            "motor_field_power": 88.2,
            "motor_field_current": 187,
            "motor_field_voltage": 460,
            "cost_kw_hour": 0.066,
            "fluidType": "Water",
            "fluidTemperature": 68,
            "specifiedDriveEfficiency": null,
            "implementationCosts": null
        },
        "modifications": [{
            "psat": {
                "name": "New Pump and Motor",
                "inputs": {
                    "pump_style": 6,
                    "pump_specified": 87.52,
                    "pump_rated_speed": 2000,
                    "drive": 1,
                    "kinematic_viscosity": 1.107,
                    "specific_gravity": 1.002,
                    "stages": 1,
                    "fixed_speed": 0,
                    "line_frequency": 60,
                    "motor_rated_power": 350.01,
                    "motor_rated_speed": 2000,
                    "efficiency_class": 2,
                    "efficiency": 95,
                    "motor_rated_voltage": 460,
                    "load_estimation_method": 1,
                    "motor_rated_fla": 389.1,
                    "margin": 0,
                    "operating_hours": 8760,
                    "flow_rate": 2499.99,
                    "head": 409.99,
                    "motor_field_power": 88.2,
                    "motor_field_current": 187,
                    "motor_field_voltage": 460,
                    "cost_kw_hour": 0.066,
                    "fluidType": "Water",
                    "fluidTemperature": 68,
                    "specifiedDriveEfficiency": null,
                    "implementationCosts": null
                }
            },
            "notes": {
                "fieldDataNotes": "",
                "motorNotes": "",
                "pumpFluidNotes": "",
                "systemBasicsNotes": ""
            }
        }, {
            "psat": {
                "name": "VFD reduce speed to 90%",
                "inputs": {
                    "pump_style": 11,
                    "pump_specified": 67,
                    "pump_rated_speed": 1600,
                    "drive": 4,
                    "kinematic_viscosity": 1.107,
                    "specific_gravity": 1.002,
                    "stages": 1,
                    "fixed_speed": 0,
                    "line_frequency": 60,
                    "motor_rated_power": 350.01,
                    "motor_rated_speed": 2000,
                    "efficiency_class": 0,
                    "efficiency": 95,
                    "motor_rated_voltage": 460,
                    "load_estimation_method": 1,
                    "motor_rated_fla": 172.63,
                    "margin": 0,
                    "operating_hours": 8760,
                    "flow_rate": 2236.5,
                    "head": 327.7,
                    "motor_field_power": 88.2,
                    "motor_field_current": 187,
                    "motor_field_voltage": 460,
                    "cost_kw_hour": 0.066,
                    "fluidType": "Water",
                    "fluidTemperature": 68,
                    "specifiedDriveEfficiency": 95,
                    "implementationCosts": null,
                    "isVFD": true
                }
            },
            "notes": {
                "fieldDataNotes": "Using system curve calculator, new pump curve meets system curve at 2236.5 gpm and 327.7 ft.",
                "motorNotes": "",
                "pumpFluidNotes": "Using Manuf.'s pump curve - Efficiency at 1800 rpm, 2237 gpm, 330 ft is ~ 67%",
                "systemBasicsNotes": ""
            },
            "exploreOpportunities": true
        }],
        "name": "Baseline",
        "setupDone": true
    },
    "modifiedDate": new Date(),
    "appVersion": "0.5.3-beta"
}

export const MockPsatSettings: Settings = {
    "language": "English",
    "currency": "$ - US Dollar",
    "unitsOfMeasure": "Imperial",
    "distanceMeasurement": "ft",
    "flowMeasurement": "gpm",
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
    "appVersion": "0.5.3-beta",
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
    "disableTutorial": false,
    "disableDashboardTutorial": false,
    "disablePsatSetupTutorial": false,
    "disablePsatAssessmentTutorial": false,
    "disablePsatReportTutorial": false,
    "disablePhastSetupTutorial": false,
    "disablePhastAssessmentTutorial": false,
    "disablePhastReportTutorial": false,
    "disableFsatSetupTutorial": false,
    "disableFsatAssessmentTutorial": false,
    "disableFsatReportTutorial": false,
    "compressedAirCost": 0.022,
    "otherFuelCost": 0,
    "waterCost": 0,
    "waterWasteCost": 0,
    "modifiedDate": new Date(),
    "facilityInfo": {
        "companyName": "ORNL",
        "facilityName": "ORNL Test Facility",
        "address": {
            "street": "1 Bethel Valley Rd.",
            "city": "Oak Ridge",
            "state": "TN",
            "country": "U.S.",
            "zip": "37831"
        },
        "facilityContact": {
            "contactName": "T. Owner",
            "phoneNumber": 8655767658,
            "email": "t.owner@ornl.com"
        },
        "assessmentContact": {
            "contactName": "D.O. Energy",
            "phoneNumber": 1234567890,
            "email": "AMO_ToolHelpDesk@ee.doe.gov"
        },
        "date": "Tue Dec 04 2018"
    },
}



export const MockPsatCalculator: Calculator = {
    "motorPerformanceInputs": {
        "frequency": 50,
        "horsePower": 300,
        "motorRPM": 2000,
        "efficiencyClass": 2,
        "motorVoltage": 460,
        "fullLoadAmps": 323.9,
        "sizeMargin": 1,
        "efficiency": 95
    },
    "systemAndEquipmentCurveData": {
        "pumpSystemCurveData": {
            "specificGravity": 1.002,
            "systemLossExponent": 1.9,
            "pointOneFlowRate": 0,
            "pointOneHead": 0,
            "pointTwo": "Baseline",
            "pointTwoFlowRate": 2500,
            "pointTwoHead": 410
        },
        "byEquationInputs": {
            "maxFlow": 3000,
            "equationOrder": 3,
            "constant": 560,
            "flow": -0.0447,
            "flowTwo": -0.0000019,
            "flowThree": -2.22e-9,
            "flowFour": 0,
            "flowFive": 0,
            "flowSix": 0
        },
        "byDataInputs": {
            "dataRows": [{
                "flow": 0,
                "yValue": 560
            }, {
                "flow": 500,
                "yValue": 540
            }, {
                "flow": 1000,
                "yValue": 510
            }, {
                "flow": 1500,
                "yValue": 480
            }, {
                "flow": 2000,
                "yValue": 450
            }, {
                "flow": 2500,
                "yValue": 400
            }, {
                "flow": 3000,
                "yValue": 350
            }],
            "dataOrder": 3
        },
        "equipmentInputs": {
            "measurementOption": 1,
            "baselineMeasurement": 2000,
            "modificationMeasurementOption": 1,
            "modifiedMeasurement": 1800
        },
        "equipmentCurveFormView": "Equation"
    },
    "nemaInputs": {
        "frequency": 60,
        "horsePower": 350,
        "efficiencyClass": 0,
        "motorRPM": 2000,
        "efficiency": null
    },
    "specificSpeedInputs": {
        "pumpType": 6,
        "pumpRPM": 2000,
        "flowRate": 2500,
        "head": 410
    }
}