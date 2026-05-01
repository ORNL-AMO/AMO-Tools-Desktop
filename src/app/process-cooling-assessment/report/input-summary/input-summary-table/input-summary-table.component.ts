import { Component, Input } from '@angular/core';
import { InputSummarySection, ModificationNameCell } from '../../report-ui-models';

@Component({
    selector: 'app-input-summary-table',
    templateUrl: './input-summary-table.component.html',
    styleUrls: ['./input-summary-table.component.css'],
    standalone: false
})
export class InputSummaryTableComponent {
    @Input() sections: InputSummarySection[] = [];
    @Input() modificationNames: ModificationNameCell[] = [];

    get numMods(): number {
        return this.modificationNames?.length ?? 0;
    }
}
