export const volumetricHeat = {
  // Volumetric Specific Heat
  // 1 kJ/(m3- K) = 1 kJ/(m3- C) = 0.160496 Btu/(scf- F) = 0.239 kcal/(m3-C)
  volumetricHeat: {
    kJm3C: {
      name: {
        singular: 'Kilojoule per Cubic Meter Celsius'
        , plural: 'Kilojoules per Cubic Meter Celsius',
        display: '(kJ/m&#x00B3;-C)'
      }
      , to_anchor: 1
    }
    , kJm3K: {
      name: {
        singular: 'Kilojoule per Cubic Meter Kelvin'
        , plural: 'Kilojoules per Cubic Meter Kelvin',
        display: '(kJ/m&#x00B3;-K)'
      }
      , to_anchor: 1
    }
    , kcalm3C: {
      name: {
        singular: 'Kilocalorie per Cubic Meter Celsius'
        , plural: 'Kilocalorie per Cubic Meter Celsius',
        display: '(kcal/m&#x00B3;-&#x2103;)'
      }
      , to_anchor: 0.238845897
    },
    btuScfF: {
      name: {
        singular: 'Btu per Standard Cubic Foot Fahrenheit'
        , plural: 'Btu per Standard Cubic Feet Fahrenheit',
        display: '(Btu/scf - &#x2109;)'
      }
      , to_anchor: 1 / 14.921
    }
  },
  _anchors: {
    metric: {
      unit: 'kJ/m3-C'
      , ratio: 1
    }
  }

};
