export type ProcessCoolingMainTabString = 'baseline' | 'assessment' | 'diagram' | 'report' | 'calculators';
export type ProcessCoolingSetupTabString = 'assessment-settings' | 'system-information' | 'inventory' | 'operating-schedule' | 'load-schedule';
export type ProcessCoolingAssessmentTabString = 'explore-opportunities';
export type ProcessCoolingView = SetupView | MainView | ReportView | AssessmentView | SystemInformationView;

export enum MainView {
  BASELINE = 'baseline',
  ASSESSMENT = 'assessment',
  REPORT = 'report',
}

export enum SetupView {
  ASSESSMENT_SETTINGS = 'assessment-settings',
  SYSTEM_INFORMATION = 'system-information',
  INVENTORY = 'chiller-inventory',
  OPERATING_SCHEDULE = 'operating-schedule',
  LOAD_SCHEDULE = 'load-schedule',
}

export enum SystemInformationView {
  OPERATIONS = 'operations',
  WEATHER = 'weather',
  PUMP = 'pump',
  CONDENSER_COOLING_SYSTEM_INPUT = 'condenser-cooling-system',
  TOWER = 'tower',
}

export enum AssessmentView {
  EXPLORE_OPPORTUNITIES = 'explore-opportunities',
}

export enum ReportView {
  EXECUTIVE_SUMMARY = 'executive-summary',
  PERFORMANCE_PROFILE = 'performance-profile',
  PUMP_SUMMARY = 'pump-summary',
  TOWER_SUMMARY = 'tower-summary',
  INPUT_SUMMARY = 'input-summary',
  GRAPHS = 'graphs',
  SYSTEM_PROFILE = "system-profile",
  FACILITY_INFO = 'facility-info',
}


export interface ViewLink {
  view: ProcessCoolingView;
  label: string;
  param?: string | number;
  meta?: {
    disabled?: boolean;
  };
}

export const MAIN_VIEW_LINKS: ViewLink[] = [
  {
    view: MainView.BASELINE,
    label: 'Baseline',
  },
  {
    view: MainView.ASSESSMENT,
    label: 'Assessment',
  },
  {
    view: MainView.REPORT,
    label: 'Report',
  },
];

export const SETUP_VIEW_LINKS: ViewLink[] = [
  {
    view: SetupView.ASSESSMENT_SETTINGS,
    label: 'Assessment Settings',
  },
  {
    view: SetupView.SYSTEM_INFORMATION,
    label: 'System Information',
  },
  {
    view: SetupView.INVENTORY,
    label: 'Chiller Inventory',
  },
  {
    view: SetupView.OPERATING_SCHEDULE,
    label: 'Operating Schedule',
  },
  {
    view: SetupView.LOAD_SCHEDULE,
    label: 'Load Schedule',
  },
]

export const SYSTEM_INFORMATION_VIEW_LINKS: ViewLink[] = [
  {
    view: SystemInformationView.OPERATIONS,
    label: 'Operations',
  },
  {
    view: SystemInformationView.WEATHER,
    label: 'Weather',
  },
  {
    view: SystemInformationView.PUMP,
    label: 'Pump',
  },
  {
    view: SystemInformationView.CONDENSER_COOLING_SYSTEM_INPUT,
    label: 'Condenser Cooling'
  },
  {
    view: SystemInformationView.TOWER,
    label: 'Tower',
  },

]

export const ASSESSMENT_VIEW_LINKS: ViewLink[] = [
  {
    view: AssessmentView.EXPLORE_OPPORTUNITIES,
    label: 'Explore Opportunities',
  },
]

export const REPORT_VIEW_LINKS: ViewLink[] = [
  {
    view: ReportView.EXECUTIVE_SUMMARY,
    label: 'Executive Summary',
  },
  {
    view: ReportView.PERFORMANCE_PROFILE,
    label: 'Performance Profile',
    // meta: {
    //   disabled: true
    // }
  },
  {
    view: ReportView.SYSTEM_PROFILE,
    label: 'System Profile',
  },
  {
    view: ReportView.PUMP_SUMMARY,
    label: 'Pump Summary',
  },
  {
    view: ReportView.TOWER_SUMMARY,
    label: 'Tower Summary',
  },
  {
    view: ReportView.INPUT_SUMMARY,
    label: 'Input Summary',
  },
  {
    view: ReportView.FACILITY_INFO,
    label: 'Facility Info',
  },
  {
    view: ReportView.GRAPHS,
    label: 'Graphs',
    meta: {
      disabled: true
    }
  },
]
