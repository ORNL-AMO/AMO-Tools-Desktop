export const power = {
  metric: {
    W: {
      name: {
        singular: 'Watt'
        , plural: 'Watts',
        display: '(W)'
      }
      , to_anchor: 1
    }
    , mW: {
      name: {
        singular: 'Milliwatt'
        , plural: 'Milliwatts',
        display: '(mW)'
      }
      , to_anchor: .001
    }
    , kW: {
      name: {
        singular: 'Kilowatt'
        , plural: 'Kilowatts',
        display: '(kW)'
      }
      , to_anchor: 1000
    }
    , MW: {
      name: {
        singular: 'Megawatt'
        , plural: 'Megawatts',
        display: '(MW)'
      }
      , to_anchor: 1000000
    }
    , GW: {
      name: {
        singular: 'Gigawatt'
        , plural: 'Gigawatts',
        display: '(GW)'
      }
      , to_anchor: 1000000000
    }

    , cals: {
      name: {
        singular: 'Calorie per Second'
        , plural: 'Calories per Second',
        display: '(cal/s)'
      }
      , to_anchor: 4.1868
    }

    , kcals: {
      name: {
        singular: 'Kilocalorie per second'
        , plural: 'Kilocalories per second',
        display: '(kcal/s)'
      }
      , to_anchor: 4186.8
    },
  },
  imperial: {
    hp: {
      name: {
        singular: 'Horse Power',
        plural: 'Horse Power',
        display: '(hp)'
      },
      to_anchor: 1
    }
    , btus: {
      name: {
        singular: 'British thermal unit per second'
        , plural: 'British thermal units per second',
        display: '(Btu/s)'
      }
      , to_anchor: 1.4148532
    }
    , tons: {
      name: {
        singular: 'Ton of Refridgeration'
        , plural: 'Tons of Refridgeration',
        display: '(tons)'
      }
      , to_anchor: 4.71617735
    }
    , btuhr: {
      name: {
        singular: 'British thermal unit per hour'
        , plural: 'British thermal unit per hour',
        display: '(Btu/hr)'
      }
      , to_anchor: 1 / 2544.43
    },
    MJh: {
      name: {
        singular: 'Megajoule per hour',
        plural: 'Megajoules per hour',
        display: '(MJ/hr)'
      },
      to_anchor: .372506136
    },
    kJh: {
      name: {
        singular: 'Kilojoule per hour'
        , plural: 'Kilojoules per hour',
        display: '(kJ/hr)'
      }
      , to_anchor: .000372506136
    },
    GJh: {
      name: {
        singular: 'Gigajoule per hour'
        , plural: 'Gigajoules per hour',
        display: '(GJ/hr)'
      }
      , to_anchor: 372.506136
    }
  },
  _anchors: {
    metric: {
      unit: 'W'
      , ratio: 1 / 745.7
    }
    , imperial: {
      unit: 'hp'
      , ratio: 745.7
    }
  }
};
