import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ModificationService } from '../../services/modification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-assessment.service';
import { Modification, TowerType } from '../../../shared/models/process-cooling-assessment';
import { SystemInformationFormService } from '../../system-information/system-information-form.service';
import { getTowerTypes, TowerTypes } from '../../constants/process-cooling-constants';
import { ExploreOpportunitiesFormService, UpgradeCoolingTowerFanForm } from '../../services/explore-opportunities-form.service';

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

    private exploreOpportunitiesFormService = inject(ExploreOpportunitiesFormService);
    private destroyRef = inject(DestroyRef);

    baselineTowerType: string = TowerTypes[this.modificationService.getBaselineExploreOppsValues().upgradeCoolingTowerFans.towerType];
    useOpportunity: boolean = this.modificationService.getBaselineExploreOppsValues().upgradeCoolingTowerFans.useOpportunity;
    
    form: FormGroup<UpgradeCoolingTowerFanForm>;
    towerTypes = getTowerTypes();
    TowerType = TowerType;

    ngOnInit(): void {
        const baselineValues = this.modificationService.getBaselineExploreOppsValues().upgradeCoolingTowerFans;
        this.form = this.exploreOpportunitiesFormService.getUpgradeCoolingTowerFanForm(baselineValues);
        this.observeFormChanges();

        this.modificationService.selectedModification$.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((modification: Modification) => {
            if (modification) {
                this.form.patchValue({ 
                    towerType: modification.upgradeCoolingTowerFans.towerType,
                    numberOfFans: modification.upgradeCoolingTowerFans.numberOfFans,
                    fanSpeedType: modification.upgradeCoolingTowerFans.fanSpeedType
                }, { emitEvent: false });
            }
        });
    }

    observeFormChanges() {
        this.towerType.valueChanges.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((towerType) => {
            const dependentValues = this.systemInformationFormService.getTowerTypeDependentValues(this.towerType.value);
            // todo 8173 if tower type changes to unknown we should be settings tower size based on some coefficient and chiller cap total. 
            this.numberOfFans.setValue(dependentValues.numberOfFans, { emitEvent: false });
            this.fanSpeedType.setValue(dependentValues.fanSpeedType, { emitEvent: false });
            this.modificationService.updateModificationEEM('upgradeCoolingTowerFans',
                {
                    ...this.form.getRawValue(),
                    useOpportunity: this.useOpportunity
                }
            );
        });

        this.numberOfFans.valueChanges.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((numberOfFans) => {
            this.modificationService.updateModificationEEM('upgradeCoolingTowerFans',
                {
                    ...this.form.getRawValue(),
                    useOpportunity: this.useOpportunity
                }
            );
        });
    }

    setUseOpportunity() {
        this.modificationService.updateModificationEEM('upgradeCoolingTowerFans', {
            ...this.form.getRawValue(),
            useOpportunity: this.useOpportunity
        });
    }

    get towerType() {
        return this.form.get('towerType') as FormControl;
    }
    
    get numberOfFans() {
        return this.form.get('numberOfFans') as FormControl;
    }

    get fanSpeedType() {
        return this.form.get('fanSpeedType') as FormControl;
    }

    focusField(str: string) {
        this.processCoolingUiService.focusedFieldSignal.set(str);
    }

}
