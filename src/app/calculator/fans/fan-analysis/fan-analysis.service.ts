import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Fan203Inputs, Plane } from '../../../shared/models/fans';

@Injectable()
export class FanAnalysisService {

  inputData: Fan203Inputs;
  getResults: BehaviorSubject<boolean>;
  mainTab: BehaviorSubject<string>;
  stepTab: BehaviorSubject<string>;
  currentField: BehaviorSubject<string>;
  constructor() {
    this.mainTab = new BehaviorSubject<string>('fan-setup');
    this.stepTab = new BehaviorSubject<string>('fan-info');
    this.getResults = new BehaviorSubject<boolean>(true);
    this.currentField = new BehaviorSubject<string>('default');
  }

  getMockData(): Fan203Inputs {
    var area = 143.63 * 32.63 / 144.0;
    let mockData: Fan203Inputs = {
      FanRatedInfo: {
        fanSpeed: 1191,
        motorSpeed: 1191,
        fanSpeedCorrected: 1170,
        densityCorrected: 0.05,
        pressureBarometricCorrected: 26.28,
        globalBarometricPressure: 26.57,
        includesEvase: "Yes",
        traversePlanes: 2,
        upDownStream: "Upstream"
      },
      PlaneData: {
        plane5upstreamOfPlane2: true,
        totalPressureLossBtwnPlanes1and4: 0,
        totalPressureLossBtwnPlanes2and5: 0.627,
        inletSEF: 0,
        outletSEF: 0,
        estimate2and5TempFrom1: false,
        FanInletFlange: {
          area: area * 2,
          length: 143.63,
          dryBulbTemp: 123,
          barometricPressure: 26.57,
          numInletBoxes: 2,
          planeType: "Rectangular",
          staticPressure: null,
          width: 32.63
        },
        FanEvaseOrOutletFlange: {
          area: 70 * 78 / 144.0,
          dryBulbTemp: 132.7,
          barometricPressure: 26.57,

          // area: 37.916666666666664,
          // barometricPressure: 26.57,
          // dryBulbTemp: 132.7,
          length: 70,
          numInletBoxes: 0,
          planeType: "Rectangular",
          staticPressure: null,
          width: 78
        },
        FlowTraverse: {
          area: area,
          dryBulbTemp: 123,
          barometricPressure: 26.57,
          staticPressure: -18.1,
          pitotTubeCoefficient: 0.87292611371180784,
          traverseData: [
            [0.701, 0.703, 0.6675, 0.815, 0.979, 1.09, 1.155, 1.320, 1.578, 2.130],
            [0.690, 0.648, 0.555, 0.760, 0.988, 1.060, 1.100, 1.110, 1.458, 1.865],
            [0.691, 0.621, 0.610, 0.774, 0.747, 0.835, 0.8825, 1.23, 1.210, 1.569]
          ],
          length: 143.63,
          numInletBoxes: 0,
          numInsertionPoints: 3,
          numTraverseHoles: 10,
          pitotTubeType: "S-Type",
          planeType: "Rectangular",
          width: 32.63,
          // traverseData: [
          //   [.701, .703, .668, .815, .979, 1.09, 1.155, 1.32, 1.578, 2.13],
          //   [.69, .648, .555, .76, .988, 1.06, 1.1, 1.11, 1.458, 1.865],
          //   [.691, .621, .61, .774, .747, .835, .883, 1.23, 1.21, 1.569]
          // ]
        },
        AddlTraversePlanes: [
          {
            area: area,
            dryBulbTemp: 123,
            barometricPressure: 26.57,
            staticPressure: -17.0,
            pitotTubeCoefficient: 0.87292611371180784,
            traverseData: [
              [0.662, 0.568, 0.546, 0.564, 0.463, 0.507, 0.865, 1.017, 1.247, 1.630],
              [0.639, 0.542, 0.530, 0.570, 0.603, 0.750, 0.965, 1.014, 1.246, 1.596],
              [0.554, 0.452, 0.453, 0.581, 0.551, 0.724, 0.844, 1.077, 1.323, 1.620]
            ],

            length: 143.63,
            numInletBoxes: 0,
            numInsertionPoints: 3,
            numTraverseHoles: 10,
            pitotTubeType: "S-Type",
            planeType: "Rectangular",
            width: 32.63
          }
        ],
        InletMstPlane: {
          area: area * 2,
          dryBulbTemp: 123,
          barometricPressure: 26.57,
          staticPressure: -17.55,
          length: 143.63,
          numInletBoxes: 2,
          planeType: "Rectangular",
          width: 32.63
        },
        OutletMstPlane: {
          area: (55.42 * 60.49) / 144.0,
          dryBulbTemp: 132.7,
          barometricPressure: 26.57,
          staticPressure: 1.8,
          length: 55.42,
          numInletBoxes: null,
          planeType: "Rectangular",
          width: 60.49,
        }
      },
      BaseGasDensity: {
        dryBulbTemp: 123,
        staticPressure: -17.6,
        barometricPressure: 26.57,
        gasDensity: 0.0547,
        gasType: 'AIR',
        inputType: "wetBulb",
        relativeHumidity: null,
        specificGravity: 1,
        specificHeatGas: 0.24,
        wetBulbTemp: 119
      },
      FanShaftPower: {
        motorShaftPower: (4200 * 205 * 0.88 * Math.sqrt(3)) / 746.0,
        efficiencyMotor: 95,
        efficiencyVFD: 100,
        efficiencyBelt: 100,
        sumSEF: 0,

        amps: 205,
        driveType: "Direct Drive",
        efficiencyClass: 1,
        fla: 210,
        frequency: 60,
        isMethodOne: false,
        isVFD: "No",
        mainsDataAvailable: "Yes",
        // motorShaftPower: 1761.53,
        npv: 4160,
        phase1: {
          amps: 205,
          voltage: 4200
        },
        phase2: {
          amps: 210,
          voltage: 4200
        }
        ,
        phase3: {
          amps: 200,
          voltage: 4200
        },
        powerFactorAtLoad: 0.88,
        ratedHP: 1750,
        synchronousSpeed: 1200,
        voltage: 4200
      }
    };





    let inputs: Fan203Inputs = {
      FanRatedInfo: {
        densityCorrected: 0.05,
        fanSpeed: 1191,
        fanSpeedCorrected: 1170,
        globalBarometricPressure: 26.57,
        includesEvase: "Yes",
        motorSpeed: 1191,
        pressureBarometricCorrected: 26.28,
        traversePlanes: 2,
        upDownStream: "Upstream"
      },
      PlaneData: {
        estimate2and5TempFrom1: false,
        inletSEF: 0,
        outletSEF: 0,
        plane5upstreamOfPlane2: true,
        totalPressureLossBtwnPlanes1and4: 0,
        totalPressureLossBtwnPlanes2and5: 0.627,
        FanInletFlange: {
          area: 65.09231805555557,
          barometricPressure: 26.57,
          dryBulbTemp: 123,
          length: 143.63,
          numInletBoxes: 2,
          planeType: "Rectangular",
          staticPressure: null,
          width: 32.63
        },
        FanEvaseOrOutletFlange: {
          area: 37.916666666666664,
          barometricPressure: 26.57,
          dryBulbTemp: 132.7,
          length: 70,
          numInletBoxes: 0,
          planeType: "Rectangular",
          staticPressure: null,
          width: 78
        },
        FlowTraverse: {
          area: 32.54615902777778,
          barometricPressure: 26.57,
          dryBulbTemp: 123,
          length: 143.63,
          numInletBoxes: 0,
          numInsertionPoints: 3,
          numTraverseHoles: 10,
          pitotTubeCoefficient: 0.87,
          pitotTubeType: "S-Type",
          planeType: "Rectangular",
          staticPressure: -18.1,
          width: 32.63,
          traverseData: [
            [.701, .703, .668, .815, .979, 1.09, 1.155, 1.32, 1.578, 2.13],
            [.69, .648, .555, .76, .988, 1.06, 1.1, 1.11, 1.458, 1.865],
            [.691, .621, .61, .774, .747, .835, .883, 1.23, 1.21, 1.569]
          ]
        },
        AddlTraversePlanes: [
          {
            area: 32.54615902777778,
            barometricPressure: 26.57,
            dryBulbTemp: 123,
            length: 143.63,
            numInletBoxes: 0,
            numInsertionPoints: 3,
            numTraverseHoles: 10,
            pitotTubeCoefficient: 0.87,
            pitotTubeType: "S-Type",
            planeType: "Rectangular",
            staticPressure: -17,
            width: 32.63,
            traverseData: [
              [.662, .568, .546, .564, .463, .507, .865, 1.017, 1.247, 1.63],
              [.639, .542, .53, .57, .603, .75, .965, 1.014, 1.246, 1.596],
              [.554, .452, .453, .581, .551, .724, .844, 1.077, 1.323, 1.62]
            ]
          },
          {
            area: 32.54615902777778,
            barometricPressure: 26.57,
            dryBulbTemp: 123,
            length: 143.63,
            numInletBoxes: 0,
            numInsertionPoints: 3,
            numTraverseHoles: 10,
            pitotTubeCoefficient: 0.86,
            pitotTubeType: "S-Type",
            planeType: "Rectangular",
            staticPressure: -17,
            width: 32.63,
            traverseData: [
              [.662, .568, .546, .564, .463, .507, .865, 1.17, 1.247, 1.63],
              [.639, .542, .53, .57, .603, .75, .965, 1.014, 1.246, 1.596],
              [.554, .452, .453, .581, .551, .724, .844, 1.077, 1.323, 1.62]
            ]
          }
        ],
        InletMstPlane: {
          area: 65.09231805555557,
          barometricPressure: 26.57,
          dryBulbTemp: 123,
          length: 143.63,
          numInletBoxes: 2,
          planeType: "Rectangular",
          staticPressure: -17.55,
          width: 32.63
        },
        OutletMstPlane: {
          area: 23.280248611111112,
          barometricPressure: 26.57,
          dryBulbTemp: 132.7,
          length: 55.42,
          numInletBoxes: null,
          planeType: "Rectangular",
          staticPressure: 1.8,
          width: 60.49,
        }
      },
      BaseGasDensity: {
        barometricPressure: 26.57,
        dewPoint: null,
        dryBulbTemp: 123,
        gasDensity: 0.05972908666857927,
        gasType: "AIR",
        inputType: "wetBulb",
        relativeHumidity: null,
        specificGravity: 1,
        specificHeatGas: 0.24,
        staticPressure: -17.6,
        wetBulbTemp: 119
      },
      FanShaftPower: {
        amps: 205,
        driveType: "Direct Drive",
        efficiencyBelt: 100,
        efficiencyClass: 1,
        efficiencyMotor: 95,
        efficiencyVFD: 100,
        fla: 210,
        frequency: 60,
        isMethodOne: false,
        isVFD: "No",
        mainsDataAvailable: "Yes",
        motorShaftPower: 1761.53,
        npv: 4160,
        phase1: {
          amps: 205,
          voltage: 4200
        },
        phase2: {
          amps: 210,
          voltage: 4200
        }
        ,
        phase3: {
          amps: 200,
          voltage: 4200
        },
        powerFactorAtLoad: 0.88,
        ratedHP: 1750,
        sumSEF: 0,
        synchronousSpeed: 1200,
        voltage: 4200
      }
    };

    return mockData;
  }

  getPlane(planeNum: string): Plane {
    if (planeNum == '1') {
      return this.inputData.PlaneData.FanInletFlange;
    } else if (planeNum == '2') {
      return this.inputData.PlaneData.FanEvaseOrOutletFlange;
    } else if (planeNum == '3a') {
      return this.inputData.PlaneData.FlowTraverse;
    } else if (planeNum == '3b') {
      return this.inputData.PlaneData.AddlTraversePlanes[0];
    } else if (planeNum == '3c') {
      return this.inputData.PlaneData.AddlTraversePlanes[1];
    } else if (planeNum == '4') {
      return this.inputData.PlaneData.InletMstPlane;
    } else if (planeNum == '5') {
      return this.inputData.PlaneData.OutletMstPlane;
    }
  }

  setPlane(planeNum: string, planeData: Plane) {
    if (planeNum == '1') {
      this.inputData.PlaneData.FanInletFlange = planeData;
    } else if (planeNum == '2') {
      this.inputData.PlaneData.FanEvaseOrOutletFlange = planeData;
    } else if (planeNum == '3a') {
      this.inputData.PlaneData.FlowTraverse = planeData;
    } else if (planeNum == '3b') {
      this.inputData.PlaneData.AddlTraversePlanes[0] = planeData;
    } else if (planeNum == '3c') {
      this.inputData.PlaneData.AddlTraversePlanes[1] = planeData;
    } else if (planeNum == '4') {
      this.inputData.PlaneData.InletMstPlane = planeData;
    } else if (planeNum == '5') {
      this.inputData.PlaneData.OutletMstPlane = planeData;
    }
  }
}
