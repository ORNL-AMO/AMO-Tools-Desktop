import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EEM_LABELS } from '../../constants/process-cooling-constants';
import { ModificationService } from '../../services/modification.service';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-assessment.service';
import { Modification } from '../../../shared/models/process-cooling-assessment';
import { ExploreOpportunitiesFormService, UseFreeCoolingForm } from '../../services/explore-opportunities-form.service';
import { SystemInformationFormService } from '../../system-information/system-information-form.service';
import { PROCESS_COOLING_UNITS } from '../../constants/process-cooling-units';

@Component({
  selector: 'app-use-free-cooling',
  standalone: false,
  templateUrl: './use-free-cooling.component.html',
  styleUrl: './use-free-cooling.component.css'
})
export class UseFreeCoolingComponent implements OnInit {
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private modificationService = inject(ModificationService);
  private processCoolingUiService = inject(ProcessCoolingUiService);
  private exploreOpportunitiesFormService = inject(ExploreOpportunitiesFormService);
  private systemInformationFormService = inject(SystemInformationFormService);
  private destroyRef = inject(DestroyRef);

  readonly settings = this.processCoolingAssessmentService.settingsSignal;
  EEM_LABELS = EEM_LABELS;
  PROCESS_COOLING_UNITS = PROCESS_COOLING_UNITS;

  baselineUsesFreeCooling: boolean;
  baselineIsHEXRequired: boolean;
  baselineHEXApproachTemp: number;

  useOpportunity: boolean;
  form: FormGroup<UseFreeCoolingForm>;

  ngOnInit(): void {
    const baselineValues = this.modificationService.getBaselineExploreOppsValues().useFreeCooling;
    this.baselineUsesFreeCooling = baselineValues.usesFreeCooling;
    this.baselineIsHEXRequired = baselineValues.isHEXRequired;
    this.baselineHEXApproachTemp = baselineValues.HEXApproachTemp;

    this.form = this.exploreOpportunitiesFormService.getUseFreeCoolingForm(baselineValues, this.settings());
    this.observeIsHEXRequiredChange();
    this.observeFormChanges();

    this.modificationService.selectedModification$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((modification: Modification) => {
      if (modification) {
        this.useOpportunity = modification.useFreeCooling.useOpportunity;
        this.form.patchValue({
          usesFreeCooling: modification.useFreeCooling.usesFreeCooling,
          isHEXRequired: modification.useFreeCooling.isHEXRequired,
          HEXApproachTemp: modification.useFreeCooling.HEXApproachTemp
        }, { emitEvent: false });
        this.updateHEXApproachTempValidators(modification.useFreeCooling.isHEXRequired);
        this.form.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  observeFormChanges() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.modificationService.updateModificationEEM('useFreeCooling', {
        ...this.form.getRawValue(),
        useOpportunity: this.useOpportunity
      });
    });
  }

  observeIsHEXRequiredChange() {
    this.isHEXRequired.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((isHEXRequired) => {
      this.updateHEXApproachTempValidators(isHEXRequired);
    });
  }


  updateHEXApproachTempValidators(isHEXRequired: boolean) {
    let validators = [];
      if (isHEXRequired) {
        validators = this.systemInformationFormService.getHexApproachTempValidators(this.settings());
      }
      this.HEXApproachTemp.setValidators(validators);
      this.HEXApproachTemp.updateValueAndValidity({ emitEvent: false });
  }

  setUseOpportunity() {
    this.modificationService.updateModificationEEM('useFreeCooling', {
      ...this.form.getRawValue(),
      useOpportunity: this.useOpportunity
    });
  }

  get usesFreeCooling() { return this.form.get('usesFreeCooling') as FormControl; }
  get isHEXRequired() { return this.form.get('isHEXRequired') as FormControl; }
  get HEXApproachTemp() { return this.form.get('HEXApproachTemp') as FormControl; }

  focusField(str: string) {
    this.processCoolingUiService.focusedFieldSignal.set(str);
  }
}
