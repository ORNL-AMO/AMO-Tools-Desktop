export const energy = {
  metric: {
    mWh: {
      name: {
        singular: 'Milliwatt-hour'
        , plural: 'Milliwatt-hours',
        display: '(mWh)'
      }
      , to_anchor: 3.6
      , group: 'Small-scale energy units'
    },
    cal: {
      name: {
        singular: 'Calorie'
        , plural: ' Calories',
        display: '(cal)'
      }
      , to_anchor: 4.1868
      , group: 'Small-scale energy units'
    },
    J: {
      name: {
        singular: 'Joule'
        , plural: 'Joules',
        display: '(J)'
      }
      , to_anchor: 1
      , group: 'Small-scale energy units'
    },
    Wh: {
      name: {
        singular: 'Watt-hour'
        , plural: 'Watt-hours',
        display: '(Wh)'
      }
      , to_anchor: 3600
      , group: 'Medium-scale energy units'
    },
    kcal: {
      name: {
        singular: 'Kilocalorie'
        , plural: 'Kilocalories',
        display: '(kcal)'
      }
      , to_anchor: 4184
      , group: 'Medium-scale energy units'
    },
    kJ: {
      name: {
        singular: 'Kilojoule'
        , plural: 'Kilojoules',
        display: '(kJ)'
      }
      , to_anchor: 1000
      , group: 'Medium-scale energy units'
    },
    kWh: {
      name: {
        singular: 'Kilowatt-hour'
        , plural: 'Kilowatt-hours',
        display: '(kWh)'
      }
      , to_anchor: 3600000
      , group: 'Large-scale energy units'
    },
    MJ: {
      name: {
        singular: 'Megajoule',
        plural: 'Megajoules',
        display: '(MJ)'
      },
      to_anchor: 1000000
      , group: 'Large-scale energy units'
    },
    MWh: {
      name: {
        singular: 'Megawatt-hour'
        , plural: 'Megawatt-hours',
        display: '(MWh)'
      }
      , to_anchor: 3600000000
      , group: 'Large-scale energy units'
    },
    GJ: {
      name: {
        singular: 'Gigajoule'
        , plural: 'Gigajoules',
        display: '(GJ)'
      }
      , to_anchor: 1000000000
      , group: 'Large-scale energy units'
    },
    GWh: {
      name: {
        singular: 'Gigawatt-hour'
        , plural: 'Gigawatt-hours',
        display: '(GWh)'
      }
      , to_anchor: 3600000000000
      , group: 'Large-scale energy units'
    },
    kgce: {
      name: {
        singular: 'Kilogram of coal equivalent '
        , plural: 'Kilograms of coal equivalent',
        display: '(kgce)'
      }
      , to_anchor: 29295000
      , group: 'Fuel energy units'
    },
    kgoe: {
      name: {
        singular: 'Kilogram of oil equivalent'
        , plural: 'Kilograms of oil equivalent',
        display: '(kgoe)'
      }
      , to_anchor: 41868000
      , group: 'Fuel energy units'
    },
    TJ: {
      name: {
        singular: 'Terajoule'
        , plural: 'Terajoules',
        display: '(TJ)'
      }
      , to_anchor: 1000000000000
      , group: 'Large-scale energy units'
    },
    PJ: {
      name: {
        singular: 'Petajoule'
        , plural: 'Petajoules',
        display: '(PJ)'
      }
      , to_anchor: 1000000000000000
      , group: 'Large-scale energy units'
    },
    EJ: {
      name: {
        singular: 'Exajoule'
        , plural: 'Exajoules',
        display: '(EJ)'
      }
      , to_anchor: 1000000000000000000
      , group: 'Large-scale energy units'
    }
  },
  imperial: {
    Btu: {
      name: {
        singular: 'British thermal unit'
        , plural: 'British thermal units',
        display: '(Btu)'
      }
      , to_anchor: 1
      , group: 'Small-scale energy units'
    },
    MMBtu: {
      name: {
        singular: 'Million British Thermal Units'
        , plural: 'Millions British Thermal Units',
        display: '(MMBtu)'
      }
      , to_anchor: 1000000
      , group: 'Large-scale energy units'
    },
    BBtu: {
      name: {
        singular: 'Billion British Thermal Units'
        , plural: 'Billions British Thermal Units',
        display: '(BBtu)'
      }
      , to_anchor: 1000000000
      , group: 'Large-scale energy units'
    },
    TBtu: {
      name: {
        singular: 'Trillion British Thermal Units'
        , plural: 'Trillions British Thermal Units',
        display: '(TBtu)'
      }
      , to_anchor: 1000000000000
      , group: 'Large-scale energy units'
    },
    QBtu: {
      name: {
        singular: 'Quadrillion British Thermal Units'
        , plural: 'Quadrillions British Thermal Units',
        display: '(QBtu)'
      }
      , to_anchor: 1_000_000_000_000_000
      , group: 'Large-scale energy units'
    },
    quads: {
      name: {
        singular: 'Quadrillion British Thermal Units'
        , plural: 'Quadrillions British Thermal Units',
        display: '(quads)'
      }
      , to_anchor: 1_000_000_000_000_000
      , group: 'Large-scale energy units'
    }
  },
  _anchors: {
    metric: {
      unit: 'J'
      , ratio: 1 / 1055.06
    },
    imperial: {
      unit: 'Btu'
      , ratio: 1055.06
    }
  }
};