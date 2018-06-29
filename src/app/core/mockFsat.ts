import { Assessment } from "../shared/models/assessment";
import { Calculator } from "../shared/models/calculators";
import { Settings } from "../shared/models/settings"

export const MockFsat: Assessment = {
    name: "Fan Example",
    type: "FSAT",
    fsat: {
        name: "Baseline",
        fieldData: {
            operatingFraction: 1,
            cost: 0.06,
            flowRate: 129691,
            inletPressure: -16.36,
            outletPressure: 1.1,
            loadEstimatedMethod: 0,
            motorPower: 450,
            specificHeatRatio: 1.4,
            compressibilityFactor: 0.988,
            measuredVoltage: 460
        },
        fanMotor: {
            lineFrequency: 60,
            motorRatedPower: 600,
            motorRpm: 1180,
            efficiencyClass: 1,
            specifiedEfficiency: 100,
            motorRatedVoltage: 460,
            fullLoadAmps: 683.25
        },
        fanSetup: {
            fanType: 4,
            fanSpecified: null,
            fanSpeed: 1180,
            drive: 1
        },
        baseGasDensity: {
            inputType: "custom",
            gasType: "AIR",
            conditionLocation: 4,
            dryBulbTemp: null,
            staticPressure: null,
            barometricPressure: 29.36,
            specificGravity: 1,
            wetBulbTemp: 119,
            relativeHumidity: 0,
            dewPoint: 0,
            gasDensity: 0.0308,
            specificHeatGas: 0.24
        },
        notes: {
            fieldDataNotes:"",
            fanMotorNotes:"",
            fanSetupNotes:"",
            fluidNotes:""
        },
        implementationCosts: 0,
        setupDone: true,
        modifications: [
            {
                fsat: {
                    name: "Reduce Pressure and Flow",
                    baseGasDensity: {
                        inputType: "custom",
                        gasType: "AIR",
                        conditionLocation: 4,
                        dryBulbTemp: null,
                        staticPressure: null,
                        barometricPressure: 29.36,
                        specificGravity: 1,
                        wetBulbTemp: 119,
                        relativeHumidity: 0,
                        dewPoint: 0,
                        gasDensity: 0.0308,
                        specificHeatGas: 0.24,
                    },
                    fanMotor: {
                        lineFrequency: 60,
                        motorRatedPower: 600,
                        motorRpm: 1180,
                        efficiencyClass: 1,
                        specifiedEfficiency: 100,
                        motorRatedVoltage: 460,
                        fullLoadAmps: 683.25,
                        optimize: false,
                        sizeMargin: 0,
                    },
                    fanSetup: {
                        fanType: 4,
                        fanSpecified: null,
                        fanSpeed: 1180,
                        drive: 1,
                        fanEfficiency: 63.382393,
                    },
                    fieldData: {
                        operatingFraction: 1,
                        flowRate: 86461,
                        inletPressure: -19.19,
                        outletPressure: 1.29,
                        loadEstimatedMethod: 0,
                        motorPower: 450,
                        cost: 0.06,
                        specificHeatRatio: 1.4,
                        compressibilityFactor: 0.988,
                        measuredVoltage: 460,
                        
                    },
                    implementationCosts: null,
                    notes: {
                        fieldDataNotes:"",
                        fanMotorNotes:"",
                        fanSetupNotes:"",
                        fluidNotes:""
                    },
                },
                notes: {
                    fieldDataNotes: "",
                    fanMotorNotes: "",
                    fanSetupNotes: "",
                    fluidNotes: ""
                },
            },
            {
                fsat: {
                    name: "Optimize",
                    baseGasDensity: {
                        inputType: "custom",
                        gasType: "AIR",
                        conditionLocation: 4,
                        dryBulbTemp: null,
                        staticPressure: null,
                        barometricPressure: 29.36,
                        specificGravity: 1,
                        wetBulbTemp: 119,
                        relativeHumidity: 0,
                        dewPoint: 0,
                        gasDensity: 0.0308,
                        specificHeatGas: 0.24
                    },
                    fanMotor: {
                        lineFrequency: 60,
                        motorRatedPower: 600,
                        motorRpm: 1180,
                        efficiencyClass: 1,
                        specifiedEfficiency: 100,
                        motorRatedVoltage: 460,
                        fullLoadAmps: 683.25,
                        sizeMargin: null,
                        optimize: true,
                    },
                    fanSetup: {
                        fanType: 4,
                        fanSpecified: null,
                        fanSpeed: 1180,
                        drive: 1,
                        fanEfficiency: 63.382393,
                    },
                    fieldData: {
                        operatingFraction: 1,
                        flowRate: 129691,
                        inletPressure: -16.36,
                        outletPressure: 1.1,
                        loadEstimatedMethod: 0,
                        motorPower: 450,
                        cost: 0.06,
                        specificHeatRatio: 1.4,
                        compressibilityFactor: 0.988,
                        measuredVoltage: 460,
                    },
                    implementationCosts: null,
                    notes: {
                        fieldDataNotes:"",
                        fanMotorNotes:"",
                        fanSetupNotes:"",
                        fluidNotes:""
                    },
                },
                notes: {
                    fieldDataNotes: "",
                    fanMotorNotes: "",
                    fanSetupNotes: "",
                    fluidNotes: ""
                }
            },
            {
                fsat: {
                    name: "Motor Belt Drive",
                    baseGasDensity: {
                        inputType: "custom",
                        gasType: "AIR",
                        conditionLocation: 4,
                        dryBulbTemp: null,
                        staticPressure: null,
                        barometricPressure: 29.36,
                        specificGravity: 1,
                        wetBulbTemp: 119,
                        relativeHumidity: 0,
                        dewPoint: 0,
                        gasDensity: 0.0308,
                        specificHeatGas: 0.24,
                    },
                    fanMotor: {
                        lineFrequency: 60,
                        motorRatedPower: 600,
                        motorRpm: 1180,
                        efficiencyClass: 1,
                        specifiedEfficiency: 100,
                        motorRatedVoltage: 460,
                        fullLoadAmps: 683.25,
                    },
                    fanSetup: {
                        fanType: 4,
                        fanSpecified: null,
                        fanSpeed: 1180,
                        drive: 0,
                        fanEfficiency: 63.382393,
                    },
                    fieldData: {
                        operatingFraction: 1,
                        flowRate: 129691,
                        inletPressure: -16.36,
                        outletPressure: 1.1,
                        loadEstimatedMethod: 0,
                        motorPower: 450,
                        cost: 0.06,
                        specificHeatRatio: 1.4,
                        compressibilityFactor: 0.988,
                        measuredVoltage: 460,
                    },
                    implementationCosts: null,
                    notes: {
                        fieldDataNotes:"",
                        fanMotorNotes:"",
                        fanSetupNotes:"",
                        fluidNotes:""
                    },
                },
                notes: {
                    fieldDataNotes: "",
                    fanMotorNotes: "",
                    fanSetupNotes: "",
                    fluidNotes: ""
                }
            },
            {
                fsat: {
                    name: "Change Fan Type-Optimized",
                    baseGasDensity: {
                        inputType: "custom",
                        gasType: "AIR",
                        conditionLocation: 4,
                        dryBulbTemp: null,
                        staticPressure: null,
                        barometricPressure: 29.36,
                        specificGravity: 1,
                        wetBulbTemp: 119,
                        relativeHumidity: 0,
                        dewPoint: 0,
                        gasDensity: 0.0308,
                        specificHeatGas: 0.24,
                    },
                    fanMotor: {
                        lineFrequency: 60,
                        motorRatedPower: 600,
                        motorRpm: 1180,
                        efficiencyClass: 1,
                        specifiedEfficiency: 100,
                        motorRatedVoltage: 460,
                        fullLoadAmps: 683.25,
                        sizeMargin: null,
                        optimize: true,
                    },
                    fanSetup: {
                        fanType: 5,
                        fanSpecified: null,
                        fanSpeed: 1180,
                        drive: 1,
                        fanEfficiency: 63.382393,
                    },
                    fieldData: {
                        operatingFraction: 1,
                        flowRate: 129691,
                        inletPressure: -16.36,
                        outletPressure: 1.1,
                        loadEstimatedMethod: 0,
                        motorPower: 450,
                        cost: 0.06,
                        specificHeatRatio: 1.4,
                        compressibilityFactor: 0.988,
                        measuredVoltage: 460,
                    },
                    implementationCosts: null,
                    notes: {
                        fieldDataNotes:"",
                        fanMotorNotes:"",
                        fanSetupNotes:"",
                        fluidNotes:""
                    },
                },
                notes: {
                    fieldDataNotes: "",
                    fanMotorNotes: "",
                    fanSetupNotes: "",
                    fluidNotes: ""
                }
            },
        ],
    },
    selected: true,
    directoryId: 2
}

export const MockFsatSettings: Settings = {
    language: "English",
    currency: "$ - US Dollar",
    unitsOfMeasure: "Imperial",
    distanceMeasurement: "ft",
    flowMeasurement: "gpm",
    powerMeasurement: "hp",
    pressureMeasurement: "psi",
    steamPressureMeasurement: "kPa",
    steamTemperatureMeasurement: "C",
    steamSpecificEnthalpyMeasurement: "kJkg",
    steamSpecificEntropyMeasurement: "kJkgK",
    steamSpecificVolumeMeasurement: "m3kg",
    steamMassFlowMeasurement: "kghr",
    currentMeasurement: null,
    viscosityMeasurement: null,
    voltageMeasurement: null,
    energySourceType: "Fuel",
    furnaceType: null,
    energyResultUnit: "MMBtu",
    customFurnaceName: null,
    temperatureMeasurement: "F",
    appVersion: "0.2.8-beta",
    fanCurveType: null,
    fanConvertedConditions: null,
    phastRollupUnit: "MMBtu",
    phastRollupFuelUnit: "MMBtu",
    phastRollupElectricityUnit: "MMBtu",
    phastRollupSteamUnit: "MMBtu",
    defaultPanelTab: "results",
    fuelCost: 3.99,
    steamCost: 4.69,
    electricityCost: 0.066,
    densityMeasurement: "lbscf",
    fanFlowRate: "ft3/min",
    fanPressureMeasurement: "inH2o",
    fanBarometricPressure: "inHg",
    fanSpecificHeatGas: "btulbF",
    fanPowerMeasurement: "hp",
    directoryId: 2,
    facilityInfo: {
        companyName: 'ORNL',
        facilityName: 'ORNL Test Facility',
        address: {
            street: '1 Bethel Valley Rd.',
            city: 'Oak Ridge',
            state: 'TN',
            country: 'U.S.',
            zip: '37831'
        },
        facilityContact: {
            contactName: 'T. Owner',
            phoneNumber: 8655767658,
            email: 't.owner@ornl.com'
        },
        assessmentContact: {
            contactName: 'D.O. Energy',
            phoneNumber: 1234567890,
            email: 'AMO_ToolHelpDesk@ee.doe.gov'
        }
    }
}
/*
calculators: [],
origin: "AMO-TOOLS-DESKTOP"
}
*/