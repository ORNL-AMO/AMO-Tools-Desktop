import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormBuilder, FormGroup, FormControl, ValidatorFn } from '@angular/forms';
import { ModificationService } from '../../services/modification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TEMPERATURE_HTML } from '../../../shared/app-constants';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';
import { Modification } from '../../../shared/models/process-cooling-assessment';
import { SystemInformationFormService } from '../../system-information/system-information-form.service';
import { ExploreOpportunitiesFormService } from '../../services/explore-opportunities-form.service';

@Component({
  selector: 'app-sliding-condenser-water-temperature',
  standalone: false,
  templateUrl: './sliding-condenser-water-temperature.component.html',
  styleUrl: './sliding-condenser-water-temperature.component.css'
})
export class SlidingCondenserWaterTemperatureComponent implements OnInit {
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private modificationService = inject(ModificationService);
  private processCoolingUiService = inject(ProcessCoolingUiService);
  private systemInformationService = inject(SystemInformationFormService);

  readonly settings = this.processCoolingAssessmentService.settingsSignal;

  private exploreOpportunitiesFormService = inject(ExploreOpportunitiesFormService);
  private destroyRef = inject(DestroyRef);

  TEMPERATURE_HTML = TEMPERATURE_HTML;

  baselineFollowingTempDifferential: number;
  useOpportunity: boolean;
  isOpportunityDisabled: boolean;

  form: FormGroup<SlidingCondenserWaterTempForm>;

  ngOnInit(): void {
    const baselineValues = this.modificationService.getBaselineExploreOppsValues();
    this.baselineFollowingTempDifferential = baselineValues.useSlidingCondenserWaterTemp.followingTempDifferential;
    this.form = this.exploreOpportunitiesFormService.getSlidingCondenserWaterTempForm(this.baselineFollowingTempDifferential, this.settings());
    this.observeFormChanges();
    
    this.modificationService.selectedModification$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((modification: Modification) => {
      if (modification) {
        this.isOpportunityDisabled = modification.decreaseCondenserWaterTemp.useOpportunity === true;
        this.useOpportunity = modification.useSlidingCondenserWaterTemp.useOpportunity;
        
        this.form.patchValue({
          followingTempDifferential: modification.useSlidingCondenserWaterTemp.followingTempDifferential
        }, { emitEvent: false });
        this.followingTempDifferential.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  setUseOpportunity() {
    this.modificationService.updateModificationEEM('useSlidingCondenserWaterTemp', {
      followingTempDifferential: this.form.getRawValue().followingTempDifferential,
      isConstantCondenserWaterTemp: false,
      useOpportunity: this.useOpportunity
    });
  }

  observeFormChanges() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((formValue) => {
      this.modificationService.updateModificationEEM('useSlidingCondenserWaterTemp',
        {
          followingTempDifferential: this.form.getRawValue().followingTempDifferential,
          isConstantCondenserWaterTemp: false,
          useOpportunity: this.useOpportunity
        }
      );
    });
  }

  get followingTempDifferential() {
    return this.form.get('followingTempDifferential') as FormControl;
  }

  focusField(str: string) {
    this.processCoolingUiService.focusedFieldSignal.set(str);
  }
}

export type SlidingCondenserWaterTempForm = {
  followingTempDifferential: FormControl<number>;
};
