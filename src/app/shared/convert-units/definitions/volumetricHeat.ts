export const volumetricHeat = {
  volumetricHeat: {
    btuScfF: {
      name: {
        singular: 'Btu per Standard Cubic Foot Fahrenheit'
        , plural: 'Btu per Standard Cubic Feet Fahrenheit',
        display: '(Btu/scf - &#x2109;)'
      }
      , to_anchor: 1 / 14.921
    },
    kcalm3C: {
      name: {
        singular: 'Kilocalorie per Cubic Meter Celsius'
        , plural: 'Kilocalorie per Cubic Meter Celsius',
        display: '(kcal/m&#x00B3;-&#x2103;)'
      }
      , to_anchor: 0.238845897
    },
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
  },
  _anchors: {
    metric: {
      unit: 'kJ/m3-C'
      , ratio: 1
    }
  }
};