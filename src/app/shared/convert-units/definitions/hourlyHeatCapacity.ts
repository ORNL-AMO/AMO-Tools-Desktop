export const hourlyHeatCapacity = {
    metric: {
        'J/C': {
            name: {
                singular: 'Joule per hour Celsius'
                , plural: 'Joules per hour Celsius',
                display: '(J/(hr-&#8451;))'
            }
            , to_anchor: 1
        }
    },
    imperial: {
        'Btu/F': {
            name: {
                singular: 'Btu per hour Fahrenheit'
                , plural: 'Btus per hour Fahrenheit',
                display: '(Btu/(hr-&#8457;))'
            }
            , to_anchor: 1899.1
        }
    }
    , _anchors: {
        metric: {
            unit: 'J/C'
            , ratio: 1
        }
        , imperial: {
            unit: 'Btu/F'
            , ratio: 1
        }
    }
};
