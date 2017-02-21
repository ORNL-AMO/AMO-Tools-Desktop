import { Directory } from '../models/directory';
export const MockDirectory: Directory = {
  name: 'Root Directory',
  collapsed: false,
  date: new Date(),
  assessments: [
    {
      name: 'Mock PSAT 1'
    },{
      name: 'Mock PSAT 2'
    }
  ],
  subDirectory: [
    {
      name: 'Mock Directory 2',
      collapsed: true,
      date: new Date(),
      assessments: [
        {
          name: 'Mock PSAT 3',

        },
        {
          name: 'Mock PSAT 4',
        }
      ]
    },
    {
      name: 'Mock Directory 3',
      collapsed: true,
      date: new Date(),
      assessments: [
        {
            name: 'Mock PSAT 4',
        },{
            name: 'Mock PSAT 5',
        }
      ]
    },
  ]
}
