import { Assessment } from "../shared/models/assessment";
import { Calculator } from "../shared/models/calculators";
import { Settings } from "../shared/models/settings";

export const MockPsat: Assessment = {
    name: "Basic Pump Example",
    type: "PSAT",
    appVersion: "0.3.2-beta",
    isExample: true,
    psat: {
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
            load_estimation_method: 1,
            motor_rated_fla: 172.64,
            margin: 0,
            operating_hours: 8760,
            flow_rate: 2500,
            head: 137,
            motor_field_power: 88.2,
            motor_field_current: 130.3,
            motor_field_voltage: 460,
            cost_kw_hour: 0.066,
            fluidType: "Water",
            fluidTemperature: 68,
            specifiedDriveEfficiency: null,
            implementationCosts: null
        },
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
                        load_estimation_method: 1,
                        motor_rated_fla: 168.61,
                        margin: 0,
                        operating_hours: 8760,
                        flow_rate: 2499.99,
                        head: 137.01,
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
                        pump_efficiency: 87.52,
                        motor_rated_power: 150.01,
                        motor_shaft_power: 103.21,
                        pump_shaft_power: 98.99,
                        motor_efficiency: 96.35,
                        motor_power_factor: 83.43,
                        motor_current: 120.23,
                        motor_power: 79.91,
                        annual_energy: 700.05,
                        annual_cost: 46203.14,
                        annual_savings_potential: 0,
                        optimization_rating: 0
                    }
                },
                notes: {
                    fieldDataNotes: "",
                    motorNotes: "",
                    pumpFluidNotes: "",
                    systemBasicsNotes: ""
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
                        load_estimation_method: 1,
                        motor_rated_fla: 172.63,
                        margin: 0,
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
                        annual_energy: 171.21,
                        annual_cost: 11299.56,
                        annual_savings_potential: 0,
                        optimization_rating: 0
                    }
                },
                notes: {
                    fieldDataNotes: "",
                    motorNotes: "",
                    pumpFluidNotes: "",
                    systemBasicsNotes: ""
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
                        load_estimation_method: 1,
                        motor_rated_fla: 172.63,
                        margin: 0,
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
                        annual_energy: 184.96,
                        annual_cost: 12207.29,
                        annual_savings_potential: 0,
                        optimization_rating: 0
                    }
                },
                notes: {
                    fieldDataNotes: "",
                    motorNotes: "",
                    pumpFluidNotes: "",
                    systemBasicsNotes: ""
                }
            },
            {
                psat: {
                    name: "New",
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
                        load_estimation_method: 1,
                        motor_rated_fla: 168.62,
                        margin: 0,
                        operating_hours: 8760,
                        flow_rate: 2500,
                        head: 137,
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
                        pump_efficiency: 87.52,
                        motor_rated_power: 150.01,
                        motor_shaft_power: 103.2,
                        pump_shaft_power: 98.99,
                        motor_efficiency: 96.35,
                        motor_power_factor: 83.42,
                        motor_current: 120.22,
                        motor_power: 79.91,
                        annual_energy: 700,
                        annual_cost: 46199.95,
                        annual_savings_potential: 0,
                        optimization_rating: 0
                    }
                },
                notes: {
                    fieldDataNotes: "",
                    motorNotes: "",
                    pumpFluidNotes: "",
                    systemBasicsNotes: ""
                },
                exploreOpportunities: true
            }
        ],
        name: "Baseline",
        setupDone: true,
        outputs: {
            pump_efficiency: 81.81,
            motor_rated_power: 150,
            motor_shaft_power: 110.39,
            pump_shaft_power: 105.9,
            motor_efficiency: 93.36,
            motor_power_factor: 84.97,
            motor_current: 130.3,
            motor_power: 88.21,
            annual_energy: 772.7,
            annual_cost: 50998.15,
            annual_savings_potential: 0,
            optimization_rating: 0,
            percent_annual_savings: 0
        }
    }
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
    steamPressureMeasurement: "psig",
    steamSpecificEnthalpyMeasurement: "btuLb",
    steamSpecificEntropyMeasurement: "btulbF",
    steamSpecificVolumeMeasurement: "ft3lb",
    steamMassFlowMeasurement: "klb",
    steamPowerMeasurement: "kW",
    currentMeasurement: null,
    viscosityMeasurement: null,
    voltageMeasurement: null,
    furnaceType: null,
    customFurnaceName: null,
    appVersion: "0.3.1-beta",
    fanCurveType: null,
    fanConvertedConditions: null,
    phastRollupUnit: "MMBtu",
    phastRollupFuelUnit: "MMBtu",
    phastRollupElectricityUnit: "MMBtu",
    phastRollupSteamUnit: "MMBtu",
    defaultPanelTab: "help",
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
    pumpCurve: {
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
                flowRate: 2499.99,
                head: 137.01
            },
            {
                modName: "Reduce speed to 60% with Static head1",
                flowRate: 0,
                head: 0
            },
            {
                modName: "Reduce speed to 60% with Static head",
                flowRate: 842,
                head: 63
            },
            {
                modName: "Reduce speed to 60%1",
                flowRate: 0,
                head: 0
            },
            {
                modName: "Reduce speed to 60%",
                flowRate: 1475,
                head: 50
            },
            {
                modName: "New1",
                flowRate: 0,
                head: 0
            },
            {
                modName: "New",
                flowRate: 2500,
                head: 137
            }
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
