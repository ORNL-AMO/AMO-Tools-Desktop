import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { FieldMeasurementInputs, PercentLoadEstimationService } from '../percent-load-estimation.service';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-field-measurement-form',
  templateUrl: './field-measurement-form.component.html',
  styleUrls: ['./field-measurement-form.component.css']
})
export class FieldMeasurementFormComponent implements OnInit {
  @Input()
  data: FieldMeasurementInputs;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<FieldMeasurementInputs>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  form: UntypedFormGroup;

  amps: string = 'Amps';
  volts: string = 'Volts';
  constructor(private percentLoadEstimationService: PercentLoadEstimationService) { }

  ngOnInit() {
    this.form = this.percentLoadEstimationService.getFieldMeasurementFormFromObj(this.data);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && !changes.data.firstChange) {
      this.form = this.percentLoadEstimationService.getFieldMeasurementFormFromObj(this.data);
    }
  }
  
  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  calculate() {
    this.data = this.percentLoadEstimationService.getFieldMeasurementObjFromForm(this.form);
    this.emitCalculate.emit(this.data);
  }
}
