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
  resetForms: BehaviorSubject<boolean>;
  updateTraverseData: BehaviorSubject<boolean>;
  inAssessmentModal: boolean;
  pressureCalcResultType: string = 'static';
  constructor() {
    this.mainTab = new BehaviorSubject<string>('fan-setup');
    this.stepTab = new BehaviorSubject<string>('fan-info');
    this.getResults = new BehaviorSubject<boolean>(true);
    this.currentField = new BehaviorSubject<string>('default');
    this.resetForms = new BehaviorSubject<boolean>(false);
    this.updateTraverseData = new BehaviorSubject<boolean>(false);
  }

  getDefaultData(): Fan203Inputs {
    let data: Fan203Inputs = {
      FanRatedInfo: {
        fanSpeed: undefined,
        motorSpeed: undefined,
        fanSpeedCorrected: undefined,
        densityCorrected: 0.0765,
        pressureBarometricCorrected: 29.92,
        //Mark additions
        includesEvase: 'Yes',
        upDownStream: 'Upstream',
        traversePlanes: 2,
        globalBarometricPressure: 29.92
      },
      PlaneData: {
        plane5upstreamOfPlane2: true,
        totalPressureLossBtwnPlanes1and4: undefined,
        totalPressureLossBtwnPlanes2and5: undefined,
        inletSEF: undefined,
        outletSEF: undefined,
        //  variationInBarometricPressure: true,
        // globalBarometricPressure: 29.92,
        estimate2and5TempFrom1: false,
        FanInletFlange: {
          planeType: 'Rectangular',
          width: undefined,
          length: undefined,
          area: undefined,
          dryBulbTemp: undefined,
          barometricPressure: 29.92,
          numInletBoxes: 1
        },
        FanEvaseOrOutletFlange: {
          planeType: 'Rectangular',
          width: undefined,
          length: undefined,
          area: undefined,
          dryBulbTemp: undefined,
          barometricPressure: 29.92,
          numInletBoxes: 0
        },
        FlowTraverse: {
          planeType: 'Rectangular',
          width: undefined,
          length: undefined,
          area: undefined,
          dryBulbTemp: undefined,
          barometricPressure: 29.92,
          numInletBoxes: 0,
          staticPressure: undefined,
          pitotTubeCoefficient: 1,
          pitotTubeType: 'Standard',
          numTraverseHoles: 10,
          numInsertionPoints: 3,
          traverseData: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          ]
        },
        AddlTraversePlanes: [
          {
            planeType: 'Rectangular',
            width: undefined,
            length: undefined,
            area: undefined,
            dryBulbTemp: undefined,
            barometricPressure: 29.92,
            numInletBoxes: 0,
            staticPressure: undefined,
            pitotTubeCoefficient: 1,
            pitotTubeType: 'Standard',
            numTraverseHoles: 10,
            numInsertionPoints: 3,
            traverseData: [
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
          },
          {
            planeType: 'Rectangular',
            width: undefined,
            length: undefined,
            area: undefined,
            dryBulbTemp: undefined,
            barometricPressure: 29.92,
            numInletBoxes: 0,
            staticPressure: undefined,
            pitotTubeCoefficient: 1,
            pitotTubeType: 'Standard',
            numTraverseHoles: 10,
            numInsertionPoints: 3,
            traverseData: [
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
          }
        ],
        InletMstPlane: {
          planeType: 'Rectangular',
          area: undefined,
          width: undefined,
          length: undefined,
          dryBulbTemp: undefined,
          barometricPressure: 29.92,
          staticPressure: undefined,
          numInletBoxes: 0
        },
        OutletMstPlane: {
          planeType: 'Rectangular',
          area: undefined,
          width: undefined,
          length: undefined,
          dryBulbTemp: undefined,
          barometricPressure: 29.92,
          staticPressure: undefined
        }
      },
      BaseGasDensity: {
        dryBulbTemp: undefined,
        staticPressure: undefined,
        barometricPressure: 29.92,
        gasDensity: .0765,
        gasType: 'AIR',
        //Mark Additions
        inputType: 'custom',
        //Method 2 variables
        specificGravity: undefined,
        wetBulbTemp: undefined,
        relativeHumidity: undefined,
        dewPoint: undefined,
        specificHeatGas: .24
      },
      FanShaftPower: {
        isMethodOne: false,
        voltage: undefined,
        amps: undefined,
        powerFactorAtLoad: 0.99,
        efficiencyMotor: undefined,
        efficiencyVFD: 100,
        efficiencyBelt: 100,
        sumSEF: 0,
        mainsDataAvailable: 'Yes',
        isVFD: 'No',
        ratedHP: 200,
        synchronousSpeed: undefined,
        npv: undefined,
        fla: undefined,
        motorShaftPower: undefined,
        phase1: {
          voltage: undefined,
          amps: undefined
        },
        phase2: {
          voltage: undefined,
          amps: undefined
        },
        phase3: {
          voltage: undefined,
          amps: undefined
        },
        driveType: 'Direct Drive',
        efficiencyClass: 1,
        frequency: 60
      }
    };
    return data;
  }

  getExampleData(): Fan203Inputs {
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
          width: 32.63
        },
        AddlTraversePlanes: [
          {
            area: area,
            dryBulbTemp: 123,
            barometricPressure: 26.57,
            staticPressure: -17.0,
            pitotTubeCoefficient: 0.87,
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
        motorShaftPower: 1759.17,
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
