import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { InputSummaryService } from '../../../services/input-summary.service';

@Component({
    selector: 'app-pump-input-summary',
    templateUrl: './pump-input-summary.component.html',
    styleUrls: ['./pump-input-summary.component.css'],
    standalone: false
})
export class PumpInputSummaryComponent {
    private readonly inputSummaryService = inject(InputSummaryService);

    @Input() printView: boolean;
    @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
    copyTableString: any;
    collapse: boolean = true;

    readonly inputSummaryUI$ = this.inputSummaryService.inputSummaryUI$;

    toggleCollapse() {
        this.collapse = !this.collapse;
    }

    updateCopyTableString() {
        this.copyTableString = this.copyTable.nativeElement.innerText;
    }
}
