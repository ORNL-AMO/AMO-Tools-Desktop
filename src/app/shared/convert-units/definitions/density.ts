export const density = {
  metric: {
    kgNm3: {
      name: {
        singular: 'Kilogram per Cubic Meter'
        , plural: 'Kilograms per Cubic Meter',
        display: '(kg/m&#x00B3)'
      }
      , to_anchor: 1
    }
    , kgL: {
      name: {
        singular: 'Kilogram per Litter'
        , plural: 'Kilograms per Litter',
        display: '(kg/L)'
      }
      , to_anchor: 1000
    }
    , 'g/L': {
      name: {
        singular: 'Gram per liter'
        , plural: 'Grams per liter',
        display: '(g/L)'
      }
      , to_anchor: 1
    },
    'mg/L': {
      name: {
        singular: 'Milligram per liter'
        , plural: 'Milligrams per liter',
        display: '(mg/L)'
      }
      , to_anchor: 1000
    }
  },
  imperial: {
    lbscf: {
      name: {
        singular: 'Pound per Cubic Foot'
        , plural: 'Pounds per Cubic Foot',
        display: '(lb/ft&#x00B3)'
      }
      , to_anchor: 1
    }
    , lbgal: {
      name: {
        singular: 'Pound per Gallon'
        , plural: 'Pounds per Gallon',
        display: '(lb/gal)'
      }
      , to_anchor: 7.48052
    }
    , lbkft3: {
      name: {
        singular: 'Pound per Thousand Cubic Feet'
        , plural: 'Pounds per Thousand Cubic Feet',
        display: '(lb/kft&#x00B3)'
      }
      , to_anchor: 1000
    }
  }
  , _anchors: {
    metric: {
      unit: 'kgNm3'
      , ratio: 1 / 16.0185
    }
    , imperial: {
      unit: 'lbscf'
      , ratio: 16.0185
    }
  }
};
