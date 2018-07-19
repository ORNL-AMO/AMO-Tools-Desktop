import { Injectable } from '@angular/core';
import { Fan203Inputs, FanRatedInfo, Plane, FanShaftPower, PlaneData } from '../../../shared/models/fans';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseGasDensity } from '../../../shared/models/fans';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class Fsat203Service {

  planeShape: BehaviorSubject<string>;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) {
    this.planeShape = new BehaviorSubject<string>(undefined);
  }

  getBasicsFormFromObject(obj: FanRatedInfo, settings: Settings): FormGroup {
    let pressureMin: number = 10;
    let pressureMax: number = 60;
    if (settings.fanBarometricPressure != 'inHg') {
      pressureMax = this.convertUnitsService.value(pressureMax).from('inHg').to(settings.fanBarometricPressure);
      pressureMax = Number(pressureMax.toFixed(0))
      pressureMin = this.convertUnitsService.value(pressureMin).from('inHg').to(settings.fanBarometricPressure);
      pressureMin = Number(pressureMin.toFixed(0))
    }
    let form = this.formBuilder.group({
      fanSpeed: [obj.fanSpeed, [Validators.required, Validators.min(0), Validators.max(5000)]],
      motorSpeed: [obj.motorSpeed, [Validators.required, Validators.min(0), Validators.max(3600)]],
      fanSpeedCorrected: [obj.fanSpeedCorrected, [Validators.min(0), Validators.max(5000)]],
      densityCorrected: [obj.densityCorrected, Validators.required],
      pressureBarometricCorrected: [obj.pressureBarometricCorrected, [Validators.required, Validators.min(pressureMin), Validators.max(pressureMax)]],
      includesEvase: [obj.includesEvase, Validators.required],
      upDownStream: [obj.upDownStream],
      traversePlanes: [obj.traversePlanes, Validators.required],
      globalBarometricPressure: [obj.globalBarometricPressure, [Validators.required, Validators.min(pressureMin), Validators.max(pressureMax)]]
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

  getGasDensityFormFromObj(obj: BaseGasDensity, settings: Settings): FormGroup {
    let barPressureMin: number = 10;
    let barPressureMax: number = 60;
    let dryBulbTempMin: number = -100;
    let dryBulbTempMax: number = 1000;
    let staticPressureMin: number = -400;
    let staticPressureMax: number = 400;
    let wetBulbTempMin: number = 32;
    let wetBulbTempMax: number = 1000;
    let dewPointMin: number = -30;
    let dewPointMax: number = 1000;
    let gasDensityMax: number = .2;
    if (settings.fanBarometricPressure != 'inHg') {
      barPressureMax = this.convertUnitsService.value(barPressureMax).from('inHg').to(settings.fanBarometricPressure);
      barPressureMax = Number(barPressureMax.toFixed(0))
      barPressureMin = this.convertUnitsService.value(barPressureMin).from('inHg').to(settings.fanBarometricPressure);
      barPressureMin = Number(barPressureMin.toFixed(0))
    }
    if (settings.fanTemperatureMeasurement != 'F') {
      dryBulbTempMin = this.convertUnitsService.value(dryBulbTempMin).from('F').to(settings.fanTemperatureMeasurement);
      dryBulbTempMin = Number(dryBulbTempMin.toFixed(0))
      dryBulbTempMax = this.convertUnitsService.value(dryBulbTempMax).from('F').to(settings.fanTemperatureMeasurement);
      dryBulbTempMax = Number(dryBulbTempMax.toFixed(0))
      wetBulbTempMin = this.convertUnitsService.value(wetBulbTempMin).from('F').to(settings.fanTemperatureMeasurement);
      wetBulbTempMin = Number(wetBulbTempMin.toFixed(0))
      wetBulbTempMax = this.convertUnitsService.value(wetBulbTempMax).from('F').to(settings.fanTemperatureMeasurement);
      wetBulbTempMax = Number(wetBulbTempMax.toFixed(0))
      dewPointMin = this.convertUnitsService.value(dewPointMin).from('F').to(settings.fanTemperatureMeasurement);
      dewPointMin = Number(dewPointMin.toFixed(0))
      dewPointMax = this.convertUnitsService.value(dewPointMax).from('F').to(settings.fanTemperatureMeasurement);
      dewPointMax = Number(dewPointMax.toFixed(0))
    }
    if (settings.densityMeasurement != 'lbscf') {
      gasDensityMax = this.convertUnitsService.value(gasDensityMax).from('lbscf').to(settings.densityMeasurement);
      gasDensityMax = Number(gasDensityMax.toFixed(0))
    }
    if (settings.fanPressureMeasurement != 'inH2o') {
      staticPressureMin = this.convertUnitsService.value(staticPressureMin).from('inH2o').to(settings.fanPressureMeasurement);
      staticPressureMin = Number(staticPressureMin.toFixed(0))
      staticPressureMax = this.convertUnitsService.value(staticPressureMax).from('inH2o').to(settings.fanPressureMeasurement);
      staticPressureMax = Number(staticPressureMax.toFixed(0))
    }
    let form = this.formBuilder.group({
      inputType: [obj.inputType, Validators.required],
      gasType: [obj.gasType, Validators.required],
      // humidityData: ['Yes', Validators.required],
      conditionLocation: [obj.conditionLocation, Validators.required],
      dryBulbTemp: [obj.dryBulbTemp, [Validators.min(dryBulbTempMin), Validators.max(dryBulbTempMax)]],
      staticPressure: [obj.staticPressure, [Validators.min(staticPressureMin), Validators.max(staticPressureMax)]],
      barometricPressure: [obj.barometricPressure, [Validators.min(barPressureMin), Validators.max(barPressureMax)]],
      specificGravity: [obj.specificGravity, [Validators.min(0), Validators.max(2)]],
      wetBulbTemp: [obj.wetBulbTemp, [Validators.min(wetBulbTempMin), Validators.max(wetBulbTempMax)]],
      relativeHumidity: [obj.relativeHumidity, [Validators.min(0), Validators.max(100)]],
      dewPoint: [obj.dewPoint, [Validators.min(dewPointMin), Validators.max(dewPointMax)]],
      gasDensity: [obj.gasDensity, [Validators.required, Validators.min(0), Validators.max(gasDensityMax)]],
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
      pitotTubeCoefficient: [obj.pitotTubeCoefficient, [Validators.required, Validators.max(1)]],
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

  getPlaneFormFromObj(obj: Plane, settings: Settings): FormGroup {
    let staticPressureMin: number = -400;
    let staticPressureMax: number = 400;
    let barPressureMin: number = 10;
    let barPressureMax: number = 60;
    let dryBulbTempMin: number = -100;
    let dryBulbTempMax: number = 1000;
    if (settings.fanBarometricPressure != 'inHg') {
      barPressureMax = this.convertUnitsService.value(barPressureMax).from('inHg').to(settings.fanBarometricPressure);
      barPressureMax = Number(barPressureMax.toFixed(0))
      barPressureMin = this.convertUnitsService.value(barPressureMin).from('inHg').to(settings.fanBarometricPressure);
      barPressureMin = Number(barPressureMin.toFixed(0))
    }
    if (settings.fanPressureMeasurement != 'inH2o') {
      staticPressureMin = this.convertUnitsService.value(staticPressureMin).from('inH2o').to(settings.fanPressureMeasurement);
      staticPressureMin = Number(staticPressureMin.toFixed(0))
      staticPressureMax = this.convertUnitsService.value(staticPressureMax).from('inH2o').to(settings.fanPressureMeasurement);
      staticPressureMax = Number(staticPressureMax.toFixed(0))
    }
    if (settings.fanTemperatureMeasurement != 'F') {
      dryBulbTempMin = this.convertUnitsService.value(dryBulbTempMin).from('F').to(settings.fanTemperatureMeasurement);
      dryBulbTempMin = Number(dryBulbTempMin.toFixed(0))
      dryBulbTempMax = this.convertUnitsService.value(dryBulbTempMax).from('F').to(settings.fanTemperatureMeasurement);
      dryBulbTempMax = Number(dryBulbTempMax.toFixed(0))
    }
    let form: FormGroup = this.formBuilder.group({
      planeType: [obj.planeType, Validators.required],
      length: [obj.length, [Validators.required, Validators.min(0)]],
      width: [obj.width, [Validators.required, Validators.min(0)]],
      area: [obj.area, [Validators.required, Validators.min(0)]],
      staticPressure: [obj.staticPressure, [Validators.min(staticPressureMin), Validators.max(staticPressureMax)]],
      dryBulbTemp: [obj.dryBulbTemp, [Validators.min(dryBulbTempMin), Validators.max(dryBulbTempMax)]],
      barometricPressure: [obj.barometricPressure, [Validators.min(barPressureMin), Validators.max(barPressureMax)]],
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
      powerFactorAtLoad: [obj.powerFactorAtLoad, [Validators.required, Validators.min(0), Validators.max(1)]],
      npv: [obj.npv, [Validators.required, Validators.min(0), Validators.max(20000)]],
      fla: [obj.fla, Validators.required],
      motorShaftPower: [obj.motorShaftPower, Validators.required],
      phase1Voltage: [obj.phase1.voltage, Validators.min(0)],
      phase1Amps: [obj.phase1.amps, Validators.min(0)],
      phase2Voltage: [obj.phase2.voltage, Validators.min(0)],
      phase2Amps: [obj.phase2.amps, Validators.min(0)],
      phase3Voltage: [obj.phase3.voltage, Validators.min(0)],
      phase3Amps: [obj.phase3.amps, Validators.min(0)],
      efficiencyMotor: [obj.efficiencyMotor, [Validators.required, Validators.min(0), Validators.max(100)]],
      efficiencyVFD: [obj.efficiencyVFD, [Validators.min(0), Validators.max(100)]],
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
      totalPressureLossBtwnPlanes1and4: [obj.totalPressureLossBtwnPlanes1and4, [Validators.required, Validators.min(0)]],
      totalPressureLossBtwnPlanes2and5: [obj.totalPressureLossBtwnPlanes2and5, [Validators.required, Validators.min(0)]],
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
          barometricPressure: 29.92,
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
            barometricPressure: 29.92,
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
        barometricPressure: 29.92,
        gasDensity: .0765,
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
        efficiencyBelt: 1,
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

  getMockDataFilled(): Fan203Inputs {
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
            [.701, .703, .668, .815, .979, 1.09, 1.155, 1.32, 1.579, 2.13],
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
          barometricPressure: 16.57,
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
        conditionLocation: 4,
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
        efficiencyBelt: 1,
        efficiencyClass: "Energy Efficient",
        efficiencyMotor: 100,
        efficiencyVFD: null,
        fla: 210,
        frequency: "60 Hz",
        isMethodOne: false,
        isVFD: "No",
        mainsDataAvailable: "Yes",
        motorShaftPower: 1015.0282712436189,
        npv: 4160,
        phase1: {
          amps: 105,
          voltage: 4200
        },
        phase2: {
          amps: 105,
          voltage: 4200
        }
        ,
        phase3: {
          amps: 105,
          voltage: 4200
        },
        powerFactorAtLoad: 0.99,
        ratedHP: 200,
        sumSEF: 0,
        synchronousSpeed: 1200,
        voltage: 4200
      }
    };

    return inputs;
  }

}
