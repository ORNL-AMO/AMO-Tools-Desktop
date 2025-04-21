export const energy = {
  metric: {
    Wh: {
      name: {
        singular: 'Watt-hour'
        , plural: 'Watt-hours',
        display: '(Wh)'
      }
      , to_anchor: 3600
    }
    , mWh: {
      name: {
        singular: 'Milliwatt-hour'
        , plural: 'Milliwatt-hours',
        display: '(mWh)'
      }
      , to_anchor: 3.6
    }
    , kWh: {
      name: {
        singular: 'Kilowatt-hour'
        , plural: 'Kilowatt-hours',
        display: '(kWh)'
      }
      , to_anchor: 3600000
    }
    , MWh: {
      name: {
        singular: 'Megawatt-hour'
        , plural: 'Megawatt-hours',
        display: '(MWh)'
      }
      , to_anchor: 3600000000
    }
    , GWh: {
      name: {
        singular: 'Gigawatt-hour'
        , plural: 'Gigawatt-hours',
        display: '(GWh)'
      }
      , to_anchor: 3600000000000
    }
    , J: {
      name: {
        singular: 'Joule'
        , plural: 'Joules',
        display: '(J)'
      }
      , to_anchor: 1
    }
    , kJ: {
      name: {
        singular: 'Kilojoule'
        , plural: 'Kilojoules',
        display: '(kJ)'
      }
      , to_anchor: 1000
    },
    GJ: {
      name: {
        singular: 'Gigajoule'
        , plural: 'Gigajoules',
        display: '(GJ)'
      }
      , to_anchor: 1000000000
    },
    MJ: {
      name: {
        singular: 'Megajoule',
        plural: 'Megajoules',
        display: '(MJ)'
      },
      to_anchor: 1000000
    }

    , cal: {
      name: {
        singular: 'Calorie'
        , plural: ' Calories',
        display: '(cal)'
      }
      , to_anchor: 4.1868
    }
    , kcal: {
      name: {
        singular: 'Kilocalorie'
        , plural: 'Kilocalories',
        display: '(kcal)'
      }
      , to_anchor: 4184
    }
    , kgce: {
      name: {
        singular: 'Kilogram of coal equivalent '
        , plural: 'Kilograms of coal equivalent',
        display: '(kgce)'
      }
      , to_anchor: 29295000
    }
    , kgoe: {
      name: {
        singular: 'Kilogram of oil equivalent'
        , plural: 'Kilograms of oil equivalent',
        display: '(kgoe)'
      }
      , to_anchor: 41868000
    },
    TJ: {
      name: {
        singular: 'Terajoule'
        , plural: 'Terajoules',
        display: '(TJ)'
      }
      , to_anchor: 1000000000000
    },
    PJ: {
      name: {
        singular: 'Petajoule'
        , plural: 'Petajoules',
        display: '(PJ)'
      }
      , to_anchor: 1000000000000000
    },
    EJ: {
      name: {
        singular: 'Exajoule'
        , plural: 'Exajoules',
        display: '(EJ)'
      }
      , to_anchor: 1000000000000000000
    },
  },
  imperial: {
    Btu: {
      name: {
        singular: 'British thermal unit'
        , plural: 'British thermal units',
        display: '(Btu)'
      }
      , to_anchor: 1
    }
    , MMBtu: {
      name: {
        singular: 'Million British Thermal Units'
        , plural: 'Millions British Thermal Units',
        display: '(MMBtu)'
      }
      , to_anchor: 1000000
    },
    BBtu: {
      name: {
        singular: 'Billion British Thermal Units'
        , plural: 'Billions British Thermal Units',
        display: '(BBtu)'
      }
      , to_anchor: 1000000000
    }
    , TBtu: {
      name: {
        singular: 'Trillion British Thermal Units'
        , plural: 'Trillions British Thermal Units',
        display: '(TBtu)'
      }
      , to_anchor: 1000000000000
    }
    , QBtu: {
      name: {
        singular: 'Quadrillion British Thermal Units'
        , plural: 'Quadrillions British Thermal Units',
        display: '(QBtu)'
      }
      , to_anchor: 1_000_000_000_000_000
    }
    , quads: {
      name: {
        singular: 'Quadrillion British Thermal Units'
        , plural: 'Quadrillions British Thermal Units',
        display: '(quads)'
      }
      , to_anchor: 1_000_000_000_000_000
    }
  }
  , _anchors: {
    metric: {
      unit: 'J'
      , ratio: 1 / 1055.06
    }
    , imperial: {
      unit: 'Btu'
      , ratio: 1055.06
    }
  }
};
