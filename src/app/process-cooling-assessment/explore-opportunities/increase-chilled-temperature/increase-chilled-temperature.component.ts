import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ModificationService } from '../../services/modification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TEMPERATURE_HTML } from '../../../shared/app-constants';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-assessment.service';
import { Modification } from '../../../shared/models/process-cooling-assessment';
import { ExploreOpportunitiesFormService, IncreaseChilledTempForm } from '../../services/explore-opportunities-form.service';

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
  private exploreOpportunitiesFormService = inject(ExploreOpportunitiesFormService);

  readonly settings = this.processCoolingAssessmentService.settingsSignal;
  private destroyRef = inject(DestroyRef);

  TEMPERATURE_HTML = TEMPERATURE_HTML;
  baselineChilledWaterTemperature: number = this.modificationService.getBaselineExploreOppsValues().increaseChilledWaterTemp.chilledWaterSupplyTemp;
  useOpportunity: boolean;
  form: FormGroup<IncreaseChilledTempForm>;

  ngOnInit(): void {
    this.form = this.exploreOpportunitiesFormService.getIncreaseChilledTempForm(this.baselineChilledWaterTemperature, this.settings());
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
