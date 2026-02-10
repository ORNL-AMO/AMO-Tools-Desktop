export const PROCESS_COOLING_UNITS = {
  temperature: {
    imperial: 'F',
    metric: 'C',
    labelHTML: {
      imperial: '&#8457;',
      metric: '&#8451;',
    }
  },
  // volumeFlowRate: {
  //   imperial: 'gpm/ton',
  //   metric: 'm3/kW',
  //   labelHTML: {
  //     imperial: 'gpm/ton',
  //     metric: 'm<sup>3</sup>/kW'
  //   }
  // },
  // todo temporary until we have definition for the above
   volumeFlowRate: {
    imperial: 'gpm',
    metric: 'm3/min',
    labelHTML: {
      imperial: 'gpm/ton',
      metric: 'm<sup>3</sup>/min'
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
  towerSize: {
    otherTypes: {
      tons: {
        unit: 'tons',
        labelHTML: 'tons'
      },
      hp: {
        unit: 'hp',
        labelHTML: 'hp'
      }
    },
  },
  // todo temporary until we have metric definition
  fullLoadEfficiency: {
    imperial: 'kw/ton',
    metric: 'kw/ton',
    labelHTML: {
      imperial: 'kW/ton',
      metric: 'kW/ton'
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
  power: {
    imperial: 'hp',
    // kW is a default guess
    metric: 'kW',
    labelHTML: {
      imperial: 'hp',
      metric: 'kW'
    }
  },
};

export interface AppUnits {
  imperial: string;
  metric: string;
  labelHTML: {
    imperial: string;
    metric: string;
  },
  otherTypes?: {
    [otherType: string]: {
      unit: string,
      labelHTML: string
    }
  };
}


export type ProcessCoolingValidation = {
  [unitType: string]: AppUnits;
};