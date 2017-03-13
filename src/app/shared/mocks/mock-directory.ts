import { Directory } from '../models/directory';

export const MockDirectory: Directory = {
  name: 'Root Directory',
  collapsed: false,
  date: new Date(),
  assessments: [
    {
      name: 'Mock PSAT 1',
      type: 'PSAT',
      psat:
      {
        inputs: {
          pump_style: null,
          pump_specified: null,
          pump_rated_speed: null,
          drive: null,
          kinematic_viscosity: null,
          specific_gravity: null,
          stages: null,
          fixed_speed: null,
          line_frequency: null,
          motor_rated_power: null,
          motor_rated_speed: null,
          efficiency_class: null,
          efficiency: null,
          motor_rated_voltage: null,
          load_estimation_method: null,
          motor_rated_flc: null,
          full_load_amps: null,
          margin: null,
          operating_fraction: null,
          flow_rate: null,
          head: null,
          motor_field_power: null,
          motor_field_current: null,
          motor_field_voltage: null
        },
        savings: 10000,
        selected: false,
        optimizationRating: 80,
      }

    }, {
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
          type: 'PSAT',
          psat:
          {
            inputs: {
              pump_style: null,
              pump_specified: null,
              pump_rated_speed: null,
              drive: null,
              kinematic_viscosity: null,
              specific_gravity: null,
              stages: null,
              fixed_speed: null,
              line_frequency: null,
              motor_rated_power: null,
              motor_rated_speed: null,
              efficiency_class: null,
              efficiency: null,
              motor_rated_voltage: null,
              load_estimation_method: null,
              motor_rated_flc: null,
              full_load_amps: null,
              margin: null,
              operating_fraction: null,
              flow_rate: null,
              head: null,
              motor_field_power: null,
              motor_field_current: null,
              motor_field_voltage: null,
            },
            savings: 10000,
            selected: false,
            optimizationRating: 80
          }


        },
        {
          name: 'Mock PSAT 3',
          type: 'PSAT',
          psat:
          {
            inputs: {
              pump_style: null,
              pump_specified: null,
              pump_rated_speed: null,
              drive: null,
              kinematic_viscosity: null,
              specific_gravity: null,
              stages: null,
              fixed_speed: null,
              line_frequency: null,
              motor_rated_power: null,
              motor_rated_speed: null,
              efficiency_class: null,
              efficiency: null,
              motor_rated_voltage: null,
              load_estimation_method: null,
              motor_rated_flc: null,
              full_load_amps: null,
              margin: null,
              operating_fraction: null,
              flow_rate: null,
              head: null,
              motor_field_power: null,
              motor_field_current: null,
              motor_field_voltage: null
            },
            savings: 10000,
            selected: false,
            optimizationRating: 80,
          }

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

        }, {
          name: 'Mock PSAT 4',
          type: 'PSAT',
          psat: [
            {
              inputs: {
                pump_style: null,
                pump_specified: null,
                pump_rated_speed: null,
                drive: null,
                kinematic_viscosity: null,
                specific_gravity: null,
                stages: null,
                fixed_speed: null,
                line_frequency: null,
                motor_rated_power: null,
                motor_rated_speed: null,
                efficiency_class: null,
                efficiency: null,
                motor_rated_voltage: null,
                load_estimation_method: null,
                motor_rated_flc: null,
                full_load_amps: null,
                margin: null,
                operating_fraction: null,
                flow_rate: null,
                head: null,
                motor_field_power: null,
                motor_field_current: null,
                motor_field_voltage: null,
                savings: 10000,
                selected: false,
                optimizationRating: 80
              }
            }
          ]
        }
      ]
    },
  ]
}
