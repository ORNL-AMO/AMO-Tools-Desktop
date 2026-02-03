import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ModificationService } from '../../services/modification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';
import { Modification, TowerType } from '../../../shared/models/process-cooling-assessment';
import { SystemInformationFormService } from '../../system-information/system-information-form.service';
import { getTowerTypes } from '../../process-cooling-constants';

@Component({
    selector: 'app-upgrade-cooling-tower-fan',
    standalone: false,
    templateUrl: './upgrade-cooling-tower-fan.component.html',
    styleUrl: './upgrade-cooling-tower-fan.component.css'
})
export class UpgradeCoolingTowerFanComponent implements OnInit {
    private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
    private modificationService = inject(ModificationService);
    private processCoolingUiService = inject(ProcessCoolingUiService);
    private systemInformationFormService = inject(SystemInformationFormService);

    readonly settings = this.processCoolingAssessmentService.settingsSignal;

    private formBuilder: FormBuilder = inject(UntypedFormBuilder);
    private destroyRef = inject(DestroyRef);

    baselineTowerType: string = TowerType[this.modificationService.getBaselineExploreOppsValues().upgradeCoolingTowerFans.towerType];
    form: FormGroup<UpgradeCoolingTowerFanForm>;
    towerTypes = getTowerTypes();

    ngOnInit(): void {
        this.form = this.formBuilder.group({ towerType: [0] });
        this.observeFormChanges();

        this.modificationService.selectedModification$.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((modification: Modification) => {
            if (modification) {
                this.form.patchValue({ towerType: modification.upgradeCoolingTowerFans.towerType }, { emitEvent: false });
                this.towerType.updateValueAndValidity({ emitEvent: false });
            }
        });
    }

    observeFormChanges() {
        this.towerType.valueChanges.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((formValue) => {
            const dependentValues = this.systemInformationFormService.getTowerTypeDependentValues(this.towerType.value);
            // todo should dependent fields be updated here
            this.modificationService.updateModificationEEM('upgradeCoolingTowerFans',
                {
                    towerType: this.towerType.value,
                    useOpportunity: true
                }
            );
        });
    }

    get towerType() {
        return this.form.get('towerType') as FormControl;
    }

    focusField(str: string) {
        this.processCoolingUiService.focusedFieldSignal.set(str);
    }

}

export type UpgradeCoolingTowerFanForm = {
    towerType: FormControl<number>;
};
