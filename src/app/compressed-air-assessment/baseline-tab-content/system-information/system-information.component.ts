
import { Component, DestroyRef, inject } from '@angular/core';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-system-information',
    templateUrl: './system-information.component.html',
    styleUrls: ['./system-information.component.css'],
    standalone: false
})
export class SystemInformationComponent {
    private compressedAirAssessmentService = inject(CompressedAirAssessmentService);
    private destroyRef = inject(DestroyRef);
    isModalOpen: boolean;

    ngOnInit() {
        this.compressedAirAssessmentService.modalOpen.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(val => {
            this.isModalOpen = val;
        });
    }


}
