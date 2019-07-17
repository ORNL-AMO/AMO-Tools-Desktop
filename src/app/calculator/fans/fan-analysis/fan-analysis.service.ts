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
              [.662, .568, .546, .564, .463, .507, .865, 1.17, 1.247, 1.63],
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
        amps: 105,
        driveType: "Direct Drive",
        efficiencyBelt: 100,
        efficiencyClass: 1,
        efficiencyMotor: 99,
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

    return inputs;
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
