import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators, FormBuilder, FormGroup, FormControl, ValidatorFn } from '@angular/forms';
import { ModificationService } from '../../services/modification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TEMPERATURE_HTML } from '../../../shared/app-constants';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';
import { Modification } from '../../../shared/models/process-cooling-assessment';
import { SystemInformationFormService } from '../../system-information/system-information-form.service';

@Component({
  selector: 'app-increase-chilled-temperature',
  standalone: false,
  templateUrl: './increase-chilled-temperature.component.html',
  styleUrl: './increase-chilled-temperature.component.css'
})
export class IncreaseChilledTemperatureComponent implements OnInit {
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private modificationService = inject(ModificationService);
  private processCoolingUiService = inject(ProcessCoolingUiService);
  private systemInformationService = inject(SystemInformationFormService);

  readonly settings = this.processCoolingAssessmentService.settingsSignal;

  private formBuilder: FormBuilder = inject(UntypedFormBuilder);
  private destroyRef = inject(DestroyRef);

  TEMPERATURE_HTML = TEMPERATURE_HTML;

  baselineChilledWaterTemperature: number = this.modificationService.getBaselineExploreOppsValues().increaseChilledWaterTemp.chilledWaterSupplyTemp;
  useOpportunity: boolean;
  form: FormGroup<IncreaseChilledTempForm>;

  ngOnInit(): void {
    // * min comparison vs default - waiting on feedback 2/11
    const validators: ValidatorFn[] = this.systemInformationService.getChilledWaterTemperatureValidators(this.settings(), this.baselineChilledWaterTemperature);
    this.form = this.formBuilder.group({ chilledWaterTemperature: [0, validators] });
    this.observeFormChanges();

    this.modificationService.selectedModification$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((modification: Modification) => {
      if (modification) {
        this.useOpportunity = modification.increaseChilledWaterTemp.useOpportunity;
        this.form.patchValue({ chilledWaterTemperature: modification.increaseChilledWaterTemp.chilledWaterSupplyTemp }, { emitEvent: false });
        this.chilledWaterTemperature.updateValueAndValidity({ emitEvent: false });
      }
    });

  }

  observeFormChanges() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((formValue) => {
      this.modificationService.updateModificationEEM('increaseChilledWaterTemp',
        {
          chilledWaterSupplyTemp: this.form.getRawValue().chilledWaterTemperature,
          useOpportunity: this.useOpportunity
        }
      );
    });
  }

  get chilledWaterTemperature() {
    return this.form.get('chilledWaterTemperature') as FormControl;
  }

  setUseOpportunity() {
    this.modificationService.updateModificationEEM('increaseChilledWaterTemp',
      {
        chilledWaterSupplyTemp: this.form.getRawValue().chilledWaterTemperature,
        useOpportunity: this.useOpportunity
      }
    );
  } 

  focusField(str: string) {
    this.processCoolingUiService.focusedFieldSignal.set(str);
  }


}

export interface IncreaseChilledTempForm {
  chilledWaterTemperature: FormControl<number>;
}

// help
// Increase Chilled Water Temperature

// In certain systems, it may be possible to raise the chilled water temperature without any negative results.
// For example, in some industrial settings chilled water flow is throttled to reduce the flow rate for a particular process.
// Instead of reducing the flow via valve control, significant energy savings may be possible if the full flow is used,
// but at an increased temperature.  In this case, the amount of cooling provided by the chilled water can remain unchanged.
// A new chilled water supply temperature results in new chiller efficiency (kW/ton) for each load point.
//  Raising the chilled water temperature set point 1°F typically saves 1% to 2% of the chiller compressor energy.
