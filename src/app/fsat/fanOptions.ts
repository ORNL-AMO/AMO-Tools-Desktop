export const FanTypes: Array<{ value: number, display: string }> = [
  {
    value: 0,
    display: 'Airfoil (SISW)'
  },
  {
    value: 1,
    display: 'Backward Curved (SISW)',
  },
  {
    value: 2,
    display: 'Radial (SISW)',
  },
  {
    value: 3,
    display: 'Radial Tip (SISW)',
  },
  {
    value: 4,
    display: 'Backward Inclined (SISW)',
  },
  {
    value: 5,
    display: 'Airfoil (DIDW)',
  },
  {
    value: 6,
    display: 'Backward Curved (DIDW)',
  },
  {
    value: 7,
    display: 'Backward Inclined (DIDW)',
  },
  {
    value: 8,
    display: 'Vane Axel',
  },
  {
    value: 9,
    display: 'Air Handling'
  },
  {
    value: 10,
    display: 'Material Handling'
  },
  {
    value: 11,
    display: 'Long Shavings'
  },
  {
    value: 12,
    display: 'Specified Optimal Efficiency'
  }
]

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
  }
];

export const EfficiencyClasses: Array<{ value: number, display: string }> = [
  {
    value: 0,
    display: 'Standard Efficiency'
  },
  {
    value: 1,
    display: 'Energy Efficient'
  },
  {
    value: 2,
    display: 'Premium Efficient'
  },
  {
    value: 3,
    display: 'Specified'
  }
];