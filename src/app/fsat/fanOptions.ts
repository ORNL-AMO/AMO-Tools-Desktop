declare var Module: any;

export const FanTypes: Array<{ value: number, display: string, enumVal?: any }> = [
  {
    value: 5,
    display: 'Airfoil (DWDI)',
  },
  {
    value: 0,
    display: 'Airfoil (SWSI)',
  },
  {
    value: 6,
    display: 'Backward Curved (DWDI)',
  },
  {
    value: 1,
    display: 'Backward Curved (SWSI)',
  },
  {
    value: 7,
    display: 'Backward Inclined (DWDI)',
  },
  {
    value: 4,
    display: 'Backward Inclined (SWSI)',
  },

  {
    value: 2,
    display: 'Radial (SWSI)',
  },
  {
    value: 3,
    display: 'Radial Tip (SWSI)',
  },
  {
    value: 8,
    display: 'Vane Axial',
  },
  // {
  //   value: 12,
  //   display: 'Specified Optimal Efficiency'
  // }
];

export const Drives: Array<{ value: number, display: string }> = [
  {
    value: 0,
    display: 'Direct Drive'
  },
  {
    value: 1,
    display: 'V-Belt Drive',
  }, {
    value: 2,
    display: 'Notched V-Belt Drive',
  }, {
    value: 3,
    display: 'Synchronous Belt Drive'
  }, {
    value: 4,
    display: 'Specified Efficiency'
  }
];

// export const EfficiencyClasses: Array<{ value: number, display: string }> = [
//   {
//     value: 0,
//     display: 'Standard Efficiency'
//   },
//   {
//     value: 1,
//     display: 'Energy Efficient'
//   },
//   {
//     value: 2,
//     display: 'Premium Efficient'
//   },
//   {
//     value: 3,
//     display: 'Specified'
//   }
// ];
