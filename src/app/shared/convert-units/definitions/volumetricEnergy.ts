export const volumetricEnergy = {
    metric: {
        kJNm3: {
            name: {
                singular: 'Kilojoule per Normal meter cubed'
                , plural: 'Kilojoules per Normal meter cubed',
                display: '(kJ/Nm&#x00B3;)'
            }
            , to_anchor: 1
        },
        MJNm3: {
            name: {
                singular: 'Megajoule per Normal meter cubed'
                , plural: 'Megajoules per Normal meter cubed',
                display: '(MJ/Nm&#x00B3;)'
            }
            , to_anchor: 1 / 1000
        }
    },
    imperial: {
        btuscf: {
            name: {
                singular: 'Btu per Standard Cubic Foot'
                , plural: 'Btu per Standard Cubic Foot',
                display: '(Btu/scf)'
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
            unit: 'btuscf'
            , ratio: 1
        }
    }
};
