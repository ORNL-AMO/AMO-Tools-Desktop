export const frequency = {
  frequency: {
          Hz: {
            name: {
              singular: 'Hertz'
              , plural: 'Hertz' ,
              display:  '(Hz)'
            }
            , to_anchor: 1 / 1000000000000
          }
          , KHz: {
            name: {
              singular: 'Kilohertz'
              , plural: 'Kilohertz' ,
              display:  '(KHz)'
            }
            , to_anchor: 1 / 1000000000
          }
          , MHz: {
            name: {
              singular: 'Megahertz'
              , plural: 'Megahertz' ,
              display:  '(MHz)'
            }
            , to_anchor: 1 / 1000000
          }
          , GHz: {
            name: {
              singular: 'Gigahertz'
              , plural: 'Gigahertz' ,
              display:  '(GHz)'
            }
            , to_anchor: 1 / 1000
          }
          , THz: {
            name: {
              singular: 'Terahertz'
              , plural: 'Terahertz' ,
              display:  '(THz)'
            }
            , to_anchor: 1
          }
  }

          , _anchors: {
    frequency: {
      unit: 'Thz'
      , ratio: 1
    }
  }
}

