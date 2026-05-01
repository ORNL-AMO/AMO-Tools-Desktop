import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { inject } from '@angular/core';
import { InputSummaryService } from '../../../services/input-summary.service';

@Component({
    selector: 'app-condenser-input-summary',
    templateUrl: './condenser-input-summary.component.html',
    styleUrls: ['./condenser-input-summary.component.css'],
    standalone: false
})
export class CondenserInputSummaryComponent {
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
