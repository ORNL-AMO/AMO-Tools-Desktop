import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ModificationService } from '../../services/modification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TEMPERATURE_HTML } from '../../../shared/app-constants';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';
import { Modification } from '../../../shared/models/process-cooling-assessment';

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

  readonly settings = this.processCoolingAssessmentService.settingsSignal;

  private formBuilder: FormBuilder = inject(UntypedFormBuilder);
  private destroyRef = inject(DestroyRef);

  TEMPERATURE_HTML = TEMPERATURE_HTML;

  baselineFollowingTempDifferential: number = this.modificationService.getBaselineValues().useSlidingCondenserWaterTemp.followingTempDifferential;
  form: FormGroup<SlidingCondenserWaterTempForm>;

  ngOnInit(): void {
    this.form = this.formBuilder.group({ followingTempDifferential: [0] });
    this.observeFormChanges();

    this.modificationService.selectedModification$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((modification: Modification) => {
      if (modification) {
        this.form.patchValue({ followingTempDifferential: modification.useSlidingCondenserWaterTemp.followingTempDifferential }, { emitEvent: false });
        this.followingTempDifferential.updateValueAndValidity({ emitEvent: false });
      }
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
          useOpportunity: true
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
