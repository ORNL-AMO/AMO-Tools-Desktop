export const pressure = {
  metric: {
    Pa: {
      name: {
        singular: 'Pascal'
        , plural: 'Pascals',
        display: '(Pa)'
      }
      , to_anchor: 1 / 1000
    }
    , kPa: {
      name: {
        singular: 'Kilopascal'
        , plural: 'Kilopascals',
        display: '(kPa)'
      }
      , to_anchor: 1
    }
    , MPa: {
      name: {
        singular: 'Megapascal'
        , plural: 'Megapascals',
        display: '(MPa)'
      }
      , to_anchor: 1000
    }
    , hPa: {
      name: {
        singular: 'Hectopascal'
        , plural: 'Hectopascals',
        display: '(hPa)'
      }
      , to_anchor: 1 / 10
    }
    , bar: {
      name: {
        singular: 'Bar'
        , plural: 'Bar',
        display: '(bar)'
      }
      , to_anchor: 100
    }
    , torr: {
      name: {
        singular: 'Torr'
        , plural: 'Torr',
        display: '(torr)'
      }
      , to_anchor: 101325 / 760000
    }
    , atm: {
      name: {
        singular: 'Atmosphere'
        , plural: 'Atmospheres',
        display: '(atm)'
      }
      , to_anchor: 101.325
    }
    , mmHG: {
      name: {
        singular: 'Milimeter of Mercury'
        , plural: 'Milimeters of Mercury',
        display: '(mm Hg)'
      }
      , to_anchor: 0.133322
    }
    , mH2o: {
      name: {
        singular: 'Meter of Water'
        , plural: 'Meters of Water',
        display: '(m H₂O)'
      }
      , to_anchor: 9.8064
    },
    ftH2o: {
      name: {
        singular: 'Foot of Water'
        , plural: 'Feet of Water',
        display: '(ft H&#x2082;O)'
      }
      , to_anchor: 2.98898
    }
  }
  , imperial: {
    psi: {
      name: {
        singular: 'Pound per Square Inch'
        , plural: 'Pounds per Square Inch',
        display: '(psi)'
      }
      , to_anchor: 1 / 1000
    }
    , ksi: {
      name: {
        singular: 'Kilopound per Square Inch'
        , plural: 'Kilopounds per Square Inch',
        display: '(ksi)'
      }
      , to_anchor: 1
    },
    inH2o: {
      name: {
        singular: 'Inch of Water'
        , plural: 'Inches of Water',
        display: '(in H&#x2082;O)'
      }
      , to_anchor: 1 / 27707.6
    }
  },
  _anchors: {
    metric: {
      unit: 'kPa'
      , ratio: 0.00014503768078
    }
    , imperial: {
      unit: 'psi'
      , ratio: 1 / 0.00014503768078
    }
  }
}
