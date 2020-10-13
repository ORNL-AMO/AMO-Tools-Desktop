import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Plane } from '../../../../../../shared/models/fans';
import { Settings } from '../../../../../../shared/models/settings';
import { PlaneDataFormService } from '../plane-data-form.service';
import { ConvertUnitsService } from '../../../../../../shared/convert-units/convert-units.service';
import { FsatService } from '../../../../../../fsat/fsat.service';
import { FanAnalysisService } from '../../../fan-analysis.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fan-data-form',
  templateUrl: './fan-data-form.component.html',
  styleUrls: ['./fan-data-form.component.css']
})
export class FanDataFormComponent implements OnInit {
  @Input()
  planeNum: string;
  @Input()
  planeDescription: string;
  @Input()
  settings: Settings;

  showInternalDimensionModal = false;
  currentDimension: string;
  dataForm: FormGroup;
  velocityData: { pv3: number, percent75Rule: number };
  planeData: Plane;
  resetFormSubscription: Subscription;
  getResultsSubscription: Subscription;
  constructor(private planeDataFormService: PlaneDataFormService, private cd: ChangeDetectorRef, private convertUnitsService: ConvertUnitsService, private fsatService: FsatService, private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.setPlaneData();
    this.dataForm = this.planeDataFormService.getPlaneFormFromObj(this.planeData, this.settings, this.planeNum);
    this.calcArea();
    this.resetFormSubscription = this.fanAnalysisService.resetForms.subscribe(val => {
      if (val == true) {
        this.setPlaneData();
        this.resetData();
      }
    });

    this.getResultsSubscription = this.fanAnalysisService.getResults.subscribe(val => {
      this.setPlaneData();
      this.calcVelocityData();
    });
  }

  ngOnDestroy() {
    this.resetFormSubscription.unsubscribe();
    this.getResultsSubscription.unsubscribe();
  }

  resetData() {
    this.dataForm = this.planeDataFormService.getPlaneFormFromObj(this.planeData, this.settings, this.planeNum);
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

  calcVelocityData() {
    if (this.planeNum == '3a' || this.planeNum == '3b' || this.planeNum == '3c') {
      if (this.dataForm.status === 'VALID') {
        this.velocityData = this.fsatService.getVelocityPressureData(this.planeData, this.settings);
      } else {
        this.velocityData = { pv3: 0, percent75Rule: 0 };
      }
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
    this.calcVelocityData();
    this.fanAnalysisService.setPlane(this.planeNum, this.planeData);
    this.fanAnalysisService.getResults.next(true);
  }

  focusField(str: string) {
    this.fanAnalysisService.currentField.next(str);
  }

  getDisplayUnit(unit: any) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
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
    let controlName = this.currentDimension == 'Width'? 'width': 'length';
    this.dataForm.controls[controlName].patchValue(internalDimension);
    this.closeInternalDimensionModal();
  }
}
