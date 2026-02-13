
import { getNewIdString } from "../../shared/helperFunctions";
import { ChillerInventoryItem, CompressorChillerTypeEnum, DayScheduleData, FanType, MonthlyOperatingSchedule, ProcessCoolingAssessment, TowerSizeMetric, TowerType, WeeklyOperatingSchedule } from "../../shared/models/process-cooling-assessment";
import { Settings } from "../../shared/models/settings";

export const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const HOUR_OPTIONS = Array.from({ length: 25 }, (_, hour) => hour);

export const getCondenserCoolingMethods = () => {
    return [
        { value: 0, name: 'Water' },
        { value: 1, name: 'Air' },
    ] as const;
};

export const getTowerSizeMetrics = () => {
    return [
        { value: TowerSizeMetric.Tons, name: 'Tons' },
        { value: TowerSizeMetric.HP, name: 'HP' },
        { value: TowerSizeMetric.Unknown, name: 'Unknown' },
    ] as const;
};

export const getFanType = () => {
  return [
        { value: FanType.Axial, name: 'Axial' },
        { value: FanType.Centrifugal, name: 'Centrifugal' },
        { value: FanType.Unknown, name: 'Unknown' }
  ] as const;
}

export const getTowerTypes = () => {
    return [
        { value: TowerType.OneCellOneSpeed, name: TowerTypes[TowerType.OneCellOneSpeed] },
        { value: TowerType.OneCellTwoSpeed, name: TowerTypes[TowerType.OneCellTwoSpeed] },
        { value: TowerType.TwoCellOneSpeed, name: TowerTypes[TowerType.TwoCellOneSpeed] },
        { value: TowerType.TwoCellTwoSpeed, name: TowerTypes[TowerType.TwoCellTwoSpeed] },
        { value: TowerType.ThreeCellOneSpeed, name: TowerTypes[TowerType.ThreeCellOneSpeed] },
        { value: TowerType.ThreeCellTwoSpeed, name: TowerTypes[TowerType.ThreeCellTwoSpeed] },
        { value: TowerType.VariableSpeed, name: TowerTypes[TowerType.VariableSpeed] },
    ] as const;
};

export const getChillerTypes = () => {
  return [
    {value: CompressorChillerTypeEnum.CENTRIFUGAL, name: CompressorChillerTypes[CompressorChillerTypeEnum.CENTRIFUGAL]},
    {value: CompressorChillerTypeEnum.RECIPROCATING, name: CompressorChillerTypes[CompressorChillerTypeEnum.RECIPROCATING]},
    {value: CompressorChillerTypeEnum.SCREW, name: CompressorChillerTypes[CompressorChillerTypeEnum.SCREW]}
  ]
}

export const CompressorChillerTypes =
{
    [CompressorChillerTypeEnum.CENTRIFUGAL]: 'Centrifugal',
    [CompressorChillerTypeEnum.RECIPROCATING]: 'Reciprocating',
    [CompressorChillerTypeEnum.SCREW]: 'Helical Rotary'
}

export const TowerTypes =
{
    [TowerType.OneCellOneSpeed]: '1-Cell With 1-Speed Motor',
    [TowerType.OneCellTwoSpeed]: '1-Cell With 2-Speed Motor',
    [TowerType.TwoCellOneSpeed]: '2-Cell With 1-Speed Motors',
    [TowerType.TwoCellTwoSpeed]: '2-Cell With 2-Speed Motors',
    [TowerType.ThreeCellOneSpeed]: '3-Cell With 1-Speed Motors',
    [TowerType.ThreeCellTwoSpeed]: '3-Cell With 2-Speed Motors',
    [TowerType.VariableSpeed]: 'Tower With Variable Speed Motor(s)',
}

export const getDefaultInventoryItem = (): ChillerInventoryItem => {
    return {
        itemId: getNewIdString(),
        name: 'New Chiller',
        description: undefined,
        modifiedDate: new Date(),
        chillerType: CompressorChillerTypeEnum.CENTRIFUGAL,
        capacity: 1000,
        isFullLoadEfficiencyKnown: true,
        fullLoadEfficiency: 0.65,
        age: 10,
        installVSD: false,
        useARIloadScheduleByMonthchedule: false,
        useSameMonthlyLoading: true,
        loadScheduleAllMonths: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 0],
        loadScheduleByMonth: Array(12).fill(Array(11).fill(0)),
    };
}

export const getDefaultProcessCoolingAssessment = (settings: Settings): ProcessCoolingAssessment => {
        return {
          name: 'Baseline',
          isValid: false,
          modifications: new Array(),
          setupDone: false,
          systemBasics: {
            utilityType: 'Electricity',
            notes: undefined,
          },
          systemInformation: {
              co2SavingsData: {
                energyType: "electricity",
                totalEmissionOutputRate: 430.78,
                // todo where is this from
                electricityUse: 6309742.4,
                energySource: "Natural Gas",
                fuelType: "Natural Gas",
                eGridRegion: "",
                eGridSubregion: "SRTV",
                totalEmissionOutput: 0,
                totalFuelEmissionOutputRate: null,
                userEnteredBaselineEmissions: false,
                userEnteredModificationEmissions: false,
                zipcode: "37830"
              },
            operations: {
              annualOperatingHours: 8760,
              fuelCost: settings.fuelCost || 10,
              electricityCost: settings.electricityCost || 0.20,
              chilledWaterSupplyTemp: 44,
              condenserCoolingMethod: 0, // water
              doChillerLoadSchedulesVary: undefined
            },
            airCooledSystemInput: {
              outdoorAirTemp: 54,
              airCoolingSource: 0,
              indoorTemp: 95,
              followingTempDifferential: 0
            },
            waterCooledSystemInput: {
              isConstantCondenserWaterTemp: true, 
              condenserWaterTemp: 0, 
              followingTempDifferential: 0, 
            },
             towerInput: {
              usesFreeCooling: true,
              isHEXRequired: false,
              HEXApproachTemp: 0, 
              numberOfTowers: 1,
              numberOfFans: 1,
              fanSpeedType: 0,
              towerSizeMetric: 0,
              fanType: 0,
              towerSize: 78,
              towerType: TowerType.OneCellOneSpeed
            },
            chilledWaterPumpInput: {
              variableFlow: true,
              flowRate: 2.4,
              efficiency: 75,
              motorSize: 0,
              motorEfficiency: 85,
            },
            condenserWaterPumpInput: {
              variableFlow: true,
              flowRate: 3,
              efficiency: 75,
              motorSize: 0,
              motorEfficiency: 85,
            },
          },
          inventory: [
            getDefaultInventoryItem()
          ],
          weeklyOperatingSchedule: getDefaultWeeklyOperatingSchedule(),
          monthlyOperatingSchedule: getDefaultMonthlyScheduleData(),
          selectedModificationId: '',
          existingDataUnits: 'Imperial',
          selected: false,
        }
      }


export const getDefaultMonthlyScheduleData = (): MonthlyOperatingSchedule => {
  const months = getMonthsMaxDays();
  return {
    months: months,
    useMaxHours: false,
    hoursOnPerMonth: months.map(month => month.days * 24)
  };
}

 export const getDefaultWeeklyOperatingSchedule = (): WeeklyOperatingSchedule => {
    const defaultSchedule: WeeklyOperatingSchedule = {
      useSameSchedule: false,
      days: [
        { off: false, start: 8, end: 17, allDay: false },
        { off: false, start: 8, end: 17, allDay: false },
        { off: false, start: 8, end: 17, allDay: false },
        { off: false, start: 8, end: 17, allDay: false },
        { off: false, start: 8, end: 17, allDay: false },
        { off: true, start: 8, end: 17, allDay: false },
        { off: true, start: 8, end: 17, allDay: false }
      ],
    }
    defaultSchedule.hoursOnMonToSun = getHoursOnMonToSun(defaultSchedule.days);
    return defaultSchedule;
  }

export const getHoursOnMonToSun = (days: DayScheduleData[]) => {
   const hoursOnMonToSun = days.map(day => {
      if (day.off) {
        return 0;
      } else if (day.allDay) {
        return 24;
      } else {
        return Math.max(0, day.end - day.start);
      }
    });
  return hoursOnMonToSun;
}

export const getMonthsMaxDays = () => {
  return [
    { name: 'January', days: 31 },
    // * Leap year max
    { name: 'February', days: 29 },
    { name: 'March', days: 31 },
    { name: 'April', days: 30 },
    { name: 'May', days: 31 },
    { name: 'June', days: 30 },
    { name: 'July', days: 31 },
    { name: 'August', days: 31 },
    { name: 'September', days: 30 },
    { name: 'October', days: 31 },
    { name: 'November', days: 30 },
    { name: 'December', days: 31 }
  ];
}






export const LOAD_LABELS = ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];
export const WET_BULB_BINS = ['< 35', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];