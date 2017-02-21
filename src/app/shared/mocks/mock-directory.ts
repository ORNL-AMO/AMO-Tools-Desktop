import { Directory } from '../models/directory';

export const MockDirectory: Directory = {
  name: 'Root Directory',
  collapsed: false,
  date: new Date(),
  assessments: [
    {
      name: 'Mock PSAT 1',
      type: 'PSAT'
    },{
      name: 'Mock PHAST 1',
      type: 'PHAST'
    }
  ],
  subDirectory: [
    {
      name: 'Mock Directory 2',
      collapsed: true,
      date: new Date(),
      assessments: [
        {
          name: 'Mock PSAT 2',
          type: 'PSAT'

        },
        {
          name: 'Mock PSAT 3',
          type: 'PSAT'
        }
      ]
    },
    {
      name: 'Mock Directory 3',
      collapsed: true,
      date: new Date(),
      assessments: [
        {
            name: 'Mock PHAST 2',
            type: 'PHAST'

        },{
            name: 'Mock PSAT 4',
            type: 'PSAT'
        }
      ]
    },
  ]
}
