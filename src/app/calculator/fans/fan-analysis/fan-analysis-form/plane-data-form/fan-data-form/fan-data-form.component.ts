import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Plane } from '../../../../../../shared/models/fans';
import { Settings } from '../../../../../../shared/models/settings';
import { PlaneDataFormService } from '../plane-data-form.service';
import { ConvertUnitsService } from '../../../../../../shared/convert-units/convert-units.service';
import { FanAnalysisService } from '../../../fan-analysis.service';
import { Subscription } from 'rxjs';
import { FsatService } from '../../../../../../fsat/fsat.service';

@Component({
    selector: 'app-fan-data-form',
    templateUrl: './fan-data-form.component.html',
    styleUrls: ['./fan-data-form.component.css'],
    standalone: false
})
export class FanDataFormComponent implements OnInit, OnDestroy {
  @Input()
  planeNum: string;
  @Input()
  planeDescription: string;
  @Input()
  settings: Settings;

  showInternalDimensionModal = false;
  currentDimension: string;
  dataForm: UntypedFormGroup;
  planeData: Plane;
  resetFormSubscription: Subscription;
  getResultsSubscription: Subscription;
  staticPressureValueSubscription: Subscription;
  variationInBarometricPressure: boolean;

  constructor(private planeDataFormService: PlaneDataFormService, private fsatService: FsatService, private convertUnitsService: ConvertUnitsService, private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    if (this.fanAnalysisService.inputData.PlaneData) {
      this.variationInBarometricPressure = this.fanAnalysisService.inputData.PlaneData.variationInBarometricPressure;
    }
    this.setPlaneData();
    this.dataForm = this.planeDataFormService.getPlaneFormFromObj(this.planeData, this.settings, this.planeNum);
    this.calcArea();
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.resetFormSubscription.unsubscribe();
    this.getResultsSubscription.unsubscribe();
    if (this.planeNum.includes('3')) {
      this.staticPressureValueSubscription.unsubscribe();
    }
  }

  initSubscriptions() {
    this.resetFormSubscription = this.fanAnalysisService.resetForms.subscribe(val => {
      if (val == true) {
        this.setPlaneData();
        this.resetData();
      }
    });

    this.getResultsSubscription = this.fanAnalysisService.getResults.subscribe(val => {
      this.setPlaneData();
      this.calcVelocityResults();
    });

    if (this.planeNum.includes('3')) {
      this.staticPressureValueSubscription = this.planeDataFormService.staticPressureValue.subscribe(staticPressureControlValue => {
        if (staticPressureControlValue != undefined) { 
          this.dataForm.patchValue({
            staticPressure: staticPressureControlValue,
            userDefinedStaticPressure: staticPressureControlValue
          });
          this.save();
        }
      });
    }

  }

  resetData() {
    this.planeDataFormService.staticPressureValue.next(undefined);
  }

  setPlaneData() {
    this.planeData = this.fanAnalysisService.getPlane(this.planeNum);
  }

  calcArea() {
    let tmpData: Plane = this.planeDataFormService.getPlaneObjFromForm(this.dataForm, this.planeData);
    this.planeDataFormService.planeShape.next(tmpData.planeType);
    if (tmpData.planeType === 'Rectangular') {
      let tmpArea = tmpData.length * tmpData.width;
      if (tmpData.numInletBoxes) {
        tmpArea = tmpArea * tmpData.numInletBoxes;
      }
      tmpArea = this.convertArea(tmpArea);
      this.dataForm.patchValue({
        'area': tmpArea
      });
    } else if (tmpData.planeType === 'Circular') {
      let tmpArea = (Math.PI / 4) * (tmpData.length * tmpData.length);
      if (tmpData.numInletBoxes) {
        tmpArea = tmpArea * tmpData.numInletBoxes;
      }
      tmpArea = this.convertArea(tmpArea);
      this.dataForm.patchValue({
        'area': tmpArea
      });
    }
    this.save();
  }

  calcVelocityResults() {
    // update validation from staticPressure in traverse-planes
    let tempForm = this.planeDataFormService.getPlaneFormFromObj(this.planeData, this.settings, this.planeNum);
    if (tempForm.valid && (this.planeNum == '3a' || this.planeNum == '3b' || this.planeNum == '3c')) {
      this.fanAnalysisService.calculateVelocityResults(this.planeData, this.settings);
    }
  }

  convertArea(area: number): number {
    if (this.settings.fanFlowRate === 'ft3/min') {
      return this.convertUnitsService.value(area).from('in2').to('ft2');
    } else if (this.settings.fanFlowRate === 'm3/s') {
      return this.convertUnitsService.value(area).from('mm2').to('m2');
    }
  }

  save() {
    this.planeData = this.planeDataFormService.getPlaneObjFromForm(this.dataForm, this.planeData);
    this.fanAnalysisService.setPlane(this.planeNum, this.planeData);
    this.fanAnalysisService.getResults.next(true);
  }

  focusField(str: string) {
    this.fanAnalysisService.currentField.next(str);
  }

  openInternalDimensionModal(dimension: string) {
    this.showInternalDimensionModal = true;
    this.currentDimension = dimension;
    this.fanAnalysisService.modalOpen.next(this.showInternalDimensionModal);
  }

  closeInternalDimensionModal() {
    this.showInternalDimensionModal = false;
    this.fanAnalysisService.modalOpen.next(this.showInternalDimensionModal)
  }

  setInternalDimensionAndClose(internalDimension: number) {
    let controlName = this.currentDimension == 'Width' ? 'width' : 'length';
    this.dataForm.controls[controlName].patchValue(internalDimension);
    this.closeInternalDimensionModal();
  }
}
