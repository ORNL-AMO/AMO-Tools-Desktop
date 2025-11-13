export const power = {
  metric: {
    mW: {
      name: {
        singular: 'Milliwatt',
        plural: 'Milliwatts',
        display: '(mW)'
      },
      to_anchor: .001,
      group: 'Metric'
    },
    W: {
      name: {
        singular: 'Watt',
        plural: 'Watts',
        display: '(W)'
      },
      to_anchor: 1,
      group: 'Metric'
    },
    cals: {
      name: {
        singular: 'Calorie per Second',
        plural: 'Calories per Second',
        display: '(cal/s)'
      },
      to_anchor: 4.1868,
      group: 'Metric'
    },
    kcals: {
      name: {
        singular: 'Kilocalorie per second',
        plural: 'Kilocalories per second',
        display: '(kcal/s)'
      },
      to_anchor: 4186.8,
      group: 'Metric'
    },
    kW: {
      name: {
        singular: 'Kilowatt',
        plural: 'Kilowatts',
        display: '(kW)'
      },
      to_anchor: 1000,
      group: 'Metric'
    },
    MW: {
      name: {
        singular: 'Megawatt',
        plural: 'Megawatts',
        display: '(MW)'
      },
      to_anchor: 1000000,
      group: 'Metric'
    },
    GW: {
      name: {
        singular: 'Gigawatt',
        plural: 'Gigawatts',
        display: '(GW)'
      },
      to_anchor: 1000000000,
      group: 'Metric'
    }
  },
  imperial: {
    btuhr: {
      name: {
        singular: 'British thermal unit per hour',
        plural: 'British thermal unit per hour',
        display: '(Btu/hr)'
      },
      to_anchor: 1 / 2544.43,
      group: 'Imperial'
    },
    kJh: {
      name: {
        singular: 'Kilojoule per hour',
        plural: 'Kilojoules per hour',
        display: '(kJ/hr)'
      },
      to_anchor: .000372506136,
      group: 'Imperial'
    },
    MJh: {
      name: {
        singular: 'Megajoule per hour',
        plural: 'Megajoules per hour',
        display: '(MJ/hr)'
      },
      to_anchor: .372506136,
      group: 'Imperial'
    },
    hp: {
      name: {
        singular: 'Horse Power',
        plural: 'Horse Power',
        display: '(hp)'
      },
      to_anchor: 1,
      group: 'Imperial'
    },
    btus: {
      name: {
        singular: 'British thermal unit per second',
        plural: 'British thermal units per second',
        display: '(Btu/s)'
      },
      to_anchor: 1.4148532,
      group: 'Imperial'
    },
    tons: {
      name: {
        singular: 'Ton of Refridgeration',
        plural: 'Tons of Refridgeration',
        display: '(tons)'
      },
      to_anchor: 4.71617735,
      group: 'Imperial'
    },
    GJh: {
      name: {
        singular: 'Gigajoule per hour',
        plural: 'Gigajoules per hour',
        display: '(GJ/hr)'
      },
      to_anchor: 372.506136,
      group: 'Imperial'
    }
  },
  _anchors: {
    metric: {
      unit: 'W',
      ratio: 1 / 745.7
    },
    imperial: {
      unit: 'hp',
      ratio: 745.7
    }
  }
};