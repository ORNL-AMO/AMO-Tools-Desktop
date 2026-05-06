import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { InputSummarySection, ModificationNameCell } from '../../../../shared/report-builder/models/report-ui-models';

@Component({
    selector: 'app-input-summary-table',
    templateUrl: './input-summary-table.component.html',
    standalone: false
})
export class InputSummaryTableComponent {
    @Input() sections: InputSummarySection[] = [];
    @Input() modificationNames: ModificationNameCell[] = [];
    @ViewChild('tableEl', { static: false }) tableEl: ElementRef;

    get numMods(): number {
        return this.modificationNames?.length ?? 0;
    }
}
