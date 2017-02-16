import { Directory } from '../models/directory';
export const MockAssessments: Directory = {
  name: 'Root Directory',
  collapsed: false,
  date: new Date(),
  psat: [
    {
      assessment: {
        name: 'Mock PSAT 1',
        type: 'PSAT'
      }
    },{
      assessment: {
        name: 'Mock PSAT 2',
        type: 'PSAT'
      }
    }
  ],
  subDirectory: [
    {
      name: 'Mock Directory 2',
      collapsed: true,
      date: new Date(),
      psat: [
        {
          assessment: {
            name: 'Mock PSAT 3',
            type: 'PSAT'
          }
        },{
          assessment: {
            name: 'Mock PSAT 4',
            type: 'PSAT'
          }
        }
      ]
    },
    {
      name: 'Mock Directory 3',
      collapsed: true,
      date: new Date(),
      psat: [
        {
          assessment: {
            name: 'Mock PSAT 4',
            type: 'PSAT'
          }
        },{
          assessment: {
            name: 'Mock PSAT 5',
            type: 'PSAT'
          }
        }
      ]
    },
  ]
}
