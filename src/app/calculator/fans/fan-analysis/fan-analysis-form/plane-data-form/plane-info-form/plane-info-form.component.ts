import { Component, OnInit, Input } from '@angular/core';
import { PlaneData } from '../../../../../../shared/models/fans';
import { Settings } from '../../../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { ConvertUnitsService } from '../../../../../../shared/convert-units/convert-units.service';
import { PlaneDataFormService } from '../plane-data-form.service';
import { FanAnalysisService } from '../../../fan-analysis.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-plane-info-form',
  templateUrl: './plane-info-form.component.html',
  styleUrls: ['./plane-info-form.component.css']
})
export class PlaneInfoFormComponent implements OnInit {
  @Input()
  settings: Settings;

  planeInfoForm: FormGroup;
  sumSEF: number;
  resetFormSubscription: Subscription;
  constructor(private planeDataFormService: PlaneDataFormService, private convertUnitsService: ConvertUnitsService, private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.getSum(this.fanAnalysisService.inputData.PlaneData);
    this.planeInfoForm = this.planeDataFormService.getPlaneInfoFormFromObj(this.fanAnalysisService.inputData.PlaneData);
    this.resetFormSubscription = this.fanAnalysisService.resetForms.subscribe(val => {
      if (val == true) {
        this.resetData();
      }
    })
  }

  ngOnDestroy() {
    this.resetFormSubscription.unsubscribe();
  }

  resetData() {
    this.planeInfoForm = this.planeDataFormService.getPlaneInfoFormFromObj(this.fanAnalysisService.inputData.PlaneData);
  }
  focusField(str: string) {
    this.fanAnalysisService.currentField.next(str);
  }

  getSum(planeData: PlaneData) {
    this.sumSEF = planeData.inletSEF + planeData.outletSEF;
  }
  save() {
    this.fanAnalysisService.inputData.PlaneData = this.planeDataFormService.getPlaneInfoObjFromForm(this.planeInfoForm, this.fanAnalysisService.inputData.PlaneData);
    this.getSum(this.fanAnalysisService.inputData.PlaneData);
    this.fanAnalysisService.getResults.next(true);
  }

  getDisplayUnit(unit: any) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }
}
