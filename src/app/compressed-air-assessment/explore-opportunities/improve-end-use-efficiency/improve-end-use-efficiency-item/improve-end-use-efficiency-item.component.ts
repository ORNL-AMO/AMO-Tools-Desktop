import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CompressedAirAssessment, CompressedAirDayType, EndUseEfficiencyItem, ProfileSummary } from '../../../../shared/models/compressed-air-assessment';
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
  baselineProfileSummaries: Array<{ dayType: CompressedAirDayType, profileSummary: Array<ProfileSummary> }>; 

  form: FormGroup;
  dataForms: Array<{ dayTypeName: string, form: FormGroup }>;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private improveEndUseEfficiencyService: ImproveEndUseEfficiencyService) { }

  ngOnInit(): void {
    this.form = this.improveEndUseEfficiencyService.getFormFromObj(this.item);
    this.dataForms = this.improveEndUseEfficiencyService.getDataForms(this.item);
  }

  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('improveEndUseEfficiency');
  }

  save() {
    this.item = this.improveEndUseEfficiencyService.updateObjFromForm(this.form, this.item);
    this.emitSave.emit({ item: this.item, itemIndex: this.itemIndex });
  }

  removeEndUseEfficiency() {
    this.emitRemoveItem.emit(this.itemIndex);
  }

  collapseEfficiency() {
    this.form.controls.collapsed.patchValue(!this.form.controls.collapsed.value);
    this.save();
  }

  changeReductionType(){
    this.save();
    this.dataForms = this.improveEndUseEfficiencyService.getDataForms(this.item);
  }
}
