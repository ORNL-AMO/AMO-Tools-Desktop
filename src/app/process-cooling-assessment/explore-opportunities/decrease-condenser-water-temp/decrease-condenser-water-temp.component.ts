import { Component, DestroyRef, inject, OnInit, Signal } from '@angular/core';
import { UntypedFormBuilder, Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ModificationService } from '../../services/modification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Modification } from '../../../shared/models/process-cooling-assessment';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';
import { Settings } from '../../../shared/models/settings';
import { TEMPERATURE_HTML } from '../../../shared/app-constants';

@Component({
  selector: 'app-decrease-condenser-water-temp',
  standalone: false,
  templateUrl: './decrease-condenser-water-temp.component.html',
  styleUrl: './decrease-condenser-water-temp.component.css'
})
export class DecreaseCondenserWaterTempComponent implements OnInit {
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private modificationService = inject(ModificationService);
  private processCoolingUiService = inject(ProcessCoolingUiService);

  readonly settings: Signal<Settings> = this.processCoolingAssessmentService.settingsSignal;

  private formBuilder: FormBuilder = inject(UntypedFormBuilder);
  private destroyRef = inject(DestroyRef);  

  TEMPERATURE_HTML = TEMPERATURE_HTML;

  baselineCondenserWaterTemperature: number = this.modificationService.getBaselineValues().decreaseCondenserWaterTemp.condenserWaterTemp;
  form: FormGroup<DecreaseCondenserWaterTempForm>;

  ngOnInit(): void {
    this.form = this.formBuilder.group({ condenserWaterTemperature: [0, [Validators.required]] });
    this.observeFormChanges();

    this.modificationService.selectedModification$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((modification: Modification) => {
      if (modification) {
          this.form.patchValue({ condenserWaterTemperature: modification.decreaseCondenserWaterTemp.condenserWaterTemp }, { emitEvent: false });
          this.condenserWaterTemperature.setValidators([
              Validators.required,
              Validators.max(this.baselineCondenserWaterTemperature),
          ]);
          this.condenserWaterTemperature.updateValueAndValidity({ emitEvent: false });
      }
    });

  }

  observeFormChanges() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((formValue) => {
      this.modificationService.updateModificationEEM(
      'decreaseCondenserWaterTemp', 
      {
        condenserWaterTemp: this.form.getRawValue().condenserWaterTemperature,
        useOpportunity: true
      }
    );
    });
  }

  get condenserWaterTemperature() {
    return this.form.get('condenserWaterTemperature');
  }

   focusField(str: string) {
    this.processCoolingUiService.focusedFieldSignal.set(str);
  }


}

export interface DecreaseCondenserWaterTempForm {
  condenserWaterTemperature: FormControl<number>;
}


//  help

// Decrease Condenser Water Temperature

// NOTE: When selecting to decrease the condenser water temperature, using a sliding condenser water temperature cannot be used and vice versa.

// Lowering the condenser temperature results in less energy required in the compression cycle.
//  In water cooled systems, lowering the temperature is accomplished by increasing the speed of the cooling
//  tower fans or by increasing the number of cooling tower fans running, both of which increase cooling tower energy usage.
//  In air-cooled systems, lowering the condenser temperature is accomplished by operating the cooling fans more frequently.
//  There is a greater potential for condenser temperature reduction in water cooled systems since the condenser cooling water
//  temperature leaving the tower approaches the ambient wet-bulb while the air-cooled temperature approaches the outdoor
//  dry-bulb temperature.  At typical design conditions, a chiller will consume five to ten times as much energy as
//  the cooling tower and therefore trading increased cooling tower energy for more efficient chiller operation is frequently justified.