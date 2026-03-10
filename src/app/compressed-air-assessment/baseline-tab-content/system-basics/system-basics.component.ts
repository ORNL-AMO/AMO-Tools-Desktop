import { Component } from '@angular/core';
import { of } from 'rxjs';
import { Observable } from 'rxjs';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
    selector: 'app-system-basics',
    templateUrl: './system-basics.component.html',
    styleUrls: ['./system-basics.component.css'],
    standalone: false
})
export class SystemBasicsComponent {

    showUpdateDataReminder: boolean;
    showUpdateUnitsModal: boolean = false;
    confirmResult: (result: boolean) => void;

    constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

    canDeactivate(): Observable<boolean> {
        console.log(this.showUpdateDataReminder);
        if (this.showUpdateDataReminder) {
            return this.initUpdateUnitsModal();
        }
        return of(true);
    }

    initUpdateUnitsModal(): Observable<boolean> {
        this.compressedAirAssessmentService.modalOpen.next(true)
        this.showUpdateUnitsModal = true;
        return new Observable<boolean>(observer => {
            this.confirmResult = (result: boolean) => {
                observer.next(result);
                observer.complete();
                this.compressedAirAssessmentService.modalOpen.next(false);
                this.showUpdateUnitsModal = false;
            };
        });
    }

    setShowUpdateDataReminder(show: boolean) {
        this.showUpdateDataReminder = show;
    }
}
