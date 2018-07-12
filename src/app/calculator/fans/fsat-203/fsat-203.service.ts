import { Injectable } from '@angular/core';
import { Fan203Inputs, FanRatedInfo, Plane, FanShaftPower, PlaneData } from '../../../shared/models/fans';
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
      includesEvase: [obj.includesEvase, Validators.required],
      upDownStream: [obj.upDownStream, Validators.required],
      traversePlanes: [obj.traversePlanes, Validators.required],
      globalBarometricPressure: [obj.globalBarometricPressure, Validators.required]
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
      includesEvase: form.controls.includesEvase.value,
      upDownStream: form.controls.upDownStream.value,
      traversePlanes: form.controls.traversePlanes.value,
      globalBarometricPressure: form.controls.globalBarometricPressure.value
      //  planarBarometricPressure: form.controls.planarBarometricPressure.value
    }
    return obj;
  }

  getGasDensityFormFromObj(obj: BaseGasDensity): FormGroup {
    let form = this.formBuilder.group({
      inputType: [obj.inputType, Validators.required],
      gasType: [obj.gasType, Validators.required],
      // humidityData: ['Yes', Validators.required],
      conditionLocation: [obj.conditionLocation, Validators.required],
      dryBulbTemp: [obj.dryBulbTemp, Validators.required],
      staticPressure: [obj.staticPressure, Validators.required],
      barometricPressure: [obj.barometricPressure, Validators.required],
      specificGravity: [obj.specificGravity, Validators.required],
      wetBulbTemp: [obj.wetBulbTemp, Validators.required],
      relativeHumidity: [obj.relativeHumidity, Validators.required],
      dewPoint: [obj.dewPoint, Validators.required],
      gasDensity: [obj.gasDensity, Validators.required],
      specificHeatGas: [obj.specificHeatGas]
    })
    return form;
  }

  getGasDensityObjFromForm(form: FormGroup): BaseGasDensity {
    let fanGasDensity: BaseGasDensity = {
      inputType: form.controls.inputType.value,
      gasType: form.controls.gasType.value,
      //  humidityData: form.controls.humidityData.value,
      conditionLocation: form.controls.conditionLocation.value,
      dryBulbTemp: form.controls.dryBulbTemp.value,
      staticPressure: form.controls.staticPressure.value,
      barometricPressure: form.controls.barometricPressure.value,
      specificGravity: form.controls.specificGravity.value,
      wetBulbTemp: form.controls.wetBulbTemp.value,
      relativeHumidity: form.controls.relativeHumidity.value,
      dewPoint: form.controls.dewPoint.value,
      gasDensity: form.controls.gasDensity.value,
      specificHeatGas: form.controls.specificHeatGas.value
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
      powerFactorAtLoad: [obj.powerFactorAtLoad, Validators.required],
      npv: [obj.npv, Validators.required],
      fla: [obj.fla, Validators.required],
      motorShaftPower: [obj.motorShaftPower, Validators.required],
      phase1Voltage: [obj.phase1.voltage],
      phase1Amps: [obj.phase1.amps],
      phase2Voltage: [obj.phase2.voltage],
      phase2Amps: [obj.phase2.amps],
      phase3Voltage: [obj.phase3.voltage],
      phase3Amps: [obj.phase3.amps],
      efficiencyMotor: [obj.efficiencyMotor, [Validators.required, Validators.min(0), Validators.max(100)]],
      efficiencyVFD: [obj.efficiencyVFD, [Validators.required, Validators.min(0), Validators.max(100)]],
      efficiencyBelt: [obj.efficiencyBelt, [Validators.required, Validators.min(0), Validators.max(100)]],
      driveType: [obj.driveType],
      efficiencyClass: [obj.efficiencyClass],
      frequency: [obj.frequency]
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
    obj.motorShaftPower = form.controls.motorShaftPower.value;
    obj.phase1 = {
      voltage: form.controls.phase1Voltage.value,
      amps: form.controls.phase1Amps.value
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
    obj.powerFactorAtLoad = form.controls.powerFactorAtLoad.value;
    obj.driveType = form.controls.driveType.value;
    obj.frequency = form.controls.frequency.value;
    obj.efficiencyClass = form.controls.efficiencyClass.value;
    return obj;
  }


  getPlaneInfoFormFromObj(obj: PlaneData): FormGroup {
    let form = this.formBuilder.group({
      // variationInBarometricPressure: [obj.variationInBarometricPressure, Validators.required],
      // globalBarometricPressure: [obj.globalBarometricPressure, Validators.required],
      // estimate2and5TempFrom1: [obj.estimate2and5TempFrom1, Validators.required],
      totalPressureLossBtwnPlanes1and4: [obj.totalPressureLossBtwnPlanes1and4, Validators.required],
      totalPressureLossBtwnPlanes2and5: [obj.totalPressureLossBtwnPlanes2and5, Validators.required],
      inletSEF: [obj.inletSEF, Validators.required],
      outletSEF: [obj.outletSEF, Validators.required]
    })
    return form;
  }

  getPlaneInfoObjFromForm(form: FormGroup, obj: PlaneData): PlaneData {
    // obj.estimate2and5TempFrom1 = form.controls.estimate2and5TempFrom1.value;
    obj.totalPressureLossBtwnPlanes1and4 = form.controls.totalPressureLossBtwnPlanes1and4.value;
    obj.totalPressureLossBtwnPlanes2and5 = form.controls.totalPressureLossBtwnPlanes2and5.value;
    obj.inletSEF = form.controls.inletSEF.value;
    obj.outletSEF = form.controls.outletSEF.value;
    return obj;

  }

  getMockData(): Fan203Inputs {
    let inputs: Fan203Inputs = {
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
          barometricPressure: undefined,
          numInletBoxes: 0,
          staticPressure: undefined,
          pitotTubeCoefficient: 1,
          pitotTubeType: 'Standard',
          numTraverseHoles: 10,
          numInsertionPoints: 3,
          traverseData: [
            [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]
          ]
        },
        AddlTraversePlanes: [
          {
            planeType: 'Rectangular',
            width: undefined,
            length: undefined,
            area: undefined,
            dryBulbTemp: undefined,
            barometricPressure: undefined,
            numInletBoxes: 0,
            staticPressure: undefined,
            pitotTubeCoefficient: 1,
            pitotTubeType: 'Standard',
            numTraverseHoles: 10,
            numInsertionPoints: 3,
            traverseData: [
              [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
              [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
              [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]
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
        barometricPressure: undefined,
        gasDensity: undefined,
        gasType: 'AIR',
        //Mark Additions
        inputType: 'custom',
        conditionLocation: 4,
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
        efficiencyVFD: undefined,
        efficiencyBelt: undefined,
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
        efficiencyClass: 'Energy Efficient',
        frequency: '60 Hz'
      }
    };

    return inputs;
  }


}
