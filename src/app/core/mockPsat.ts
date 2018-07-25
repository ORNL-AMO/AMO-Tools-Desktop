import { Assessment } from "../shared/models/assessment";
import { Calculator } from "../shared/models/calculators";
import { Settings } from "../shared/models/settings";

export const MockPsat: Assessment = {
    name: "Example Pump",
    type: "PSAT",
    psat: {
        name: "Baseline",
        inputs: {
            pump_style: 6,
            pump_specified: null,
            pump_rated_speed: 1780,
            drive: 1,
            kinematic_viscosity: 1.107,
            specific_gravity: 1.002,
            stages: 2,
            fixed_speed: 1,
            line_frequency: 0,
            motor_rated_power: 200,
            motor_rated_speed: 1780,
            efficiency_class: 0,
            efficiency: 93,
            motor_rated_voltage: 460,
            load_estimation_method: 0,
            motor_rated_fla: 228.57,
            margin: 0,
            operating_fraction: 1,
            flow_rate: 1840,
            head: 174.85,
            motor_field_power: 80,
            motor_field_current: null,
            motor_field_voltage: 480,
            cost_kw_hour: 0.05,
            cost: 0.05,
            optimize_calculation: false,
            implementationCosts: null,
            fluidType: "Water",
            fluidTemperature: 68
        },
        setupDone: true,
        modifications: [
            {
                psat: {
                    name: "Improve Belt, Motor and Pump Eff",
                    inputs: {
                        pump_style: 11,
                        pump_specified: 90,
                        pump_rated_speed: 1780,
                        drive: 1,
                        kinematic_viscosity: 1.107,
                        specific_gravity: 1.002,
                        stages: 2,
                        fixed_speed: 1,
                        line_frequency: 0,
                        motor_rated_power: 200,
                        motor_rated_speed: 1780,
                        efficiency_class: 2,
                        efficiency: 95,
                        motor_rated_voltage: 460,
                        load_estimation_method: 0,
                        motor_rated_fla: 224,
                        margin: 0,
                        operating_fraction: 1,
                        flow_rate: 1840,
                        head: 174.85,
                        motor_field_power: 80,
                        motor_field_current: null,
                        motor_field_voltage: 480,
                        cost_kw_hour: 0.05,
                        cost: 0.05,
                        optimize_calculation: false,
                        implementationCosts: null,
                        fluidType: "Water",
                        fluidTemperature: 68
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
                    name: "PSAT Optimization",
                    inputs: {
                        pump_style: 6,
                        pump_specified: null,
                        pump_rated_speed: 1780,
                        drive: 1,
                        kinematic_viscosity: 1.107,
                        specific_gravity: 1.002,
                        stages: 2,
                        fixed_speed: 1,
                        line_frequency: 0,
                        motor_rated_power: 200,
                        motor_rated_speed: 1780,
                        efficiency_class: 0,
                        efficiency: 95,
                        motor_rated_voltage: 460,
                        load_estimation_method: 0,
                        motor_rated_fla: 228.57,
                        margin: 0,
                        operating_fraction: 1,
                        flow_rate: 1840,
                        head: 174.85,
                        motor_field_power: 80,
                        motor_field_current: null,
                        motor_field_voltage: 480,
                        cost_kw_hour: 0.05,
                        cost: 0.05,
                        optimize_calculation: false,
                        implementationCosts: null,
                        fluidType: "Water",
                        fluidTemperature: 68
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
                    name: "Adjust Fluid Temperature",
                    inputs: {
                        pump_style: 6,
                        pump_specified: null,
                        pump_rated_speed: 1780,
                        drive: 1,
                        kinematic_viscosity: 0.891,
                        specific_gravity: 0.991,
                        stages: 2,
                        fixed_speed: 1,
                        line_frequency: 0,
                        motor_rated_power: 200,
                        motor_rated_speed: 1780,
                        efficiency_class: 0,
                        efficiency: 95,
                        motor_rated_voltage: 460,
                        load_estimation_method: 0,
                        motor_rated_fla: 228.57,
                        margin: 0,
                        operating_fraction: 1,
                        flow_rate: 1840,
                        head: 174.85,
                        motor_field_power: 80,
                        motor_field_current: null,
                        motor_field_voltage: 480,
                        cost_kw_hour: 0.05,
                        cost: 0.05,
                        optimize_calculation: false,
                        implementationCosts: null,
                        fluidType: "Water",
                        fluidTemperature: 100
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
                        pump_style: 6,
                        pump_specified: null,
                        pump_rated_speed: 1780,
                        drive: 0,
                        kinematic_viscosity: 1.107,
                        specific_gravity: 1.002,
                        stages: 2,
                        fixed_speed: 0,
                        line_frequency: 0,
                        motor_rated_power: 200,
                        motor_rated_speed: 1780,
                        efficiency_class: 0,
                        efficiency: 95,
                        motor_rated_voltage: 460,
                        load_estimation_method: 0,
                        motor_rated_fla: 225,
                        margin: 0,
                        operating_fraction: 1,
                        flow_rate: 1840,
                        head: 174.85,
                        motor_field_power: 80,
                        motor_field_current: null,
                        motor_field_voltage: 480,
                        cost_kw_hour: 0.05,
                        cost: 0.05,
                        fluidType: "Water",
                        fluidTemperature: 68,
                        optimize_calculation: true
                    },
                    name: "Opportunities Modification"
                },
                exploreOpportunities: true
            }
        ]
    },
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
    energySourceType: "Fuel",
    energyResultUnit: "MMBtu",
    temperatureMeasurement: "F",
    steamTemperatureMeasurement: "F",
    steamPressureMeasurement: "psi",
    steamSpecificEnthalpyMeasurement: "btuLb",
    steamSpecificEntropyMeasurement: "btulbF",
    steamSpecificVolumeMeasurement: "ft3lb",
    steamMassFlowMeasurement: "klb",
    fuelCost: 3.99,
    steamCost: 4.69,
    defaultPanelTab: 'help',
    phastRollupFuelUnit: 'MMBtu',
    phastRollupElectricityUnit: 'kWh',
    phastRollupSteamUnit: 'MMBtu',
    phastRollupUnit: 'MMBtu',
    electricityCost: 0.066,
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

export const MockPsatCalculator: Calculator = {

    assessmentId: 1,
    pumpCurveForm: {
        dataRows: [
            {
                flow: 0,
                head: 355
            },
            {
                flow: 100,
                head: 351
            },
            {
                flow: 630,
                head: 294
            },
            {
                flow: 1020,
                head: 202
            }
        ],
        maxFlow: 1020,
        dataOrder: 3,
        baselineMeasurement: 1,
        modifiedMeasurement: 1,
        exploreLine: 0,
        exploreFlow: 0,
        exploreHead: 0,
        explorePumpEfficiency: 0,
        headOrder: 3,
        headConstant: 356.96,
        headFlow: -0.0686,
        headFlow2: 0.000005,
        headFlow3: -8e-8,
        headFlow4: 0,
        headFlow5: 0,
        headFlow6: 0,
        pumpEfficiencyOrder: 3,
        pumpEfficiencyConstant: 0,
        measurementOption: "Diameter"
    }
}
