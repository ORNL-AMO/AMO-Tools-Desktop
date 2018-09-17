import { Injectable } from '@angular/core';
import { Fan203Inputs, FanRatedInfo, Plane, FanShaftPower, PlaneData } from '../../../shared/models/fans';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseGasDensity } from '../../../shared/models/fans';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class Fsat203Service {

  inputData: Fan203Inputs;
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
      fanSpeedCorrected: [obj.fanSpeedCorrected, [Validators.required, Validators.min(0), Validators.max(5000)]],
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
    let ranges: GasDensityRanges = this.getGasDensityRanges(settings);
    let form = this.formBuilder.group({
      inputType: [obj.inputType, Validators.required],
      gasType: [obj.gasType, Validators.required],
      // humidityData: ['Yes', Validators.required],
      conditionLocation: [obj.conditionLocation, Validators.required],
      dryBulbTemp: [obj.dryBulbTemp, [Validators.min(ranges.dryBulbTempMin), Validators.max(ranges.dryBulbTempMax)]],
      staticPressure: [obj.staticPressure, [Validators.min(ranges.staticPressureMin), Validators.max(ranges.staticPressureMax)]],
      barometricPressure: [obj.barometricPressure, [Validators.min(ranges.barPressureMin), Validators.max(ranges.barPressureMax)]],
      specificGravity: [obj.specificGravity, [Validators.min(0), Validators.max(2)]],
      wetBulbTemp: [obj.wetBulbTemp, [Validators.min(ranges.wetBulbTempMin), Validators.max(ranges.wetBulbTempMax)]],
      relativeHumidity: [obj.relativeHumidity, [Validators.min(0), Validators.max(100)]],
      dewPoint: [obj.dewPoint, [Validators.min(ranges.dewPointMin), Validators.max(ranges.dewPointMax)]],
      gasDensity: [obj.gasDensity, [Validators.required, Validators.min(0), Validators.max(ranges.gasDensityMax)]],
      specificHeatGas: [obj.specificHeatGas]
    })
    this.setCustomValidators(form, ranges)
    this.setRelativeHumidityValidators(form);
    this.setWetBulbValidators(form, ranges);
    this.setDewPointValidators(form, ranges);
    this.setCustomValidators(form, ranges);
    return form;
  }

  getGasDensityRanges(settings: Settings): GasDensityRanges {
    let ranges: GasDensityRanges = {
      barPressureMin: 10,
      barPressureMax: 60,
      dryBulbTempMin: -100,
      dryBulbTempMax: 1000,
      staticPressureMin: -400,
      staticPressureMax: 400,
      wetBulbTempMin: 32,
      wetBulbTempMax: 1000,
      dewPointMin: -30,
      dewPointMax: 1000,
      gasDensityMax: .2
    }
    if (settings.fanBarometricPressure != 'inHg') {
      ranges.barPressureMax = this.convertUnitsService.value(ranges.barPressureMax).from('inHg').to(settings.fanBarometricPressure);
      ranges.barPressureMax = Number(ranges.barPressureMax.toFixed(0))
      ranges.barPressureMin = this.convertUnitsService.value(ranges.barPressureMin).from('inHg').to(settings.fanBarometricPressure);
      ranges.barPressureMin = Number(ranges.barPressureMin.toFixed(0))
    }
    if (settings.fanTemperatureMeasurement != 'F') {
      ranges.dryBulbTempMin = this.convertUnitsService.value(ranges.dryBulbTempMin).from('F').to(settings.fanTemperatureMeasurement);
      ranges.dryBulbTempMin = Number(ranges.dryBulbTempMin.toFixed(0))
      ranges.dryBulbTempMax = this.convertUnitsService.value(ranges.dryBulbTempMax).from('F').to(settings.fanTemperatureMeasurement);
      ranges.dryBulbTempMax = Number(ranges.dryBulbTempMax.toFixed(0))
      ranges.wetBulbTempMin = this.convertUnitsService.value(ranges.wetBulbTempMin).from('F').to(settings.fanTemperatureMeasurement);
      ranges.wetBulbTempMin = Number(ranges.wetBulbTempMin.toFixed(0))
      ranges.wetBulbTempMax = this.convertUnitsService.value(ranges.wetBulbTempMax).from('F').to(settings.fanTemperatureMeasurement);
      ranges.wetBulbTempMax = Number(ranges.wetBulbTempMax.toFixed(0))
      ranges.dewPointMin = this.convertUnitsService.value(ranges.dewPointMin).from('F').to(settings.fanTemperatureMeasurement);
      ranges.dewPointMin = Number(ranges.dewPointMin.toFixed(0))
      ranges.dewPointMax = this.convertUnitsService.value(ranges.dewPointMax).from('F').to(settings.fanTemperatureMeasurement);
      ranges.dewPointMax = Number(ranges.dewPointMax.toFixed(0))
    }
    if (settings.densityMeasurement != 'lbscf') {
      ranges.gasDensityMax = this.convertUnitsService.value(ranges.gasDensityMax).from('lbscf').to(settings.densityMeasurement);
      ranges.gasDensityMax = Number(ranges.gasDensityMax.toFixed(0))
    }
    if (settings.fanPressureMeasurement != 'inH2o') {
      ranges.staticPressureMin = this.convertUnitsService.value(ranges.staticPressureMin).from('inH2o').to(settings.fanPressureMeasurement);
      ranges.staticPressureMin = Number(ranges.staticPressureMin.toFixed(0))
      ranges.staticPressureMax = this.convertUnitsService.value(ranges.staticPressureMax).from('inH2o').to(settings.fanPressureMeasurement);
      ranges.staticPressureMax = Number(ranges.staticPressureMax.toFixed(0))
    }
    return ranges;
  }

  setCustomValidators(form: FormGroup, ranges: GasDensityRanges) {
    if (form.controls.inputType.value == 'custom') {
      //dryBulbTemp
      form.controls.dryBulbTemp.setValidators([Validators.min(ranges.dryBulbTempMin), Validators.max(ranges.dryBulbTempMax)]);
      form.controls.dryBulbTemp.reset(form.controls.dryBulbTemp.value);
      if (form.controls.dryBulbTemp.value) {
        form.controls.dryBulbTemp.markAsDirty();
      }
      //staticPressure
      form.controls.staticPressure.setValidators([Validators.min(ranges.staticPressureMin), Validators.max(ranges.staticPressureMax)]);
      form.controls.staticPressure.reset(form.controls.staticPressure.value);
      if (form.controls.staticPressure.value) {
        form.controls.staticPressure.markAsDirty();
      }
      //barometricPressure
      form.controls.barometricPressure.setValidators([Validators.min(ranges.barPressureMin), Validators.max(ranges.barPressureMax)]);
      form.controls.barometricPressure.reset(form.controls.barometricPressure.value);
      if (form.controls.barometricPressure.value) {
        form.controls.barometricPressure.markAsDirty();
      }
      //specificGravity
      form.controls.specificGravity.setValidators([Validators.min(0), Validators.max(2)]);
      form.controls.specificGravity.reset(form.controls.specificGravity.value);
      if (form.controls.specificGravity.value) {
        form.controls.specificGravity.markAsDirty();
      }
    } else {
      //set required
      //dryBulbTemp
      form.controls.dryBulbTemp.setValidators([Validators.required, Validators.min(ranges.dryBulbTempMin), Validators.max(ranges.dryBulbTempMax)]);
      form.controls.dryBulbTemp.reset(form.controls.dryBulbTemp.value);
      if (form.controls.dryBulbTemp.value) {
        form.controls.dryBulbTemp.markAsDirty();
      }
      //staticPressure
      form.controls.staticPressure.setValidators([Validators.required, Validators.min(ranges.staticPressureMin), Validators.max(ranges.staticPressureMax)]);
      form.controls.staticPressure.reset(form.controls.staticPressure.value);
      if (form.controls.staticPressure.value) {
        form.controls.staticPressure.markAsDirty();
      }
      //barometricPressure
      form.controls.barometricPressure.setValidators([Validators.required, Validators.min(ranges.barPressureMin), Validators.max(ranges.barPressureMax)]);
      form.controls.barometricPressure.reset(form.controls.barometricPressure.value);
      if (form.controls.barometricPressure.value) {
        form.controls.barometricPressure.markAsDirty();
      }
      //specificGravity
      form.controls.specificGravity.setValidators([Validators.required, Validators.min(0), Validators.max(2)]);
      form.controls.specificGravity.reset(form.controls.specificGravity.value);
      if (form.controls.specificGravity.value) {
        form.controls.specificGravity.markAsDirty();
      }
    }
  }

  setRelativeHumidityValidators(form: FormGroup) {
    if (form.controls.inputType.value == 'relativeHumidity') {
      form.controls.relativeHumidity.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      form.controls.relativeHumidity.reset(form.controls.relativeHumidity.value);
      if (form.controls.relativeHumidity.value) {
        form.controls.relativeHumidity.markAsDirty();
      }
    } else {
      form.controls.relativeHumidity.setValidators([Validators.min(0), Validators.max(100)]);
      form.controls.relativeHumidity.reset(form.controls.relativeHumidity.value);
      if (form.controls.relativeHumidity.value) {
        form.controls.relativeHumidity.markAsDirty();
      }
    }
  }

  setWetBulbValidators(form: FormGroup, ranges: GasDensityRanges) {
    if (form.controls.inputType.value == 'wetBulb') {
      form.controls.wetBulbTemp.setValidators([Validators.required, Validators.min(ranges.wetBulbTempMin), Validators.max(ranges.wetBulbTempMax)]);
      form.controls.wetBulbTemp.reset(form.controls.wetBulbTemp.value);
      if (form.controls.wetBulbTemp.value) {
        form.controls.wetBulbTemp.markAsDirty();
      }
      form.controls.specificHeatGas.setValidators([Validators.required]);
      form.controls.specificHeatGas.reset(form.controls.specificHeatGas.value);
      if (form.controls.specificHeatGas.value) {
        form.controls.specificHeatGas.markAsDirty();
      }
    } else {
      form.controls.wetBulbTemp.setValidators([Validators.min(ranges.wetBulbTempMin), Validators.max(ranges.wetBulbTempMax)]);
      form.controls.wetBulbTemp.reset(form.controls.wetBulbTemp.value);
      if (form.controls.wetBulbTemp.value) {
        form.controls.wetBulbTemp.markAsDirty();
      }
      form.controls.specificHeatGas.setValidators([]);
      form.controls.specificHeatGas.reset(form.controls.specificHeatGas.value);
      if (form.controls.specificHeatGas.value) {
        form.controls.specificHeatGas.markAsDirty();
      }
    }
  }

  setDewPointValidators(form: FormGroup, ranges: GasDensityRanges) {
    if (form.controls.inputType.value == 'dewPoint') {
      form.controls.dewPoint.setValidators([Validators.required, Validators.min(ranges.dewPointMin), Validators.max(ranges.dewPointMax)]);
      form.controls.dewPoint.reset(form.controls.dewPoint.value);
      if (form.controls.dewPoint.value) {
        form.controls.dewPoint.markAsDirty();
      }
    } else {
      form.controls.dewPoint.setValidators([Validators.min(ranges.dewPointMin), Validators.max(ranges.dewPointMax)]);
      form.controls.dewPoint.reset(form.controls.dewPoint.value);
      if (form.controls.dewPoint.value) {
        form.controls.dewPoint.markAsDirty();
      }
    }
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

  getPlaneFormFromObj(obj: Plane, settings: Settings, planeNum: string): FormGroup {
    let ranges: PlaneRanges = this.getPlaneRanges(settings);
    let form: FormGroup = this.formBuilder.group({
      planeType: [obj.planeType, Validators.required],
      length: [obj.length, [Validators.required, Validators.min(0)]],
      width: [obj.width, [Validators.required, Validators.min(0)]],
      area: [obj.area, [Validators.required, Validators.min(0)]],
      staticPressure: [obj.staticPressure, [Validators.min(ranges.staticPressureMin), Validators.max(ranges.staticPressureMax)]],
      dryBulbTemp: [obj.dryBulbTemp, [Validators.required, Validators.min(ranges.dryBulbTempMin), Validators.max(ranges.dryBulbTempMax)]],
      barometricPressure: [obj.barometricPressure, [Validators.required, Validators.min(ranges.barPressureMin), Validators.max(ranges.barPressureMax)]],
      numInletBoxes: [obj.numInletBoxes]
    })
    this.setPlaneValidators(form, planeNum, obj.planeType, ranges);
    return form;
  }

  setPlaneValidators(form: FormGroup, planeNum: string, planeType: string, ranges: PlaneRanges) {
    //1, 4
    if (planeNum == '1' || planeNum == '4') {
      form.controls.numInletBoxes.setValidators([Validators.required]);
      form.controls.numInletBoxes.reset(form.controls.numInletBoxes.value);
      if (form.controls.numInletBoxes.value) {
        form.controls.numInletBoxes.markAsDirty();
      }
    } else {
      form.controls.numInletBoxes.setValidators([]);
      form.controls.numInletBoxes.reset(form.controls.numInletBoxes.value);
      if (form.controls.numInletBoxes.value) {
        form.controls.numInletBoxes.markAsDirty();
      }
    }

    //!1 !2
    if (planeNum != '1' && planeNum != '2') {
      form.controls.staticPressure.setValidators([Validators.required, Validators.min(ranges.staticPressureMin), Validators.max(ranges.staticPressureMax)]);
      form.controls.staticPressure.reset(form.controls.staticPressure.value);
      if (form.controls.staticPressure.value) {
        form.controls.staticPressure.markAsDirty();
      }
    } else {
      form.controls.staticPressure.setValidators([Validators.min(ranges.staticPressureMin), Validators.max(ranges.staticPressureMax)]);
      form.controls.staticPressure.reset(form.controls.staticPressure.value);
      if (form.controls.staticPressure.value) {
        form.controls.staticPressure.markAsDirty();
      }
    }

    //Rectangular
    if (planeType == 'Rectangular') {
      form.controls.width.setValidators([Validators.required, Validators.min(0)]);
      form.controls.width.reset(form.controls.width.value);
      if (form.controls.width.value) {
        form.controls.width.markAsDirty();
      }
    } else {
      form.controls.width.setValidators([Validators.min(0)]);
      form.controls.width.reset(form.controls.width.value);
      if (form.controls.width.value) {
        form.controls.width.markAsDirty();
      }
    }
  }

  getPlaneRanges(settings: Settings): PlaneRanges {
    let ranges: PlaneRanges = {
      staticPressureMin: -400,
      staticPressureMax: 400,
      barPressureMin: 10,
      barPressureMax: 60,
      dryBulbTempMin: -100,
      dryBulbTempMax: 1000
    }
    if (settings.fanBarometricPressure != 'inHg') {
      ranges.barPressureMax = this.convertUnitsService.value(ranges.barPressureMax).from('inHg').to(settings.fanBarometricPressure);
      ranges.barPressureMax = Number(ranges.barPressureMax.toFixed(0))
      ranges.barPressureMin = this.convertUnitsService.value(ranges.barPressureMin).from('inHg').to(settings.fanBarometricPressure);
      ranges.barPressureMin = Number(ranges.barPressureMin.toFixed(0))
    }
    if (settings.fanPressureMeasurement != 'inH2o') {
      ranges.staticPressureMin = this.convertUnitsService.value(ranges.staticPressureMin).from('inH2o').to(settings.fanPressureMeasurement);
      ranges.staticPressureMin = Number(ranges.staticPressureMin.toFixed(0))
      ranges.staticPressureMax = this.convertUnitsService.value(ranges.staticPressureMax).from('inH2o').to(settings.fanPressureMeasurement);
      ranges.staticPressureMax = Number(ranges.staticPressureMax.toFixed(0))
    }
    if (settings.fanTemperatureMeasurement != 'F') {
      ranges.dryBulbTempMin = this.convertUnitsService.value(ranges.dryBulbTempMin).from('F').to(settings.fanTemperatureMeasurement);
      ranges.dryBulbTempMin = Number(ranges.dryBulbTempMin.toFixed(0))
      ranges.dryBulbTempMax = this.convertUnitsService.value(ranges.dryBulbTempMax).from('F').to(settings.fanTemperatureMeasurement);
      ranges.dryBulbTempMax = Number(ranges.dryBulbTempMax.toFixed(0))
    }
    return ranges;
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

  getDefaultData(): Fan203Inputs {
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
        efficiencyClass: 'Energy Efficient',
        frequency: '60 Hz'
      }
    };

    return inputs;
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
            [.662, .568, .546, .564, .463, .507, .865, 1.17, 1.247, 1.63],
            [.639, .542, .53, .57, .603, .75, .965, 1.014, 1.246, 1.596],
            [.554, .452, .453, .581, .551, .724, .844, 1.077, 1.323, 1.62]
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
        efficiencyBelt: 100,
        efficiencyClass: "Energy Efficient",
        efficiencyMotor: 100,
        efficiencyVFD: 100,
        fla: 210,
        frequency: "60 Hz",
        isMethodOne: false,
        isVFD: "Yes",
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
  getOriginalMockData(): Fan203Inputs {
    return {
      FanRatedInfo: {
        fanSpeed: 1191,
        motorSpeed: 1191,
        fanSpeedCorrected: 1170,
        densityCorrected: 0.05,
        pressureBarometricCorrected: 26.28,
        //Mark additions
        includesEvase: 'Yes',
        upDownStream: 'Upstream',
        traversePlanes: 2,
        globalBarometricPressure: 26.57,
      },
      PlaneData: {
        plane5upstreamOfPlane2: true,
        totalPressureLossBtwnPlanes1and4: 0,
        totalPressureLossBtwnPlanes2and5: 0.627,
        inletSEF: 0,
        outletSEF: 0,
        //  variationInBarometricPressure: true,
        // globalBarometricPressure: 26.57,
        estimate2and5TempFrom1: false,
        FanInletFlange: {
          planeType: 'Rectangular',
          width: 143.63,
          length: 32.63,
          area: 69.0923,
          dryBulbTemp: 123,
          barometricPressure: 26.57,
          numInletBoxes: 2
        },
        FanEvaseOrOutletFlange: {
          planeType: 'Rectangular',
          width: 70,
          length: 78,
          area: 37.9167,
          dryBulbTemp: 132.7,
          barometricPressure: 26.57,
          numInletBoxes: 0
        },
        FlowTraverse: {
          planeType: 'Rectangular',
          width: 143.63,
          length: 32.63,
          area: 32.5462,
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
            area: 32.5462,
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
          area: 65.0923,
          width: 143.63,
          length: 32.63,
          dryBulbTemp: 123,
          barometricPressure: 26.57,
          staticPressure: -17.55,
          numInletBoxes: 2
        },
        OutletMstPlane: {
          planeType: 'Rectangular',
          area: 23.2802,
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
        inputType: 'relativeHumidity',
        conditionLocation: 4,
        //Method 2 variables
        specificGravity: 1,
        wetBulbTemp: 119,
        relativeHumidity: 0,
        dewPoint: 0,
        specificHeatGas: .24
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
        motorShaftPower: 1312340,
        phase1: {
          voltage: 4200,
          amps: 205
        },
        phase2: {
          voltage: 4200,
          amps: 205
        },
        phase3: {
          voltage: 4200,
          amps: 205
        },
        driveType: 'Direct Drive',
        efficiencyClass: 'Standard Efficiency',
        frequency: '50 Hz'
      }
    };
  }
}


export interface GasDensityRanges {
  barPressureMin: number;
  barPressureMax: number;
  dryBulbTempMin: number;
  dryBulbTempMax: number;
  staticPressureMin: number;
  staticPressureMax: number;
  wetBulbTempMin: number;
  wetBulbTempMax: number;
  dewPointMin: number;
  dewPointMax: number;
  gasDensityMax: number;
}


export interface PlaneRanges {
  staticPressureMin: number,
  staticPressureMax: number,
  barPressureMin: number,
  barPressureMax: number,
  dryBulbTempMin: number,
  dryBulbTempMax: number
}