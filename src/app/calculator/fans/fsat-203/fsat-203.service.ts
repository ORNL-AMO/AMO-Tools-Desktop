import { Injectable } from '@angular/core';
import { Fan203Inputs, FanRatedInfo, Plane, FanShaftPower } from '../../../shared/models/fans';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseGasDensity } from '../../../shared/models/fans';

@Injectable()
export class Fsat203Service {

  constructor(private formBuilder: FormBuilder) { }

  getBasicsFormFromObject(obj: FanRatedInfo): FormGroup {
    let form = this.formBuilder.group({
      fanSpeed: [obj.fanSpeed, Validators.required],
      motorSpeed: [obj.motorSpeed, Validators.required],
      fanSpeedCorrected: [obj.fanSpeedCorrected, Validators.required],
      densityCorrected: [obj.densityCorrected, Validators.required],
      pressureBarometricCorrected: [obj.pressureBarometricCorrected, Validators.required],
      driveType: [obj.driveType, Validators.required],
      includesEvase: [obj.includesEvase, Validators.required],
      upDownStream: [obj.upDownStream, Validators.required],
      traversePlanes: [obj.traversePlanes, Validators.required],
      //planarBarometricPressure: [obj.planarBarometricPressure, Validators.required]
    })
    return form;
  }

  getBasicsObjectFromForm(form: FormGroup): FanRatedInfo {
    let obj: FanRatedInfo = {
      fanSpeed: form.controls.fanSpeed.value,
      motorSpeed: form.controls.motorSpeed.value,
      fanSpeedCorrected: form.controls.fanSpeedCorrected.value,
      densityCorrected: form.controls.densityCorrected.value,
      pressureBarometricCorrected: form.controls.pressureBarometricCorrected.value,
      //Mark additions
      driveType: form.controls.driveType.value,
      includesEvase: form.controls.includesEvase.value,
      upDownStream: form.controls.upDownStream.value,
      traversePlanes: form.controls.traversePlanes.value,
      //  planarBarometricPressure: form.controls.planarBarometricPressure.value
    }
    return obj;
  }

  getGasDensityFormFromObj(obj: BaseGasDensity): FormGroup {
    let form = this.formBuilder.group({
      method: [obj.method, Validators.required],
      gasType: [obj.gasType, Validators.required],
      // humidityData: ['Yes', Validators.required],
      conditionLocation: [obj.conditionLocation, Validators.required],
      dryBulbTemp: [obj.dryBulbTemp, Validators.required],
      staticPressure: [obj.staticPressure, Validators.required],
      barometricPressure: [obj.barometricPressure, Validators.required],
      gasSpecificGravity: [obj.gasSpecificGravity, Validators.required],
      wetBulbTemp: [obj.wetBulbTemp, Validators.required],
      relativeHumidity: [obj.relativeHumidity, Validators.required],
      gasDewpointTemp: [obj.gasDewpointTemp, Validators.required],
      gasDensity: [obj.gasDensity, Validators.required],
    })
    return form;
  }

  getGasDensityObjFromForm(form: FormGroup): BaseGasDensity {
    let fanGasDensity: BaseGasDensity = {
      method: form.controls.method.value,
      gasType: form.controls.gasType.value,
      //  humidityData: form.controls.humidityData.value,
      conditionLocation: form.controls.conditionLocation.value,
      dryBulbTemp: form.controls.dryBulbTemp.value,
      staticPressure: form.controls.staticPressure.value,
      barometricPressure: form.controls.barometricPressure.value,
      gasSpecificGravity: form.controls.gasSpecificGravity.value,
      wetBulbTemp: form.controls.wetBulbTemp.value,
      relativeHumidity: form.controls.relativeHumidity.value,
      gasDewpointTemp: form.controls.gasDewpointTemp.value,
      gasDensity: form.controls.gasDensity.value
    }
    return fanGasDensity;
  }


  getTraversePlaneFormFromObj(obj: Plane): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      pitotTubeType: [obj.pitotTubeType, Validators.required],
      pitotTubeCoefficient: [obj.pitotTubeCoefficient, Validators.required],
      numTraverseHoles: [obj.numTraverseHoles, [Validators.required, Validators.min(1), Validators.max(10)]],
      numInsertionPoints: [obj.numInsertionPoints, [Validators.min(1), Validators.max(10)]]
    })
    return form;
  }

  getTraversePlaneObjFromForm(form: FormGroup, planeData: Plane): Plane {
    planeData.pitotTubeType = form.controls.pitotTubeType.value;
    planeData.pitotTubeCoefficient = form.controls.pitotTubeCoefficient.value;
    planeData.numTraverseHoles = form.controls.numTraverseHoles.value;
    planeData.numInsertionPoints = form.controls.numInsertionPoints.value;
    return planeData;
  }

  getPlaneFormFromObj(obj: Plane): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      planeType: [obj.planeType, Validators.required],
      length: [obj.length, Validators.required],
      width: [obj.width, Validators.required],
      area: [obj.area, Validators.required],
      staticPressure: [obj.staticPressure],
      dryBulbTemp: [obj.dryBulbTemp],
      barometricPressure: [obj.barometricPressure],
      numInletBoxes: [obj.numInletBoxes]
    })
    return form;
  }

  getPlaneObjFromForm(form: FormGroup, obj: Plane): Plane {
    obj.planeType = form.controls.planeType.value;
    obj.length = form.controls.length.value;
    obj.width = form.controls.width.value;
    obj.area = form.controls.area.value;
    obj.staticPressure = form.controls.staticPressure.value;
    obj.dryBulbTemp = form.controls.dryBulbTemp.value;
    obj.barometricPressure = form.controls.barometricPressure.value;
    obj.numInletBoxes = form.controls.numInletBoxes.value;
    return obj;
  }
  getShaftPowerFormFromObj(obj: FanShaftPower): FormGroup {
    let form = this.formBuilder.group({
      isMethodOne: [obj.isMethodOne, Validators.required],
      isVFD: [obj.isVFD, Validators.required],
      mainsDataAvailable: [obj.mainsDataAvailable, Validators.required],
      ratedHP: [obj.ratedHP, Validators.required],
      synchronousSpeed: [obj.synchronousSpeed, Validators.required],
      npv: [obj.npv, Validators.required],
      fla: [obj.fla, Validators.required],
      vfdInput: [obj.vfdInput, Validators.required],
      phase1Voltage: [obj.phase1.voltage],
      phase1Amps: [obj.phase1.amps],
      phase1PowerFactor: [obj.phase1.powerFactor, Validators.required],
      phase2Voltage: [obj.phase2.voltage],
      phase2Amps: [obj.phase2.amps],
      phase3Voltage: [obj.phase3.voltage],
      phase3Amps: [obj.phase3.amps],
      efficiencyMotor: [obj.efficiencyMotor, [Validators.required, Validators.min(0), Validators.max(100)]],
      efficiencyVFD: [obj.efficiencyVFD, [Validators.required, Validators.min(0), Validators.max(100)]],
      efficiencyBelt: [obj.efficiencyBelt, [Validators.required, Validators.min(0), Validators.max(100)]],
    })
    return form;
  }

  getShaftPowerObjFromForm(form: FormGroup, obj: FanShaftPower): FanShaftPower {
    obj.isMethodOne = form.controls.isMethodOne.value;
    obj.isVFD = form.controls.isVFD.value;
    obj.mainsDataAvailable = form.controls.mainsDataAvailable.value;
    obj.ratedHP = form.controls.ratedHP.value;
    obj.synchronousSpeed = form.controls.synchronousSpeed.value;
    obj.npv = form.controls.npv.value;
    obj.fla = form.controls.fla.value;
    obj.vfdInput = form.controls.vfdInput.value;
    obj.phase1 = {
      voltage: form.controls.phase1Voltage.value,
      amps: form.controls.phase1Amps.value,
      powerFactor: form.controls.phase1PowerFactor.value
    };
    obj.phase2 = {
      voltage: form.controls.phase2Voltage.value,
      amps: form.controls.phase2Amps.value
    };
    obj.phase3 = {
      voltage: form.controls.phase3Voltage.value,
      amps: form.controls.phase3Amps.value
    };
    obj.efficiencyMotor = form.controls.efficiencyMotor.value;
    obj.efficiencyVFD = form.controls.efficiencyVFD.value;
    obj.efficiencyBelt = form.controls.efficiencyBelt.value;
    obj.powerFactorAtLoad = form.controls.phase1PowerFactor.value;
    return obj;
  }

  getMockData(): Fan203Inputs {
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
        traversePlanes: 2
      },
      PlaneData: {
        plane5upstreamOfPlane2: true,
        totalPressureLossBtwnPlanes1and4: 0,
        totalPressureLossBtwnPlanes2and5: 0.627,
        FanInletFlange: {
          planeType: 'Rectangular',
          width: 143.63,
          length: 32.63,
          area: 781.1078,
          dryBulbTemp: 123,
          barometricPressure: 26.57,
          numInletBoxes: 2
        },
        FanEvaseOrOutletFlange: {
          planeType: 'Rectangular',
          width: 70,
          length: 78,
          area: 455,
          dryBulbTemp: 132.7,
          barometricPressure: 26.57,
          numInletBoxes: 0
        },
        FlowTraverse: {
          planeType: 'Rectangular',
          width: 143.63,
          length: 32.63,
          area: 390.5539,
          dryBulbTemp: 123,
          barometricPressure: 26.57,
          numInletBoxes: 0,
          staticPressure: -18.1,
          pitotTubeCoefficient: 0.87292611371180784,
          pitotTubeType: 'Standard',
          numTraverseHoles: 10,
          numInsertionPoints: 3,
          traverseData: [
            [0.701, 0.703, 0.6675, 0.815, 0.979, 1.09, 1.155, 1.320, 1.578, 2.130],
            [0.690, 0.648, 0.555, 0.760, 0.988, 1.060, 1.100, 1.110, 1.458, 1.865],
            [0.691, 0.621, 0.610, 0.774, 0.747, 0.835, 0.8825, 1.23, 1.210, 1.569]
          ]
        },
        AddlTraversePlanes: [
          {
            planeType: 'Rectangular',
            width: 143.63,
            length: 32.63,
            area: 390.5539,
            dryBulbTemp: 123,
            barometricPressure: 26.57,
            numInletBoxes: 0,
            staticPressure: -17.0,
            pitotTubeCoefficient: 0.87292611371180784,
            pitotTubeType: 'Standard',
            numTraverseHoles: 10,
            numInsertionPoints: 3,
            traverseData: [
              [0.662, 0.568, 0.546, 0.564, 0.463, 0.507, 0.865, 1.017, 1.247, 1.630],
              [0.639, 0.542, 0.530, 0.570, 0.603, 0.750, 0.965, 1.014, 1.246, 1.596],
              [0.554, 0.452, 0.453, 0.581, 0.551, 0.724, 0.844, 1.077, 1.323, 1.620]
            ]
          }
        ],
        InletMstPlane: {
          planeType: 'Rectangular',
          area: 781.1078,
          width: 143.63,
          length: 32.63,
          dryBulbTemp: 123,
          barometricPressure: 26.57,
          staticPressure: -17.55,
          numInletBoxes: 2
        },
        OutletMstPlane: {
          planeType: 'Rectangular',
          area: 279.363,
          width: 55.42,
          length: 60.49,
          dryBulbTemp: 132.7,
          barometricPressure: 26.57,
          staticPressure: 1.8
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
        sumSEF: 0,
        mainsDataAvailable: 'Yes',
        isVFD: 'No',
        ratedHP: 1750,
        synchronousSpeed: 1200,
        npv: 4160,
        fla: 210,
        vfdInput: 10,
        phase1: {
          voltage: 4200,
          amps: 205,
          powerFactor: .88
        },
        phase2: {
          voltage: 4200,
          amps: 205
        },
        phase3: {
          voltage: 4200,
          amps: 205
        }
      }
    };

    return inputs;
  }


}
