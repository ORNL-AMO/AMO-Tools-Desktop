import { ConvertValue } from '../../shared/convert-units/ConvertValue';

/**
 * Imperial / Metric unit pairs for the Process Cooling assessment.
 * The `imperial` / `metric` values are ConvertValue abbreviations. Ratio units (kW/ton, gpm/ton) are not
 * defined in ConvertValue, so they are converted with the helpers below instead.
 */
export const PROCESS_COOLING_UNITS = {
  temperature: {
    imperial: 'F',
    metric: 'C',
    labelHTML: {
      imperial: '&#8457;',
      metric: '&#8451;',
    }
  },
  // * Temperature differences (approach, following differential) must not apply the F/C offset. R <-> K is a pure 5/9 scale.
  temperatureDifference: {
    imperial: 'R',
    metric: 'K',
    labelHTML: {
      imperial: '&#8457;',
      metric: '&#8451;',
    }
  },
  // * converted with convertFlowRatePerTon
  volumeFlowRate: {
    imperial: 'gpm/ton',
    metric: 'L/s/kW',
    labelHTML: {
      imperial: 'gpm/ton',
      metric: 'L/s/kW'
    }
  },
  fuelCost: {
    imperial: 'MMBtu',
    metric: 'GJ',
    labelHTML: {
      imperial: '$/MMBtu',
      metric: '$/GJ'
    }
  },
  towerSizeTons: {
    imperial: 'tons',
    metric: 'kW',
    labelHTML: {
      imperial: 'tons',
      metric: 'kW'
    }
  },
  towerSizeHP: {
    imperial: 'hp',
    metric: 'kW',
    labelHTML: {
      imperial: 'hp',
      metric: 'kW'
    }
  },
  // * converted with convertChillerEfficiency
  fullLoadEfficiency: {
    imperial: 'kW/ton',
    metric: 'kW/kW',
    labelHTML: {
      imperial: 'kW/ton',
      metric: 'kW/kW'
    }
  },
  // * converted with convertChillerEfficiency
  efficiency: {
    imperial: 'kW/ton',
    metric: 'kW/kW',
    labelHTML: {
      imperial: 'kW/ton',
      metric: 'kW/kW'
    }
  },
  capacity: {
    imperial: 'tons',
    metric: 'kW',
    labelHTML: {
      imperial: 'tons',
      metric: 'kW'
    }
  },
  motorPower: {
    imperial: 'hp',
    metric: 'kW',
    labelHTML: {
      imperial: 'hp',
      metric: 'kW'
    }
  },
  chillerPower: {
    imperial: 'kW',
    metric: 'kW',
    labelHTML: {
      imperial: 'kW',
      metric: 'kW'
    }
  },
  energy: {
    imperial: 'kWh',
    metric: 'kWh',
    labelHTML: {
      imperial: 'kWh',
      metric: 'kWh'
    }
  }
};

export type ProcessCoolingUnitKey = keyof typeof PROCESS_COOLING_UNITS;

export function getProcessCoolingUnitLabel(unitKey: ProcessCoolingUnitKey, unitsOfMeasure: string): string {
  const labelHTML = PROCESS_COOLING_UNITS[unitKey].labelHTML;
  return unitsOfMeasure === 'Metric' ? labelHTML.metric : labelHTML.imperial;
}

const KW_PER_TON: number = new ConvertValue(1, 'tons', 'kW').convertedValue;
const LPS_PER_GPM: number = new ConvertValue(1, 'gpm', 'L/s').convertedValue;

/**
 * kW/ton <-> kW/kW
 */
export function convertChillerEfficiency(value: number, toMetric: boolean): number {
  if (value === undefined || value === null) return value;
  return toMetric ? value / KW_PER_TON : value * KW_PER_TON;
}

/**
 * gpm/ton <-> L/s/kW
 */
export function convertFlowRatePerTon(value: number, toMetric: boolean): number {
  if (value === undefined || value === null) return value;
  const factor = LPS_PER_GPM / KW_PER_TON;
  return toMetric ? value * factor : value / factor;
}

export interface AppUnits {
  imperial: string;
  metric: string;
  labelHTML: {
    imperial: string;
    metric: string;
  },
}
