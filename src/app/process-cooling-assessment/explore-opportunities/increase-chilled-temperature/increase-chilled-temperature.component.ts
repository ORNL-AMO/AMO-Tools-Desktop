import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormBuilder } from '@angular/forms';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';

@Component({
  selector: 'app-increase-chilled-temperature',
  standalone: false,
  templateUrl: './increase-chilled-temperature.component.html',
  styleUrl: './increase-chilled-temperature.component.css'
})
export class IncreaseChilledTemperatureComponent implements OnInit {
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private formBuilder: FormBuilder = inject(UntypedFormBuilder);

  baselineChilledWaterTemperature = this.processCoolingAssessmentService.processCoolingSignal().systemInformation.operations.chilledWaterSupplyTemp;
  form: UntypedFormGroup;

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.formBuilder.group({
      chilledWaterTemperature: [null, [Validators.required, Validators.min(this.baselineChilledWaterTemperature), Validators.max(100)]]
    });
  }

}
