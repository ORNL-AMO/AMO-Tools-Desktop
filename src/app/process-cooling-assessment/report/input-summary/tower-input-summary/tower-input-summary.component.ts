import { Component, ViewChild } from '@angular/core';
import { inject } from '@angular/core';
import { InputSummaryService } from '../../../services/input-summary.service';
import { InputSummaryTableComponent } from '../input-summary-table/input-summary-table.component';

@Component({
    selector: 'app-tower-input-summary',
    templateUrl: './tower-input-summary.component.html',
    standalone: false
})
export class TowerInputSummaryComponent {
    private readonly inputSummaryService = inject(InputSummaryService);

    @ViewChild(InputSummaryTableComponent) inputSummaryTable: InputSummaryTableComponent;
    copyTableString: string;
    collapse: boolean = true;

    readonly inputSummaryUI$ = this.inputSummaryService.inputSummaryUI$;

    toggleCollapse() {
        this.collapse = !this.collapse;
    }

    updateCopyTableString() {
        this.copyTableString = this.inputSummaryTable?.tableEl?.nativeElement?.innerText;
    }
}
