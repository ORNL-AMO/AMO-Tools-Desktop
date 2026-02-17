import { Component, DestroyRef, inject, OnInit, Signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModificationService } from '../../services/modification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Modification } from '../../../shared/models/process-cooling-assessment';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';
import { Settings } from '../../../shared/models/settings';
import { TEMPERATURE_HTML } from '../../../shared/app-constants';
import { SystemInformationFormService } from '../../system-information/system-information-form.service';
import { DecreaseCondenserWaterTempForm, ExploreOpportunitiesFormService } from '../../services/explore-opportunities-form.service';

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
  private systemInformationService = inject(SystemInformationFormService);


  readonly settings: Signal<Settings> = this.processCoolingAssessmentService.settingsSignal;

  private exploreOpportunitiesFormService = inject(ExploreOpportunitiesFormService);
  private destroyRef = inject(DestroyRef);  

  TEMPERATURE_HTML = TEMPERATURE_HTML;

  baselineCondenserWaterTemperature: number;
  useOpportunity: boolean;
  isOpportunityDisabled: boolean;
  form: FormGroup<DecreaseCondenserWaterTempForm>;

  ngOnInit(): void {
    const baselineValues = this.modificationService.getBaselineExploreOppsValues();
    this.baselineCondenserWaterTemperature = baselineValues.decreaseCondenserWaterTemp.condenserWaterTemp;
    this.form = this.exploreOpportunitiesFormService.getDecreaseCondenserWaterTempForm(this.baselineCondenserWaterTemperature,this.settings());
    this.observeFormChanges();
    this.modificationService.selectedModification$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((modification: Modification) => {
      if (modification) {
        this.useOpportunity = modification.decreaseCondenserWaterTemp.useOpportunity;
        this.isOpportunityDisabled = modification.useSlidingCondenserWaterTemp.useOpportunity === true;
        this.form.patchValue({ condenserWaterTemperature: modification.decreaseCondenserWaterTemp.condenserWaterTemp }, { emitEvent: false });
        this.condenserWaterTemperature.updateValueAndValidity({ emitEvent: false });
      }
    });

  }

  setUseOpportunity() {
    this.modificationService.updateModificationEEM('decreaseCondenserWaterTemp', {
      condenserWaterTemp: this.form.getRawValue().condenserWaterTemperature,
      useOpportunity: this.useOpportunity
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
        useOpportunity: this.useOpportunity
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

