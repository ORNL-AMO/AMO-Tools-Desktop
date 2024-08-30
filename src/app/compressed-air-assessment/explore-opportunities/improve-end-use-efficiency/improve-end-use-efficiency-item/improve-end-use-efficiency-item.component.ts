import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup, AbstractControl, FormGroup } from '@angular/forms';
import { CompressedAirAssessment, CompressedAirDayType, EndUseEfficiencyItem, ProfileSummary, ProfileSummaryTotal, SystemProfileSetup } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { BaselineResults } from '../../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { ImproveEndUseEfficiencyService } from '../improve-end-use-efficiency.service';

@Component({
  selector: 'app-improve-end-use-efficiency-item',
  templateUrl: './improve-end-use-efficiency-item.component.html',
  styleUrls: ['./improve-end-use-efficiency-item.component.css']
})
export class ImproveEndUseEfficiencyItemComponent implements OnInit {
  @Input()
  item: EndUseEfficiencyItem;
  @Input()
  itemIndex: number;
  @Input()
  numberOfItems: number;
  @Input()
  hourIntervals: Array<number>;
  @Output('emitSave')
  emitSave: EventEmitter<{ item: EndUseEfficiencyItem, itemIndex: number }> = new EventEmitter<{ item: EndUseEfficiencyItem, itemIndex: number }>();
  @Output()
  emitRemoveItem: EventEmitter<number> = new EventEmitter<number>();
  @Input()
  baselineProfileSummaries: Array<{ dayType: CompressedAirDayType, profileSummaryTotals: Array<ProfileSummaryTotal> }>;
  @Input()
  baselineResults: BaselineResults;
  @Input()
  systemProfileSetup: SystemProfileSetup;

  fillRightHourInterval: boolean;

  form: UntypedFormGroup;
  dataForms: Array<{ dayTypeName: string, dayTypeId: string, form: UntypedFormGroup }>;
  hasInvalidForm: boolean;
  settings: Settings;
  numberPipeDecimals: string;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private improveEndUseEfficiencyService: ImproveEndUseEfficiencyService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    if(this.settings.unitsOfMeasure == 'Metric'){
      this.numberPipeDecimals = '1.0-2'
    }else{
      this.numberPipeDecimals = '1.0-0'
    }
    this.form = this.improveEndUseEfficiencyService.getFormFromObj(this.item, this.baselineResults);
    this.dataForms = this.improveEndUseEfficiencyService.getDataForms(this.item, this.baselineProfileSummaries);
    this.setHasInvalidDataForm();
  }

  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('improveEndUseEfficiency');
  }

  save() {
    this.item = this.improveEndUseEfficiencyService.updateObjFromForm(this.form, this.item);
    this.emitSave.emit({ item: this.item, itemIndex: this.itemIndex });
    this.setHasInvalidDataForm();
  }

  removeEndUseEfficiency() {
    this.emitRemoveItem.emit(this.itemIndex);
  }

  collapseEfficiency() {
    this.form.controls.collapsed.patchValue(!this.form.controls.collapsed.value);
    this.save();
  }

  changeReductionType() {
    this.form = this.improveEndUseEfficiencyService.setFormValidators(this.form, this.baselineResults);
    this.save();
    this.dataForms = this.improveEndUseEfficiencyService.getDataForms(this.item, this.baselineProfileSummaries);
  }

  changeAuxiliaryEquipment() {
    this.form = this.improveEndUseEfficiencyService.setFormValidators(this.form, this.baselineResults);
    this.save();
  }

  setHourIntervalState(form: FormGroup, formControlName: string, controlIndex: number) {
    if (this.fillRightHourInterval) {
      let changedValue = form.get(formControlName).value;
      let currentIndex = 0
      for (const [key, value] of Object.entries(form.controls)) {
        if (currentIndex > controlIndex)
        form.get(key).patchValue(changedValue);
        currentIndex++;
      }
    } 
    this.saveDataForm();
  }

  saveDataForm() {
    this.item = this.improveEndUseEfficiencyService.updateDataFromForm(this.dataForms, this.item, this.systemProfileSetup);
    this.emitSave.emit({ item: this.item, itemIndex: this.itemIndex });
    this.setHasInvalidDataForm();
  }

  setHasInvalidDataForm() {
    this.hasInvalidForm = false;
    this.dataForms.forEach(dataForm => {
      if (dataForm.form.invalid) {
        this.hasInvalidForm = true;
      }
    });
  }
}
