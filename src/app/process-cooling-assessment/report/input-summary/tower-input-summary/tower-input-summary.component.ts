import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { inject } from '@angular/core';
import { InputSummaryService } from '../../../services/input-summary.service';

@Component({
    selector: 'app-tower-input-summary',
    templateUrl: './tower-input-summary.component.html',
    styleUrls: ['./tower-input-summary.component.css'],
    standalone: false
})
export class TowerInputSummaryComponent {
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
