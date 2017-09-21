export const volumetricEnergy = {
    metric: {
        kJNm3: {
            name: {
                singular: 'Kilojoule per Normal meter cubed'
                , plural: 'Kilojoules per Normal meter cubed',
                display: '(kJ/Nm&#x00B3;)'
            }
            , to_anchor: 1
        }
    },
    imperial: {
        btuSCF: {
            name: {
                singular: 'Btu per Standard Cubic Foot'
                , plural: 'Btu per Standard Cubic Foot',
                display: '(Btu/SCF)'
            }
            , to_anchor: 37.2586
        }
    }
    , _anchors: {
        metric: {
            unit: 'kJNm3'
            , ratio: 1
        }
        , imperial: {
            unit: 'btuSCF'
            , ratio: 1
        }
    }
}
