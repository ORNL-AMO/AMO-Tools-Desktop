import { getNewIdString } from "../shared/helperFunctions";
import { ChillerInventoryItem, CompressorChillerTypeEnum, FanType, ProcessCoolingAssessment, TowerSizeMetric, TowerType } from "../shared/models/process-cooling-assessment";
import { Settings } from "../shared/models/settings";

export const getCondenserCoolingMethods = () => {
    return [
        { value: 0, name: 'Water' },
        { value: 1, name: 'Air' },
    ] as const;
};

export const getTowerSizeMetrics = () => {
    return [
        { value: TowerSizeMetric.Tonnes, name: 'Tonnes' },
        { value: TowerSizeMetric.HP, name: 'HP' },
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
        capacity: 0,
        isFullLoadEfficiencyKnown: false,
        fullLoadEfficiency: 0,
        age: 0,
        installVSD: false,
        useARIMonthlyLoadSchedule: false,
        monthlyLoads: Array(12).fill(Array(11).fill(0)),
    };
}

export const getDefaultProcessCoolingAssessment = (settings: Settings ): ProcessCoolingAssessment => {
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
              fuelCost: settings.fuelCost || 3.99,
              electricityCost: settings.electricityCost || 0.066,
              zipcode: 53704,
              chilledWaterSupplyTemp: 44,
              condenserCoolingMethod: 0, // water
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
              towerSize: 78
            },
            chilledWaterPumpInput: {
              variableFlow: true,
              flowRate: 500,
              efficiency: 0.8,
              motorSize: 0,
              motorEfficiency: 0,
            },
            condenserWaterPumpInput: {
              variableFlow: true,
              flowRate: 0,
              efficiency: 0,
              motorSize: 0,
              motorEfficiency: 0,
            },
          },
          inventory: [
            getDefaultInventoryItem()
          ],
          selectedModificationId: '',
          existingDataUnits: '',
          selected: false,
        }
      }