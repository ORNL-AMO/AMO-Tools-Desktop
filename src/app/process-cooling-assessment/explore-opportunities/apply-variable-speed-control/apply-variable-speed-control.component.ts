import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ModificationService } from '../../services/modification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';
import { Modification } from '../../../shared/models/process-cooling-assessment';

@Component({
  selector: 'app-apply-variable-speed-control',
  standalone: false,
  templateUrl: './apply-variable-speed-control.component.html',
  styleUrl: './apply-variable-speed-control.component.css'
})
export class ApplyVariableSpeedControlComponent implements OnInit {
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private modificationService = inject(ModificationService);
  private processCoolingUiService = inject(ProcessCoolingUiService);

  readonly settings = this.processCoolingAssessmentService.settingsSignal;

  private formBuilder: FormBuilder = inject(UntypedFormBuilder);
  private destroyRef = inject(DestroyRef);

  baselineChilledWaterVariableFlow: boolean = this.modificationService.getBaselineExploreOppsValues().applyVariableSpeedControls.chilledWaterVariableFlow;
  baselineCondenserWaterVariableFlow: boolean = this.modificationService.getBaselineExploreOppsValues().applyVariableSpeedControls.condenserWaterVariableFlow;
  form: FormGroup<ApplyVariableSpeedControlForm>;

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      chilledWaterVariableFlow: [false],
      condenserWaterVariableFlow: [false]
    });
    this.observeFormChanges();

    this.modificationService.selectedModification$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((modification: Modification) => {
      if (modification) {
        this.form.patchValue({
          chilledWaterVariableFlow: modification.applyVariableSpeedControls.chilledWaterVariableFlow,
          condenserWaterVariableFlow: modification.applyVariableSpeedControls.condenserWaterVariableFlow
        }, { emitEvent: false });
      }
    });
  }

  observeFormChanges() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((formValue) => {
      this.modificationService.updateModificationEEM('applyVariableSpeedControls', {
        chilledWaterVariableFlow: this.form.getRawValue().chilledWaterVariableFlow,
        condenserWaterVariableFlow: this.form.getRawValue().condenserWaterVariableFlow,
        useOpportunity: true
      });
    });
  }

  get chilledWaterVariableFlow() {
    return this.form.get('chilledWaterVariableFlow');
  }
  get condenserWaterVariableFlow() {
    return this.form.get('condenserWaterVariableFlow');
  }

  focusField(str: string) {
    this.processCoolingUiService.focusedFieldSignal.set(str);
  }
}

export interface ApplyVariableSpeedControlForm {
  chilledWaterVariableFlow: FormControl<boolean>;
  condenserWaterVariableFlow: FormControl<boolean>;
}
