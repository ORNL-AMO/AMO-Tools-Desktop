import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ModificationService } from '../../services/modification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-assessment.service';
import { Modification } from '../../../shared/models/process-cooling-assessment';
import { ExploreOpportunitiesFormService } from '../../services/explore-opportunities-form.service';

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
  private exploreOpportunitiesFormService = inject(ExploreOpportunitiesFormService);
  private destroyRef = inject(DestroyRef);

  baselineChilledWaterVariableFlow: boolean;
  baselineCondenserWaterVariableFlow: boolean;
  useOpportunity: boolean;

  form: FormGroup<ApplyVariableSpeedControlForm>;
  isOpportunityDisabled: boolean;

  ngOnInit(): void {
    const baselineValues = this.modificationService.getBaselineExploreOppsValues();
    this.baselineChilledWaterVariableFlow = baselineValues.applyVariableSpeedControls.chilledWaterVariableFlow;
    this.baselineCondenserWaterVariableFlow = baselineValues.applyVariableSpeedControls.condenserWaterVariableFlow;
    this.isOpportunityDisabled = this.baselineChilledWaterVariableFlow && this.baselineCondenserWaterVariableFlow;
    
    this.form = this.exploreOpportunitiesFormService.getApplyVariableSpeedControlForm(
      this.baselineChilledWaterVariableFlow,
      this.baselineCondenserWaterVariableFlow
    );
    this.observeFormChanges();
    
    this.modificationService.selectedModification$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((modification: Modification) => {
      if (modification) {
        this.useOpportunity = modification.applyVariableSpeedControls.useOpportunity;
        this.form.patchValue({
          chilledWaterVariableFlow: modification.applyVariableSpeedControls.chilledWaterVariableFlow,
          condenserWaterVariableFlow: modification.applyVariableSpeedControls.condenserWaterVariableFlow
        }, { emitEvent: false });
      }
    });
  }

  setUseOpportunity() {
    this.modificationService.updateModificationEEM('applyVariableSpeedControls', {
      chilledWaterVariableFlow: this.form.getRawValue().chilledWaterVariableFlow,
      condenserWaterVariableFlow: this.form.getRawValue().condenserWaterVariableFlow,
      useOpportunity: this.useOpportunity
    });
  }

  observeFormChanges() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((formValue) => {
      this.modificationService.updateModificationEEM('applyVariableSpeedControls', {
        chilledWaterVariableFlow: this.form.getRawValue().chilledWaterVariableFlow,
        condenserWaterVariableFlow: this.form.getRawValue().condenserWaterVariableFlow,
        useOpportunity: this.useOpportunity
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
