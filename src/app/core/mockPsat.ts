import { Assessment } from "../shared/models/assessment";
import { Calculator } from "../shared/models/calculators";
import { Settings } from "../shared/models/settings";

export const MockPsat: Assessment = {
    isExample: true,
    name: "Basic Pump Example",
    type: "PSAT",
    appVersion: "0.3.1-beta",
    psat: {
        name: "Baseline",
        inputs: {
            pump_style: 6,
            pump_specified: null,
            pump_rated_speed: 1785,
            drive: 1,
            kinematic_viscosity: 1.107,
            specific_gravity: 1.002,
            stages: 1,
            fixed_speed: 0,
            line_frequency: 60,
            motor_rated_power: 150.01,
            motor_rated_speed: 1785,
            efficiency_class: 0,
            efficiency: 95,
            motor_rated_voltage: 460,
            load_estimation_method: 0,
            motor_rated_fla: 228.57,
            operating_hours: 8760,
            flow_rate: 2500,
            head: 137,
            motor_field_power: 88.2,
            motor_field_current: 130.3,
            motor_field_voltage: 460,
            cost_kw_hour: 0.066,
            implementationCosts: null,
            specifiedDriveEfficiency: null,
            fluidType: "Water",
            fluidTemperature: 68
        },
        setupDone: true,
        modifications: [
            {
                psat: {
                    name: "Optimize Pump & Motor Combo",
                    inputs: {
                        pump_style: 6,
                        pump_specified: 87.52,
                        pump_rated_speed: 1785,
                        drive: 1,
                        kinematic_viscosity: 1.107,
                        specific_gravity: 1.002,
                        stages: 1,
                        fixed_speed: 0,
                        line_frequency: 60,
                        motor_rated_power: 150.01,
                        motor_rated_speed: 1785,
                        efficiency_class: 2,
                        efficiency: 95,
                        motor_rated_voltage: 460,
                        load_estimation_method: 0,
                        motor_rated_fla: 224,
                        operating_hours: 8760,
                        flow_rate: 2499.99,
                        head: 137.01,
                        motor_field_power: 88.2,
                        motor_field_current: 130.3,
                        motor_field_voltage: 460,
                        cost_kw_hour: 0.066,
                        specifiedDriveEfficiency: null,
                        implementationCosts: null,
                        fluidType: "Water",
                        fluidTemperature: 68
                    },
                    outputs: {
                        pump_efficiency: 87.52,
                        motor_rated_power: 150.01,
                        motor_shaft_power: 103.21,
                        pump_shaft_power: 98.99,
                        motor_efficiency: 96.35,
                        motor_power_factor: 83.43,
                        motor_current: 120.23,
                        motor_power: 79.91,
                        load_factor: 0.69,
                        drive_efficiency: 95.91,
                        annual_energy: 700.05,
                        annual_cost: 46203.14,
                        annual_savings_potential: 0,
                        optimization_rating: 0
                    }
                },
                notes: {
                    systemBasicsNotes: '',
                    pumpFluidNotes: '',
                    motorNotes: '',
                    fieldDataNotes: ''
                }
            },
            {
                psat: {
                    name: "Reduce speed to 60% with Static head",
                    inputs: {
                        pump_style: 11,
                        pump_specified: 64.4,
                        pump_rated_speed: 1785,
                        drive: 1,
                        kinematic_viscosity: 1.107,
                        specific_gravity: 1.002,
                        stages: 1,
                        fixed_speed: 0,
                        line_frequency: 60,
                        motor_rated_power: 150.01,
                        motor_rated_speed: 1785,
                        efficiency_class: 0,
                        efficiency: 95,
                        motor_rated_voltage: 460,
                        load_estimation_method: 0,
                        motor_rated_fla: 228.57,
                        operating_hours: 8760,
                        flow_rate: 842,
                        head: 63,
                        motor_field_power: 88.2,
                        motor_field_current: 130.3,
                        motor_field_voltage: 460,
                        cost_kw_hour: 0.066,
                        fluidType: "Water",
                        fluidTemperature: 68,
                        specifiedDriveEfficiency: null,
                        implementationCosts: null
                    },
                    outputs: {
                        pump_efficiency: 64.4,
                        motor_rated_power: 150.01,
                        motor_shaft_power: 21.81,
                        pump_shaft_power: 20.83,
                        motor_efficiency: 83.24,
                        motor_power_factor: 44.67,
                        motor_current: 54.92,
                        motor_power: 19.54,
                        load_factor: 0.15,
                        drive_efficiency: 95.52,
                        annual_energy: 171.21,
                        annual_cost: 11299.56,
                        annual_savings_potential: 0,
                        optimization_rating: 0
                    }
                },
                notes: {
                    systemBasicsNotes: '',
                    pumpFluidNotes: '',
                    motorNotes: '',
                    fieldDataNotes: ''
                }
            },
            {
                psat: {
                    name: "Reduce speed to 60%",
                    inputs: {
                        pump_style: 11,
                        pump_specified: 81.81,
                        pump_rated_speed: 1785,
                        drive: 1,
                        kinematic_viscosity: 1.107,
                        specific_gravity: 1.002,
                        stages: 1,
                        fixed_speed: 0,
                        line_frequency: 60,
                        motor_rated_power: 150.01,
                        motor_rated_speed: 1785,
                        efficiency_class: 0,
                        efficiency: 95,
                        motor_rated_voltage: 460,
                        load_estimation_method: 0,
                        motor_rated_fla: 228.57,
                        operating_hours: 8760,
                        flow_rate: 1475,
                        head: 50,
                        motor_field_power: 88.2,
                        motor_field_current: 130.3,
                        motor_field_voltage: 460,
                        cost_kw_hour: 0.066,
                        fluidType: "Water",
                        fluidTemperature: 68,
                        specifiedDriveEfficiency: null,
                        implementationCosts: null
                    },
                    outputs: {
                        pump_efficiency: 81.81,
                        motor_rated_power: 150.01,
                        motor_shaft_power: 23.86,
                        pump_shaft_power: 22.8,
                        motor_efficiency: 84.31,
                        motor_power_factor: 47.47,
                        motor_current: 55.82,
                        motor_power: 21.11,
                        load_factor: 0.16,
                        drive_efficiency: 95.55,
                        annual_energy: 184.96,
                        annual_cost: 12207.29,
                        annual_savings_potential: 0,
                        optimization_rating: 0
                    }
                },
                notes: {
                    systemBasicsNotes: '',
                    pumpFluidNotes: '',
                    motorNotes: '',
                    fieldDataNotes: ''
                }
            },
            {
                notes: {
                    systemBasicsNotes: '',
                    pumpFluidNotes: '',
                    motorNotes: '',
                    fieldDataNotes: ''
                },
                psat: {
                    inputs: {
                        pump_style: 11,
                        pump_specified: 85.2,
                        pump_rated_speed: 1780,
                        drive: 0,
                        kinematic_viscosity: 1.107,
                        specific_gravity: 1.002,
                        stages: 2,
                        fixed_speed: 0,
                        line_frequency: 50,
                        motor_rated_power: 200,
                        motor_rated_speed: 1780,
                        efficiency_class: 0,
                        efficiency: 93,
                        motor_rated_voltage: 460,
                        load_estimation_method: 0,
                        motor_rated_fla: 225,
                        operating_hours: 8760,
                        flow_rate: 1840,
                        head: 174.85,
                        motor_field_power: 80,
                        motor_field_current: null,
                        motor_field_voltage: 480,
                        cost_kw_hour: 0.05,
                        cost: 0.05,
                        fluidType: "Water",
                        fluidTemperature: 68
                    },
                    name: "Opportunities Modification"
                },
                exploreOpportunities: true
            }
        ]
    },
    selected: false,
    directoryId: 2,
}

export const MockPsatSettings: Settings = {
    language: "English",
    currency: "$ - US Dollar",
    unitsOfMeasure: "Imperial",
    distanceMeasurement: "ft",
    flowMeasurement: "gpm",
    powerMeasurement: "hp",
    pressureMeasurement: "psi",
    steamPressureMeasurement: "psi",
    steamTemperatureMeasurement: "F",
    steamSpecificEnthalpyMeasurement: "btuLb",
    steamSpecificEntropyMeasurement: "btulbF",
    steamSpecificVolumeMeasurement: "ft3lb",
    steamMassFlowMeasurement: "klb",
    steamPowerMeasurement: "MMBtu",
    currentMeasurement: null,
    viscosityMeasurement: null,
    voltageMeasurement: null,
    energySourceType: "Fuel",
    furnaceType: null,
    energyResultUnit: "MMBtu",
    customFurnaceName: null,
    temperatureMeasurement: "F",
    appVersion: "0.3.1-beta",
    fanCurveType: null,
    fanConvertedConditions: null,
    phastRollupUnit: 'MMBtu',
    phastRollupFuelUnit: 'MMBtu',
    phastRollupElectricityUnit: 'kWh',
    phastRollupSteamUnit: 'MMBtu',
    defaultPanelTab: 'help',
    fuelCost: 3.99,
    steamCost: 4.69,
    electricityCost: 0.066,
    densityMeasurement: "lbscf",
    fanFlowRate: "ft3/min",
    fanPressureMeasurement: "inH2o",
    fanBarometricPressure: "inHg",
    fanSpecificHeatGas: "btulbF",
    fanPowerMeasurement: "hp",
    fanTemperatureMeasurement: "F",
    steamEnergyMeasurement: "MMBtu",
    disableTutorial: false,
    disableDashboardTutorial: false,
    disablePsatSetupTutorial: false,
    disablePsatAssessmentTutorial: false,
    disablePsatReportTutorial: false,
    disablePhastSetupTutorial: false,
    disablePhastAssessmentTutorial: false,
    disablePhastReportTutorial: false,
    disableFsatSetupTutorial: false,
    disableFsatAssessmentTutorial: false,
    disableFsatReportTutorial: false,
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
    }
}

export const MockPsatCalculator: Calculator = {
    pumpCurveForm: {
        dataRows: [
            {
                flow: 0,
                head: 245
            },
            {
                head: 213,
                flow: 500
            },
            {
                head: 190,
                flow: 1000
            },
            {
                head: 173.1,
                flow: 1500
            },
            {
                head: 156.6,
                flow: 2000
            },
            {
                head: 136.9,
                flow: 2500
            },
            {
                head: 109.7,
                flow: 3000
            },
            {
                head: 91.9,
                flow: 3250
            }
        ],
        maxFlow: 3250,
        dataOrder: 3,
        baselineMeasurement: 1785,
        modifiedMeasurement: 1071,
        exploreLine: 0,
        exploreFlow: 0,
        exploreHead: 0,
        explorePumpEfficiency: 0,
        headOrder: 3,
        headConstant: 245.03015298,
        headFlow: -0.0767853775,
        headFlow2: 0.0000277329,
        headFlow3: -5.7e-9,
        headFlow4: 0,
        headFlow5: 0,
        headFlow6: 0,
        pumpEfficiencyOrder: 3,
        pumpEfficiencyConstant: 0,
        measurementOption: "Speed"
    },
    systemCurve: {
        specificGravity: 1.002,
        systemLossExponent: 1.9,
        dataPoints: [
            {
                modName: "Baseline1",
                flowRate: 0,
                head: 50
            },
            {
                modName: "Baseline",
                flowRate: 3250,
                head: 225
            },
            {
                modName: "Optimize Pump & Motor Combo1",
                flowRate: 0,
                head: 0
            },
            {
                modName: "Optimize Pump & Motor Combo",
                flowRate: 2500,
                head: 137
            },
            {
                modName: "Reduce Pump Speed to 80%1",
                flowRate: 0,
                head: 0
            },
            {
                modName: "Reduce Pump Speed to 80%",
                flowRate: 2000,
                head: 87.6
            },
        ],
        selectedP1Name: "Baseline1",
        selectedP2Name: "Baseline"
    },
    motorPerformanceInputs: {
        frequency: 50,
        horsePower: 150.01,
        motorRPM: 1785,
        efficiencyClass: 0,
        motorVoltage: 460,
        fullLoadAmps: 172.64,
        sizeMargin: 0,
        efficiency: 95
    }
}
