import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl } from '@angular/forms';
import { ExploreOpportunitiesFormService, InstallVSDForm } from '../../services/explore-opportunities-form.service';
import { ModificationService } from '../../services/modification.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-assessment.service';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { InstallVSDOnCentrifugalCompressor, Modification } from '../../../shared/models/process-cooling-assessment';
import { EEM_LABELS } from '../../constants/process-cooling-constants';

@Component({
    selector: 'app-install-vsd',
    standalone: false,
    templateUrl: './install-vsd.component.html',
    styleUrls: ['./install-vsd.component.css']
})
export class InstallVSDComponent implements OnInit {
    private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
    private modificationService = inject(ModificationService);
    private processCoolingUiService = inject(ProcessCoolingUiService);
    private exploreOpportunitiesFormService = inject(ExploreOpportunitiesFormService);
    private destroyRef = inject(DestroyRef);

    readonly settings = this.processCoolingAssessmentService.settingsSignal;
    useOpportunity: boolean = false;
    form: FormGroup<InstallVSDForm>;
    EEM_LABELS = EEM_LABELS;

    ngOnInit(): void {
        const baselineValues: InstallVSDOnCentrifugalCompressor = this.modificationService.getBaselineExploreOppsValues().installVSDOnCentrifugalCompressors;
        this.form = this.exploreOpportunitiesFormService.getInstallVSDOnCentrifugalCompressorsForm(baselineValues);

        this.modificationService.selectedModification$.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((modification: Modification) => {
            if (modification) {
                this.useOpportunity = modification.installVSDOnCentrifugalCompressors.useOpportunity;
                this.form.patchValue({
                    installOnAll: modification.installVSDOnCentrifugalCompressors.installOnAll
                }, { emitEvent: false });
                this.form.updateValueAndValidity({ emitEvent: false });
            }
        });
    }

    setUseOpportunity() {
        this.modificationService.updateModificationEEM('installVSDOnCentrifugalCompressors', {
            installOnAll: this.useOpportunity,
            useOpportunity: this.useOpportunity
        });
    }

    get installOnAll() {
        return this.form.get('installOnAll') as FormControl;
    }

    focusField(str: string) {
        this.processCoolingUiService.focusedFieldSignal.set(str);
    }
}
