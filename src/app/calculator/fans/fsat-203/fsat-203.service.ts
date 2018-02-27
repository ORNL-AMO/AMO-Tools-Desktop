import { Injectable } from '@angular/core';
import { Fan203Inputs } from '../../../shared/models/fans';

@Injectable()
export class Fsat203Service {

  constructor() { }




  getMockData(): any {
    let inputs: Fan203Inputs = {
      FanRatedInfo: {
        fanSpeed: 1191,
        motorSpeed: 1191,
        fanSpeedCorrected: 1170,
        densityCorrected: 0.05,
        pressureBarometricCorrected: 26.28,
        //Mark additions
        driveType: 'Direct Drive',
        includesEvase: 'Yes',
        upDownStream: 'Upstream',
        traversePlanes: 1
      },
      PlaneData: {
        plane5upstreamOfPlane2: true,
        totalPressureLossBtwnPlanes1and4: 0,
        totalPressureLossBtwnPlanes2and5: 0.627,
        FanInletFlange: {
          width: 143.63,
          length: 32.63,
          tdx: 123,
          pbx: 26.57,
          noInletBoxes: 2
        },
        FanEvaseOrOutletFlange: {
          width: 70,
          length: 78,
          tdx: 132.7,
          pbx: 26.57
          // noInletBoxes isn't necessary, will default to 1
        },
        FlowTraverse: {
          width: 143.63,
          length: 32.63,
          tdx: 123,
          pbx: 26.57,
          psx: -18.1,
          pitotTubeCoefficient: 0.87292611371180784,
          traverseData: [
            [0.701, 0.703, 0.6675, 0.815, 0.979, 1.09, 1.155, 1.320, 1.578, 2.130],
            [0.690, 0.648, 0.555, 0.760, 0.988, 1.060, 1.100, 1.110, 1.458, 1.865],
            [0.691, 0.621, 0.610, 0.774, 0.747, 0.835, 0.8825, 1.23, 1.210, 1.569]
          ]
        },
        AddlTraversePlanes: [
          {
            width: 143.63,
            length: 32.63,
            tdx: 123,
            pbx: 26.57,
            psx: -17.0,
            pitotTubeCoefficient: 0.87292611371180784,
            traverseData: [
              [0.662, 0.568, 0.546, 0.564, 0.463, 0.507, 0.865, 1.017, 1.247, 1.630],
              [0.639, 0.542, 0.530, 0.570, 0.603, 0.750, 0.965, 1.014, 1.246, 1.596],
              [0.554, 0.452, 0.453, 0.581, 0.551, 0.724, 0.844, 1.077, 1.323, 1.620]
            ]
          }
        ],
        InletMstPlane: {
          width: 143.63,
          length: 32.63,
          tdx: 123,
          pbx: 26.57,
          psx: -17.55,
          noInletBoxes: 2
        },
        OutletMstPlane: {
          width: 55.42,
          length: 60.49,
          tdx: 132.7,
          pbx: 26.57,
          psx: 1.8
          // noInletBoxes not provided here.. defaults to 1
        }
      },
      BaseGasDensity: {
        dryBulbTemp: 123,
        staticPressure: -17.6,
        barometricPressure: 26.57,
        gasDensity: 0.0547,
        gasType: 'AIR',
        //Mark Additions
        method: 'Relative Humidity %',
        conditionLocation: 4,
        //Method 2 variables
        gasSpecificGravity: 1,
        wetBulbTemp: 119,
        relativeHumidity: 0,
        gasDewpointTemp: 0,
      },
      FanShaftPower: {
        isMethodOne: false,
        voltage: 4200,
        amps: 205,
        powerFactorAtLoad: 0.88,
        efficiencyMotor: 95,
        efficiencyVFD: 100,
        efficiencyBelt: 100,
        sumSEF: 0
      }
    };

    return inputs;
  }


}
