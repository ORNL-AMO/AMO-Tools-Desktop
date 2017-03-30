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

    },
    {
      name: 'Mock PHAST 1',
      type: 'PHAST',
      phast: {
        losses: {
          chargeMaterials: [
            {
              chargeMaterialType: 'Gas',
              gasChargeMaterial: {
                materialName: 'Type 1',
                thermicReactionType: 0,
                specificHeatGas: 0.24,
                feedRate: 1000,
                percentVapor: 15,
                initialTemperature: 80,
                dischargeTemperature: 1150,
                specificHeatVapor: .5,
                percentReacted: 100,
                reactionHeat: 80,
                additionalHeat: 5000
              }
            },
            {
              chargeMaterialType: 'Solid',
              solidChargeMaterial: {
                materialName: 'Type 1',
                thermicReactionType: 1,
                specificHeatSolid: .15,
                latentHeat: 60,
                specificHeatLiquid: .481,
                meltingPoint: 2900,
                chargeFeedRate: 10000,
                waterContentCharged: .1,
                waterContentDischarged: 0.0,
                initialTemperature: 70.0,
                dischargeTemperature: 2200,
                waterVaporDischargeTemperature: 500,
                chargeMelted: 0.0,
                chargeReacted: 1.0,
                reactionHeat: 100,
                additionalHeat: 0
              }
            },
            {
              chargeMaterialType: 'Liquid',
              liquidChargeMaterial: {
                materialName: 'Type 1',
                thermicReactionType: 0,
                specificHeatLiquid: .48,
                vaporizingTemperature: 240,
                latentHeat: 250,
                specificHeatVapor: .25,
                chargeFeedRate: 1000,
                initialTemperature: 70,
                dischargeTemperature: 320,
                percentVaporized: 100,
                percentReacted: 25,
                reactionHeat: 50,
                additionalHeat: 0
              }
            }
          ],
          wallLosses: [
            {
              surfaceArea: 500.0,
              ambientTemperature: 80.0,
              surfaceTemperature: 225.0,
              windVelocity: 10.0,
              surfaceEmissivity: 0.9,
              conditionFactor: 1.394,
              surfaceShape: 'Vertical Plates',
              correctionFactor: 1.0
            },
          ],
          atmosphereLosses: [
            {
              atmosphereGas: 'Test Gas',
              specificHeat: 0.02,
              inletTemperature: 100.0,
              outletTemperature: 1400.0,
              flowRate: 1200.0,
              correctionFactor: 1.0,
            }
          ],
          openingLosses: [
            {
              numberOfOpenings: 1,
              emessivity: .95,
              thickness: 9.0,
              ambientTemperature: 75.0,
              insideTemperature: 1600,
              percentTimeOpen: 100,
              viewFactor: .7,
              openingType: 'Round',
              lengthOfOpening: 12.0,
            }, {
              numberOfOpenings: 1,
              emessivity: .95,
              thickness: 9.0,
              ambientTemperature: 75.0,
              insideTemperature: 1600,
              percentTimeOpen: 20,
              viewFactor: .64,
              openingType: 'Rectangular (Square)',
              lengthOfOpening: 48.0,
              heightOfOpening: 15.0
            }
          ],
          coolingLosses: [
            {
              coolingLossType: 'Other Gas',
              gasCoolingLoss: {
                flowRate: 2500.0,
                initialTemperature: 80.0,
                finalTemperature: 280.0,
                specificHeat: 0.02,
                correctionFactor: 1.0
              }
            },
            {
              coolingLossType: 'Other Gas',
              gasCoolingLoss: {
                flowRate: 600.0,
                initialTemperature: 80.0,
                finalTemperature: 350.0,
                specificHeat: 0.02,
                correctionFactor: 1.0
              }
            },
            {
              coolingLossType: 'Other Liquid',
              liquidCoolingLoss: {
                flowRate: 100.0,
                density: 9.35,
                initialTemperature: 80.0,
                outletTemperature: 210.0,
                specificHeat: .52,
                correctionFactor: 1.0
              }
            },
            {
              coolingLossType: 'Water',
              waterCoolingLoss: {
                flowRate: 100.0,
                initialTemperature: 80.0,
                outletTemperature: 120.0,
                correctionFactor: 1.0
              }
            }
          ],
          fixtureLosses: [
            {
              materialName: 'Material 1',
              specificHeat: 0.122,
              feedRate: 1250.0,
              initialTemperature: 300.0,
              finalTemperature: 1800.0,
              correctionFactor: 1.0
            }
          ],
          leakageLosses: [
            {
              draftPressure: 0.1,
              openingArea: 3.0,
              leakageGasTemperature: 1600.0,
              ambientTemperature: 80.0,
              coefficient: .8052,
              specificGravity: 1.02,
              correctionFactor: 1.0
            }
          ]
        },
      }
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
