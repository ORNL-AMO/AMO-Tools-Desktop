import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlaneData, Plane, FanRatedInfo } from '../../../../../shared/models/fans';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
// import { PlaneRanges } from '../../../fsat-203/fsat-203.service';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../../shared/models/settings';

@Injectable()
export class PlaneDataFormService {

  planeStep: BehaviorSubject<string>;
  planeShape: BehaviorSubject<string>;
  staticPressureValue: BehaviorSubject<number>;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) {
    this.planeStep = new BehaviorSubject<string>('plane-info');
    this.planeShape = new BehaviorSubject<string>(undefined);
    this.staticPressureValue = new BehaviorSubject<number>(undefined);
  }

  getPlaneInfoFormFromObj(obj: PlaneData): FormGroup {
    let form = this.formBuilder.group({
      // variationInBarometricPressure: [obj.variationInBarometricPressure, Validators.required],
      // globalBarometricPressure: [obj.globalBarometricPressure, Validators.required],
      // estimate2and5TempFrom1: [obj.estimate2and5TempFrom1, Validators.required],
      totalPressureLossBtwnPlanes1and4: [obj.totalPressureLossBtwnPlanes1and4, [Validators.required, Validators.min(0)]],
      totalPressureLossBtwnPlanes2and5: [obj.totalPressureLossBtwnPlanes2and5, [Validators.required, Validators.min(0)]],
      inletSEF: [obj.inletSEF, Validators.required],
      outletSEF: [obj.outletSEF, Validators.required],
      variationInBarometricPressure: [obj.variationInBarometricPressure]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getPlaneInfoObjFromForm(form: FormGroup, obj: PlaneData): PlaneData {
    // obj.estimate2and5TempFrom1 = form.controls.estimate2and5TempFrom1.value;
    obj.totalPressureLossBtwnPlanes1and4 = form.controls.totalPressureLossBtwnPlanes1and4.value;
    obj.totalPressureLossBtwnPlanes2and5 = form.controls.totalPressureLossBtwnPlanes2and5.value;
    obj.inletSEF = form.controls.inletSEF.value;
    obj.outletSEF = form.controls.outletSEF.value;
    obj.variationInBarometricPressure = form.controls.variationInBarometricPressure.value;
    return obj;

  }

  getTraversePlaneFormFromObj(obj: Plane): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      pitotTubeType: [obj.pitotTubeType, Validators.required],
      pitotTubeCoefficient: [obj.pitotTubeCoefficient, [Validators.required, Validators.max(1)]],
      numTraverseHoles: [obj.numTraverseHoles, [Validators.required, Validators.min(1), Validators.max(10)]],
      numInsertionPoints: [obj.numInsertionPoints, [Validators.min(1), Validators.max(10)]]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
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
      userDefinedStaticPressure: [obj.userDefinedStaticPressure, [Validators.min(ranges.staticPressureMin), Validators.max(ranges.staticPressureMax)]],
      staticPressure: [obj.staticPressure, [Validators.min(ranges.staticPressureMin), Validators.max(ranges.staticPressureMax)]],
      dryBulbTemp: [obj.dryBulbTemp, [Validators.required, Validators.min(ranges.dryBulbTempMin), Validators.max(ranges.dryBulbTempMax)]],
      barometricPressure: [obj.barometricPressure, [Validators.required, Validators.min(ranges.barPressureMin), Validators.max(ranges.barPressureMax)]],
      numInletBoxes: [obj.numInletBoxes]
    });
    this.setPlaneValidators(form, planeNum, obj.planeType, ranges);
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  setPlaneValidators(form: FormGroup, planeNum: string, planeType: string, ranges: PlaneRanges) {
    //1, 4
    if (planeNum === '1' || planeNum === '4') {
      form.controls.numInletBoxes.setValidators([Validators.required, Validators.min(1)]);
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

    // 3a, 3b, 3c etc
    if (planeNum.includes('3')) {
      form.controls.staticPressure.setValidators([Validators.required, Validators.min(ranges.staticPressureMin), Validators.max(ranges.staticPressureMax)]);
      form.controls.staticPressure.reset(form.controls.staticPressure.value);
      if (form.controls.staticPressure.value) {
        form.controls.staticPressure.markAsDirty();
      }
      form.controls.userDefinedStaticPressure.setValidators([Validators.required, Validators.min(ranges.staticPressureMin), Validators.max(ranges.staticPressureMax)]);
      form.controls.userDefinedStaticPressure.reset(form.controls.userDefinedStaticPressure.value);
      if (form.controls.userDefinedStaticPressure.value) {
        form.controls.userDefinedStaticPressure.markAsDirty();
      }
    } 
  
    if (planeNum === '4' || planeNum === '5') {
      form.controls.staticPressure.setValidators([Validators.required, Validators.min(ranges.staticPressureMin), Validators.max(ranges.staticPressureMax)]);
      form.controls.staticPressure.reset(form.controls.staticPressure.value);
      if (form.controls.staticPressure.value) {
        form.controls.staticPressure.markAsDirty();
      }
    }
    
    //Rectangular
    if (planeType === 'Rectangular') {
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
    };
    if (settings.fanBarometricPressure !== 'inHg') {
      ranges.barPressureMax = this.convertUnitsService.value(ranges.barPressureMax).from('inHg').to(settings.fanBarometricPressure);
      ranges.barPressureMax = Number(ranges.barPressureMax.toFixed(0));
      ranges.barPressureMin = this.convertUnitsService.value(ranges.barPressureMin).from('inHg').to(settings.fanBarometricPressure);
      ranges.barPressureMin = Number(ranges.barPressureMin.toFixed(0));
    }
    if (settings.fanPressureMeasurement !== 'inH2o') {
      ranges.staticPressureMin = this.convertUnitsService.value(ranges.staticPressureMin).from('inH2o').to(settings.fanPressureMeasurement);
      ranges.staticPressureMin = Number(ranges.staticPressureMin.toFixed(0));
      ranges.staticPressureMax = this.convertUnitsService.value(ranges.staticPressureMax).from('inH2o').to(settings.fanPressureMeasurement);
      ranges.staticPressureMax = Number(ranges.staticPressureMax.toFixed(0));
    }
    if (settings.fanTemperatureMeasurement !== 'F') {
      ranges.dryBulbTempMin = this.convertUnitsService.value(ranges.dryBulbTempMin).from('F').to(settings.fanTemperatureMeasurement);
      ranges.dryBulbTempMin = Number(ranges.dryBulbTempMin.toFixed(0));
      ranges.dryBulbTempMax = this.convertUnitsService.value(ranges.dryBulbTempMax).from('F').to(settings.fanTemperatureMeasurement);
      ranges.dryBulbTempMax = Number(ranges.dryBulbTempMax.toFixed(0));
    }
    return ranges;
  }

  getPlaneObjFromForm(form: FormGroup, obj: Plane): Plane {
    obj.planeType = form.controls.planeType.value;
    obj.length = form.controls.length.value;
    obj.width = form.controls.width.value;
    obj.area = form.controls.area.value;
    obj.staticPressure = form.controls.staticPressure.value;
    obj.userDefinedStaticPressure = form.controls.userDefinedStaticPressure.value;
    obj.dryBulbTemp = form.controls.dryBulbTemp.value;
    obj.barometricPressure = form.controls.barometricPressure.value;
    obj.numInletBoxes = form.controls.numInletBoxes.value;
    return obj;
  }


  checkPlaneDataValid(planeData: PlaneData, fanRatedInfo: FanRatedInfo, settings: Settings): boolean {
    let isValid: boolean = true;
    if (planeData !== undefined) {
      //i
      let form: FormGroup = this.getPlaneInfoFormFromObj(planeData);
      if (form.valid == false) {
        isValid = false;
      }
      //1
      form = this.getPlaneFormFromObj(planeData.FanInletFlange, settings, '1');
      if (form.valid == false) {
        isValid = false;
      }
      //2
      form = this.getPlaneFormFromObj(planeData.FanEvaseOrOutletFlange, settings, '2');
      if (form.valid == false) {
        isValid = false;
      }
      //3a
      form = this.getPlaneFormFromObj(planeData.FlowTraverse, settings, '3a');
      if (form.valid == false) {
        isValid = false;
      }
      //3b
      if (fanRatedInfo.traversePlanes > 1) {
        form = this.getPlaneFormFromObj(planeData.AddlTraversePlanes[0], settings, '3b');
        if (form.valid == false) {
          isValid = false;
        }
      }
      //3c
      if (fanRatedInfo.traversePlanes == 3) {
        form = this.getPlaneFormFromObj(planeData.AddlTraversePlanes[1], settings, '3c');
        if (form.valid == false) {
          isValid = false;
        }
      }
      //4
      form = this.getPlaneFormFromObj(planeData.InletMstPlane, settings, '4');
      if (form.valid == false) {
        isValid = false;
      }
      //5
      form = this.getPlaneFormFromObj(planeData.OutletMstPlane, settings, '5');
      if (form.valid == false) {
        isValid = false;
      }
    }else{
      isValid = false;
    }
    return isValid;
  }
}

export interface PlaneRanges {
  staticPressureMin: number;
  staticPressureMax: number;
  barPressureMin: number;
  barPressureMax: number;
  dryBulbTempMin: number;
  dryBulbTempMax: number;
}
