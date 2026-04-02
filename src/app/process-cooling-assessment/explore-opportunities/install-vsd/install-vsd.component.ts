import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModificationService } from '../../services/modification.service';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { Modification } from '../../../shared/models/process-cooling-assessment';
import { EEM_LABELS } from '../../constants/process-cooling-constants';

@Component({
    selector: 'app-install-vsd',
    standalone: false,
    templateUrl: './install-vsd.component.html',
    styleUrls: ['./install-vsd.component.css']
})
export class InstallVSDComponent implements OnInit {
    private modificationService = inject(ModificationService);
    private processCoolingUiService = inject(ProcessCoolingUiService);
    private destroyRef = inject(DestroyRef);

    useOpportunity: boolean = false;
    EEM_LABELS = EEM_LABELS;

    ngOnInit(): void {
        this.modificationService.selectedModification$.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((modification: Modification) => {
            if (modification) {
                this.useOpportunity = modification.installVSDOnCentrifugalCompressors.useOpportunity;
            }
        });
    }

    setUseOpportunity() {
        this.modificationService.updateModificationEEM('installVSDOnCentrifugalCompressors', {
            chillerIds: [],
            useOpportunity: this.useOpportunity
        });
    }

    focusField(str: string) {
        this.processCoolingUiService.focusedFieldSignal.set(str);
    }
}
