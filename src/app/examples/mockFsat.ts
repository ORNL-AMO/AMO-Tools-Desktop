import { Assessment } from "../shared/models/assessment";
import { Settings } from "../shared/models/settings";
import { Calculator } from "../shared/models/calculators";

export const MockFsat: Assessment = {
    isExample: true,
    name: "Fan Example",
    type: "FSAT",
    fsat: {
        name: "Baseline",
        fieldData: {
            flowRate: 129691,
            inletPressure: -16.36,
            inletVelocityPressure: -2.5,
            usingStaticPressure: true,
            outletPressure: 1.1,
            loadEstimatedMethod: 0,
            motorPower: 450,
            compressibilityFactor: 0.988,
            measuredVoltage: 460
        },
        fsatOperations: {
            operatingHours: 8760,
            cost: 0.06,
            cO2SavingsData: {
                energyType: 'electricity',
                energySource: '',
                fuelType: '',
                totalEmissionOutputRate: 401.07,
                electricityUse: 0,
                eGridRegion: '',
                eGridSubregion: 'U.S. Average',
                totalEmissionOutput: 0,
                userEnteredBaselineEmissions: false,
                userEnteredModificationEmissions: true,
                zipcode: '00000',
            },
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
            fanType: 0,
            fanSpeed: 1180,
            drive: 1,
            specifiedDriveEfficiency: 100
        },
        baseGasDensity: {
            inputType: "custom",
            gasType: "AIR",
            dryBulbTemp: null,
            staticPressure: null,
            barometricPressure: 29.36,
            specificGravity: 1,
            wetBulbTemp: 119,
            relativeHumidity: 0,
            dewPoint: 0,
            specificHeatRatio: 1.4,
            gasDensity: 0.0308,
            specificHeatGas: 0.24
        },
        notes: {
            fieldDataNotes: "",
            fanMotorNotes: "",
            fanSetupNotes: "",
            fluidNotes: ""
        },
        implementationCosts: 0,
        setupDone: true,
        modifications: [
            {
                fsat: {
                    name: "Optimize Fan & Motor Combo",                    
                    whatIfScenario: true,
                    notes: {
                        fieldDataNotes: "",
                        fanMotorNotes: "",
                        fanSetupNotes: "",
                        fluidNotes: ""
                    },
                    baseGasDensity: {
                        inputType: "custom",
                        gasType: "AIR",
                        dryBulbTemp: null,
                        staticPressure: null,
                        barometricPressure: 29.36,
                        specificGravity: 1,
                        wetBulbTemp: 119,
                        relativeHumidity: 0,
                        dewPoint: 0,
                        gasDensity: 0.0308,
                        specificHeatGas: 0.24,
                        specificHeatRatio: 1.4,
                    },
                    fanMotor: {
                        lineFrequency: 60,
                        motorRatedPower: 600,
                        motorRpm: 1180,
                        efficiencyClass: 2,
                        specifiedEfficiency: 90,
                        motorRatedVoltage: 460,
                        fullLoadAmps: 683.25
                    },
                    fanSetup: {
                        fanType: 0,
                        fanEfficiency: 75.66,
                        fanSpeed: 1180,
                        drive: 1,
                        specifiedDriveEfficiency: 100
                    },
                    fsatOperations: {
                        operatingHours: 8760,
                        cost: 0.06,
                        cO2SavingsData: {
                            energyType: 'electricity',
                            energySource: '',
                            fuelType: '',
                            totalEmissionOutputRate: 401.07,
                            electricityUse: 0,
                            eGridRegion: '',
                            eGridSubregion: 'U.S. Average',
                            totalEmissionOutput: 0,
                            userEnteredBaselineEmissions: false,
                            userEnteredModificationEmissions: true,
                            zipcode: '00000',
                        },  
                    },                  
                    fieldData: {
                        flowRate: 129691,
                        inletPressure: -16.36,
                        inletVelocityPressure: -1.5,
                        usingStaticPressure: true,
                        outletPressure: 1.1,
                        loadEstimatedMethod: 0,
                        motorPower: 450,
                        compressibilityFactor: 0.988,
                        measuredVoltage: 460
                    }
                },
                exploreOpportunities: true
            },
            {
                fsat: {
                    name: "Reduce pressure & flow",
                    whatIfScenario: true,
                    notes: {
                        fieldDataNotes: "",
                        fanMotorNotes: "",
                        fanSetupNotes: "",
                        fluidNotes: ""
                    },
                    baseGasDensity: {
                        inputType: "custom",
                        gasType: "AIR",
                        dryBulbTemp: null,
                        staticPressure: null,
                        barometricPressure: 29.36,
                        specificGravity: 1,
                        wetBulbTemp: 119,
                        relativeHumidity: 0,
                        dewPoint: 0,
                        gasDensity: 0.0308,
                        specificHeatGas: 0.24,
                        specificHeatRatio: 1.4,
                    },
                    fanMotor: {
                        lineFrequency: 60,
                        motorRatedPower: 600,
                        motorRpm: 1180,
                        efficiencyClass: 1,
                        specifiedEfficiency: 90,
                        motorRatedVoltage: 460,
                        fullLoadAmps: 683.25
                    },
                    fanSetup: {
                        fanType: 12,
                        fanEfficiency: 73,
                        fanSpeed: 1180,
                        drive: 1,
                        specifiedDriveEfficiency: 100
                    },
                    fsatOperations: {
                        operatingHours: 8760,
                        cost: 0.06,
                        cO2SavingsData: {
                            energyType: 'electricity',
                            energySource: '',
                            fuelType: '',
                            totalEmissionOutputRate: 401.07,
                            electricityUse: 0,
                            eGridRegion: '',
                            eGridSubregion: 'U.S. Average',
                            totalEmissionOutput: 0,
                            userEnteredBaselineEmissions: false,
                            userEnteredModificationEmissions: true,
                            zipcode: '00000',
                        },  
                    },
                    fieldData: {
                        flowRate: 86461,
                        inletPressure: -19.19,
                        inletVelocityPressure: -3.5,
                        usingStaticPressure: true,
                        outletPressure: 1.29,
                        loadEstimatedMethod: 0,
                        motorPower: 450,
                        compressibilityFactor: 0.988,
                        measuredVoltage: 460
                    }
                },
                exploreOpportunities: true
            }
        ]
    }
};

export const MockFsatSettings: Settings = {
    language: "English",
    currency: "$",
    unitsOfMeasure: "Imperial",
    distanceMeasurement: "ft",
    flowMeasurement: "gpm",
    powerMeasurement: "hp",
    pressureMeasurement: "psi",
    steamPressureMeasurement: "kPag",
    steamTemperatureMeasurement: "C",
    steamSpecificEnthalpyMeasurement: "kJkg",
    steamSpecificEntropyMeasurement: "kJkgK",
    steamSpecificVolumeMeasurement: "m3kg",
    steamMassFlowMeasurement: "klb",
    currentMeasurement: null,
    viscosityMeasurement: null,
    voltageMeasurement: null,
    energySourceType: "Fuel",
    furnaceType: null,
    energyResultUnit: "MMBtu",
    customFurnaceName: null,
    temperatureMeasurement: "F",
    fanTemperatureMeasurement: "F",
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
    steamPowerMeasurement: "kW",
    steamEnergyMeasurement: "MMBtu",
    commonRollupUnit: "MMBtu",
    pumpsRollupUnit: "MWh",
    fansRollupUnit: "MWh",
    steamRollupUnit: "MMBtu",
    wasteWaterRollupUnit: "MWh",
    compressedAirRollupUnit: "MWh"
};

/*
calculators: [],
origin: "AMO-TOOLS-DESKTOP"
}
*/

export const MockFsatCalculator: Calculator = {
    systemAndEquipmentCurveData: {
        fanSystemCurveData: {
            compressibilityFactor: 0.988,
            systemLossExponent: 1.9,
            pointOneFlowRate: 0,
            pointOnePressure: 0,
            pointTwo: "Baseline",
            pointTwoFlowRate: 129691,
            pointTwoPressure: 17.46,
        },
        equipmentCurveFormView: 'Data',
        byEquationInputs: {
            maxFlow: 160000,
            equationOrder: 2,
            constant: 22.2128629162,
            flow: 0.0000164575,
            flowTwo: -6e-10,
            flowThree: 0,
            flowFour: 0,
            flowFive: 0,
            flowSix: 0,
            powerConstant: 0,
            powerOrder: 1,
            powerFlow: 0.0000164575,
            powerFlowTwo: -6e-10,
            powerFlowThree: 0,
            powerFlowFour: 0,
            powerFlowFive: 0,
            powerFlowSix: 0,
        },
        equipmentInputs: {
            measurementOption: 1,
            baselineMeasurement: 1800,
            modificationMeasurementOption: 1,
            modifiedMeasurement: 1800
        },
        byDataInputs: {
            dataRows: [
                {
                    yValue: 22.3,
                    flow: 28800,
                    power: 0
                },
                {
                    yValue: 21.8,
                    flow: 43200,
                    power: 0
                },
                {
                    yValue: 21.2,
                    flow: 57640,
                    power: 0
                },
                {
                    yValue: 20.3,
                    flow: 72050,
                    power: 0
                },
                {
                    yValue: 18,
                    flow: 100871,
                    power: 0
                },
                {
                    yValue: 14.8,
                    flow: 129700,
                    power: 0
                },
                {
                    yValue: 10.2,
                    flow: 158500,
                    power: 0
                }
            ],
            dataOrder: 2
        },
    }
};
