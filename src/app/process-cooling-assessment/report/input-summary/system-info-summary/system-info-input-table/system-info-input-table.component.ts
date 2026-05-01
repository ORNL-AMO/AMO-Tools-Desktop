import { Component, Input } from '@angular/core';
import { OperationSummaryRows } from '../../../../services/input-summary.service';
import { ModificationNameCell } from '../../../report-ui-models';

@Component({
    selector: 'app-system-info-input-table',
    templateUrl: './system-info-input-table.component.html',
    styleUrls: ['./system-info-input-table.component.css'],
    standalone: false
})
export class SystemInfoInputTableComponent {
    @Input() operationSummaryRows: OperationSummaryRows;
    @Input() modificationNames: ModificationNameCell[] = [];

    get numMods(): number {
        return this.modificationNames?.length ?? 0;
    }

    isDifferent(baselineValue: any, modValue: any): boolean {
        return baselineValue !== modValue;
    }
}
