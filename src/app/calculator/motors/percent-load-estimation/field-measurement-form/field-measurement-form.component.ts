import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FieldMeasurementInputs, PercentLoadEstimationService } from '../percent-load-estimation.service';
import { FormGroup } from '@angular/forms';

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

  form: FormGroup;

  amps: string = 'Amps';
  volts: string = 'Volts';
  constructor(private percentLoadEstimationService: PercentLoadEstimationService) { }

  ngOnInit() {
    this.form = this.percentLoadEstimationService.getFieldMeasurementFormFromObj(this.data);
  }


  calculate() {
    this.data = this.percentLoadEstimationService.getFieldMeasurementObjFromForm(this.form);
    this.emitCalculate.emit(this.data);
  }
}
