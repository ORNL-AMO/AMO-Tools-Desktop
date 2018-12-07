import { Assessment } from "../shared/models/assessment";
import { Settings } from "../shared/models/settings"
import { Calculator } from '../shared/models/calculators';

export const MockFsat: Assessment = {
    isExample: true,
    name: "Fan Example",
    type: "FSAT",
    fsat: {
        name: "Baseline",
        fieldData: {
            operatingHours: 8760,
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
                        fanSpeed: 1180,
                        drive: 1,
                        fanEfficiency: 63.38,
                    },
                    fieldData: {
                        operatingHours: 8760,
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
                        fullLoadAmps: 683.25
                    },
                    fanSetup: {
                        fanType: 12,
                        fanSpeed: 1180,
                        drive: 1,
                        fanEfficiency: 63.38,
                    },
                    fieldData: {
                        operatingHours: 8760,
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
                        fanType: 12,
                        fanSpeed: 1180,
                        drive: 0,
                        fanEfficiency: 63.38,
                    },
                    fieldData: {
                        operatingHours: 8760,
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
                    notes: {
                        fieldDataNotes: "",
                        fanMotorNotes: "",
                        fanSetupNotes: "",
                        fluidNotes: ""
                    },
                },
                exploreOpportunities: true
            },
            {
                fsat: {
                    name: "Reduce pressure & flow",
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
                        specificHeatGas: 0.24
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
                        fanSpeed: 1180,
                        drive: 1,
                        fanEfficiency: 73,
                        specifiedDriveEfficiency: 100
                    },
                    fieldData: {
                        operatingHours: 8760,
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
                    notes: {
                        fieldDataNotes: "",
                        fanMotorNotes: "",
                        fanSetupNotes: "",
                        fluidNotes: ""
                    },
                },
                exploreOpportunities: true
            }
        ],
    },
    selected: false
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
    directoryId: 2,
    assessmentId: 3,
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
    },
    steamPowerMeasurement: "MMBtu",
    steamEnergyMeasurement: "MMBtu"
}

export const MockFsatCalculators: Calculator = {
    pumpCurveForm: {
        dataRows: [
            {
                head: 22.3,
                flow: 28800
            },
            {
                head: 21.8,
                flow: 43200
            },
            {
                head: 21.2,
                flow: 57640
            },
            {
                head: 20.3,
                flow: 72050
            },
            {
                head: 18,
                flow: 100871
            },
            {
                head: 14.8,
                flow: 129700
            },
            {
                head: 10.2,
                flow: 158500
            }
        ],
        maxFlow: 160000,
        dataOrder: 2,
        baselineMeasurement: 1800,
        modifiedMeasurement: 1800,
        exploreLine: 0,
        exploreFlow: 0,
        exploreHead: 0,
        explorePumpEfficiency: 0,
        headOrder: 2,
        headConstant: 22.2128629162,
        headFlow: 0.0000164575,
        headFlow2: -6e-10,
        headFlow3: 0,
        headFlow4: 0,
        headFlow5: 0,
        headFlow6: 0,
        pumpEfficiencyOrder: 3,
        pumpEfficiencyConstant: 0,
        measurementOption: "Speed"
    },
    fan203Inputs: {
        FanRatedInfo: {
            fanSpeed: 1180,
            motorSpeed: 1180,
            fanSpeedCorrected: 1180,
            densityCorrected: 0.0765,
            pressureBarometricCorrected: 29.92,
            includesEvase: "Yes",
            upDownStream: "Upstream",
            traversePlanes: 1,
            globalBarometricPressure: 29.92
        },
        PlaneData: {
            plane5upstreamOfPlane2: true,
            totalPressureLossBtwnPlanes1and4: null,
            totalPressureLossBtwnPlanes2and5: null,
            inletSEF: null,
            outletSEF: null,
            estimate2and5TempFrom1: false,
            FanInletFlange: {
                planeType: "Rectangular",
                width: null,
                length: null,
                area: 0,
                dryBulbTemp: null,
                barometricPressure: null,
                numInletBoxes: null,
                staticPressure: null
            },
            FanEvaseOrOutletFlange: {
                planeType: "Rectangular",
                width: null,
                length: null,
                area: 0,
                dryBulbTemp: null,
                barometricPressure: null,
                numInletBoxes: 0,
                staticPressure: null
            },
            FlowTraverse: {
                planeType: "Rectangular",
                width: 68,
                length: 72,
                area: 34,
                dryBulbTemp: null,
                barometricPressure: 29.92,
                numInletBoxes: 0,
                staticPressure: null,
                pitotTubeCoefficient: 1,
                pitotTubeType: "Standard",
                numTraverseHoles: 10,
                numInsertionPoints: 3,
                traverseData: [
                    [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                ]
            },
            AddlTraversePlanes: [],
            InletMstPlane: {
                planeType: "Rectangular",
                area: 34,
                width: 68,
                length: 72,
                dryBulbTemp: 68,
                barometricPressure: 29.92,
                staticPressure: null,
                numInletBoxes: 1
            },
            OutletMstPlane: {
                planeType: "Rectangular",
                area: 0,
                width: null,
                length: null,
                dryBulbTemp: null,
                barometricPressure: 29.92,
                staticPressure: null,
                numInletBoxes: null
            }
        },
        BaseGasDensity: {
            barometricPressure: 29.92,
            gasDensity: 0.0765,
            gasType: "AIR",
            inputType: "custom",
            specificHeatGas: 0.24
        },
        FanShaftPower: {
            isMethodOne: false,
            powerFactorAtLoad: 0.99,
            efficiencyVFD: 100,
            efficiencyBelt: 100,
            sumSEF: 0,
            mainsDataAvailable: "Yes",
            isVFD: "No",
            ratedHP: 200,
            phase1: null,
            phase2: null,
            phase3: null,
            driveType: "Direct Drive",
            efficiencyClass: 1,
            frequency: 60,
            voltage: null,
            amps: null,
            efficiencyMotor: null,
            motorShaftPower: null,
            synchronousSpeed: null,
            npv: null,
            fla: null
        }
    },
    systemCurve: {
        specificGravity: 0.988,
        systemLossExponent: 1.9,
        dataPoints: [
            {
                modName: "Baseline1",
                flowRate: 0,
                head: 0
            },
            {
                modName: "Baseline",
                flowRate: 129691,
                head: 17.46
            },
            {
                modName: "Optimize Fan & Motor Combo1",
                flowRate: 0,
                head: 0
            },
            {
                modName: "Optimize Fan & Motor Combo",
                flowRate: 129691,
                head: 17.46
            },
            {
                modName: "Reduce pressure & flow1",
                flowRate: 0,
                head: 0
            },
            {
                modName: "Reduce pressure & flow",
                flowRate: 86461,
                head: 20.48
            }
        ],
        selectedP1Name: "Baseline1",
        selectedP2Name: "Baseline"
    }
}
/*
calculators: [],
origin: "AMO-TOOLS-DESKTOP"
}
*/