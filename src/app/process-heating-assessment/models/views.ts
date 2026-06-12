export const MainView = {
  BASELINE: 'baseline',
  ASSESSMENT: 'assessment',
  REPORT: 'report',
} as const;
export type MainView = typeof MainView[keyof typeof MainView];

export const BaselineView = {
  SYSTEM_BASICS: 'system-basics',
  HEAT_BALANCE: 'heat-balance',
  AUXILIARY_EQUIPMENT: 'auxiliary-equipment',
  DESIGNED_ENERGY: 'designed-energy',
  METERED_ENERGY: 'metered-energy',
} as const;
export type BaselineView = typeof BaselineView[keyof typeof BaselineView];

export const AssessmentView = {
  EXPLORE_OPPORTUNITIES: 'explore-opportunities',
} as const;
export type AssessmentView = typeof AssessmentView[keyof typeof AssessmentView];

export const ReportView = {
  EXECUTIVE_SUMMARY: 'executive-summary',
  INPUT_SUMMARY: 'input-summary',
  FACILITY_INFO: 'facility-info',
} as const;
export type ReportView = typeof ReportView[keyof typeof ReportView];

export const LossView = {
  CHARGE_MATERIAL: 'charge-material',
  WALL_LOSSES: 'wall-losses',
  EXTENDED_SURFACE: 'extended-surface',
  ATMOSPHERE: 'atmosphere',
  FIXTURE: 'fixture',
  COOLING: 'cooling',
  OPENING: 'opening',
  OTHER: 'other',
  FLUE_GAS: 'flue-gas',
  GAS_LEAKAGE: 'gas-leakage',
  AUXILIARY_POWER: 'auxiliary-power',
  ENERGY_INPUT_EXHAUST_GAS: 'energy-input-exhaust-gas',
  ENERGY_INPUT: 'energy-input',
  EXHAUST_GAS: 'exhaust-gas',
  SLAG: 'slag',
  HEAT_SYSTEM_EFFICIENCY: 'heat-system-efficiency',
} as const;
export type LossView = typeof LossView[keyof typeof LossView];

export type ProcessHeatingView = MainView | BaselineView | AssessmentView | ReportView | LossView;

export const HeatingEquipmentConfiguration = {
  FUEL_FIRED: 'fuel-fired',
  ELECTROTECHNOLOGY_STANDARD: 'electrotechnology-standard',
  ELECTROTECHNOLOGY_EAF: 'electrotechnology-eaf',
  CUSTOM_ELECTROTECHNOLOGY: 'custom-electrotechnology',
  STEAM: 'steam',
} as const;
export type HeatingEquipmentConfiguration = typeof HeatingEquipmentConfiguration[keyof typeof HeatingEquipmentConfiguration];

export interface ViewLink {
  view: ProcessHeatingView;
  label: string;
  meta?: { disabled?: boolean };
}

export const MAIN_VIEW_LINKS: ViewLink[] = [
  { view: MainView.BASELINE, label: 'Baseline' },
  { view: MainView.ASSESSMENT, label: 'Assessment' },
  { view: MainView.REPORT, label: 'Report' },
];

export const BASELINE_VIEW_LINKS: ViewLink[] = [
  { view: BaselineView.SYSTEM_BASICS, label: 'System Basics' },
  { view: BaselineView.HEAT_BALANCE, label: 'Heat Balance' },
  { view: BaselineView.AUXILIARY_EQUIPMENT, label: 'Auxiliary Equipment' },
  { view: BaselineView.DESIGNED_ENERGY, label: 'Designed Energy' },
  { view: BaselineView.METERED_ENERGY, label: 'Metered Energy' },
];

export const HEAT_BALANCE_VIEW_LINKS: ViewLink[] = [
  { view: LossView.CHARGE_MATERIAL, label: 'Charge Material' },
  { view: LossView.WALL_LOSSES, label: 'Wall Losses' },
  { view: LossView.EXTENDED_SURFACE, label: 'Extended Surface' },
  { view: LossView.ATMOSPHERE, label: 'Atmosphere' },
  { view: LossView.FIXTURE, label: 'Fixture' },
  { view: LossView.COOLING, label: 'Cooling' },
  { view: LossView.OPENING, label: 'Opening' },
  { view: LossView.OTHER, label: 'Other' },
  { view: LossView.FLUE_GAS, label: 'Flue Gas' },
  { view: LossView.GAS_LEAKAGE, label: 'Gas Leakage' },
  { view: LossView.AUXILIARY_POWER, label: 'Auxiliary Power' },
  { view: LossView.ENERGY_INPUT_EXHAUST_GAS, label: 'Energy Input Exhaust Gas' },
  { view: LossView.ENERGY_INPUT, label: 'Energy Input' },
  { view: LossView.EXHAUST_GAS, label: 'Exhaust Gas' },
  { view: LossView.SLAG, label: 'Slag' },
  { view: LossView.HEAT_SYSTEM_EFFICIENCY, label: 'Heat System Efficiency' },
];

export const REPORT_VIEW_LINKS: ViewLink[] = [
  { view: ReportView.EXECUTIVE_SUMMARY, label: 'Executive Summary' },
  { view: ReportView.INPUT_SUMMARY, label: 'Input Summary' },
  { view: ReportView.FACILITY_INFO, label: 'Facility Info' },
];
