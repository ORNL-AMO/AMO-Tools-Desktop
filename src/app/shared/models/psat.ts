import { OperatingHours } from "./operations";
import { SavingsOpportunity } from "./explore-opps";
import { Co2SavingsData } from "../../calculator/utilities/co2-savings/co2-savings.service";
import { ConnectedItem } from "../assessment-integration/integrations";

export interface PSAT {
  inputs?: PsatInputs;
  outputs?: PsatOutputs;
  modifications?: Modification[];
  selected?: boolean;
  name?: string;
  savings?: number;
  optimizationRating?: number;
  setupDone?: boolean;
  operatingHours?: OperatingHours;
  connectedItem?: ConnectedItem,
  valid?: PsatValid;
  existingDataUnits?: string;
}

export interface PsatValid {
  isValid: boolean,
  pumpFluidValid: boolean,
  motorValid: boolean,
  fieldDataValid: boolean
};

export interface PsatInputs {
  pump_style?: number;
  pump_specified?: number;
  pump_rated_speed?: number;
  drive?: number;
  specifiedDriveEfficiency?: number;
  kinematic_viscosity?: number;
  specific_gravity?: number;
  stages?: number;
  fixed_speed?: number;
  line_frequency?: number;
  motor_rated_power?: number;
  motor_rated_speed?: number;
  efficiency_class?: number;
  efficiency?: number;
  motor_rated_voltage?: number;
  load_estimation_method?: number;
  motor_rated_fla?: number;
  margin?: number;
  //TODO: remove operatingFraction support
  //removed from suit v0.3.2
  operating_fraction?: number;
  operating_hours: number;
  flow_rate?: number;
  head?: number;
  motor_field_power?: number;
  motor_field_current?: number;
  motor_field_voltage?: number;
  cost_kw_hour?: number;
  load_factor?: number;
  // optimize_calculation?: boolean,
  implementationCosts?: number;
  isVFD?: boolean;
  fluidType: string;
  fluidTemperature: number;
  useCustomEfficiency?: boolean;  
  whatIfScenario?: boolean;
  co2SavingsData?: Co2SavingsData;
}

export interface PsatOutputs {
  pump_efficiency?: number;
  motor_rated_power?: number;
  motor_shaft_power?: number;
  pump_shaft_power?: number;
  motor_efficiency?: number;
  motor_power_factor?: number;
  motor_current?: number;
  motor_power?: number;
  load_factor?: number;
  drive_efficiency?: number;
  annual_energy?: number;
  annual_cost?: number;
  annual_savings_potential?: number;
  optimization_rating?: number;
  percent_annual_savings?: number;
  co2EmissionsOutput?: number;
}

export interface PsatOutputsExistingOptimal {
  existing: PsatOutputs;
  optimal: PsatOutputs;
}

export interface PsatCalcResults {
  pump_efficiency?: number[];
  motor_rated_power?: number[];
  motor_shaft_power?: number[];
  pump_shaft_power?: number[];
  motor_efficiency?: number[];
  motor_power_factor?: number[];
  motor_current?: number[];
  motor_power?: number[];
  load_factor?: number[];
  drive_efficiency?: number[];
  annual_energy?: number[];
  annual_cost?: number[];
  annual_savings_potential?: number[];
  optimization_rating?: number[];
}

export interface Modification {
  notes?: Notes;
  psat?: PSAT;
  exploreOpportunities?: boolean;
  exploreOppsShowVfd?: SavingsOpportunity,
  exploreOppsShowMotorDrive?: SavingsOpportunity;
  exploreOppsShowPumpType?: SavingsOpportunity;
  exploreOppsShowRatedMotorData?: SavingsOpportunity;
  exploreOppsShowSystemData?: SavingsOpportunity;
  exploreOppsShowFlowRate?: SavingsOpportunity;
  exploreOppsShowHead?: SavingsOpportunity;
}


export interface Notes {
  systemBasicsNotes?: string;
  pumpFluidNotes?: string;
  motorNotes?: string;
  fieldDataNotes?: string;
}

export interface FluidProperties {
  density: number;
  beta: number;
  tref: number;
  kinViscosity: number;
  boiling: number;
  melting: number;
}


export interface ExploreOpportunitiesResults {
  baselineResults: PsatOutputs, 
  modificationResults: PsatOutputs, 
  annualSavings: number, 
  co2EmissionsSavings: number,
  percentSavings: number 
}