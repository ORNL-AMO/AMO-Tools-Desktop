export const specificHeat = {
  // Specific Heat
  // 1 kJ/(kg- K) = 1 kJ/(kg- C) = 0.239 Btu/(lb- F) = 0.239 kcal/(kg-C)
      metric: {
      kJkgC: {
        name: {
          singular: 'Kilojoule per Kilogram Celsius'
          , plural: 'Kilojoules per Kilogram Celsius',
          display: '(kJ/kg-C)'
        }
        , to_anchor: 1
      }
      , kJkgK: {
        name: {
          singular: 'Kilojoule per Kilogram Kelvin'
          , plural: 'Kilojoules per Kilogram Kelvin',
          display: '(kJ/kg-K)'
        }
        , to_anchor: 1
      }
      , kcalkgC: {
        name: {
          singular: 'Kilocalorie per Kilogram Celsius'
          , plural: 'Kilocalories per Kilogram Celsius',
          display: '(kcal/kg-C)'
        }
        , to_anchor: 1 / 0.238845897
      }
    },

  imperial: {
    btulbF: {
      name: {
        singular: 'British Thermal Unit per Pound Fahrenheit'
        , plural: 'British Thermal Units per Pound Fahrenheit',
        display: '(Btu/lb-F)'
      }
      , to_anchor: 1
    }
  }
  , _anchors: {
    metric: {
      unit: 'kJ/kgC'
      , ratio: 0.238845897
    }
    , imperial: {
      unit: 'Btu/lb-F'
      , ratio: 1 / 0.238845897
    }
  }
}
