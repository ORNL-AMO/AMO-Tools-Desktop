import { Component, ViewChild, inject, Signal } from '@angular/core';
import { FeatureFlagService } from '../../../../shared/feature-flag.service';
import { InputSummaryService } from '../../../services/input-summary.service';
import { OperationSummaryRows } from '../../../services/input-summary.service';
import { map } from 'rxjs';
import { InputSummaryTableComponent } from '../input-summary-table/input-summary-table.component';
import { InputSummarySection } from '../../../../shared/report-builder/models/report-ui-models';

@Component({
    selector: 'app-system-info-summary',
    templateUrl: './system-info-summary.component.html',
    styleUrls: ['./system-info-summary.component.css'],
    standalone: false
})
export class SystemInfoSummaryComponent {
    private featureFlagService = inject(FeatureFlagService);
    private inputSummaryService = inject(InputSummaryService);
    @ViewChild(InputSummaryTableComponent) inputSummaryTable: InputSummaryTableComponent;
    showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;
    copyTableString: string;
    collapse: boolean = true;

    inputSummaryUI$ = this.inputSummaryService.inputSummaryUI$;
    sections$ = this.inputSummaryUI$.pipe(
        map(ui => ui ? this.buildSections(ui.operationSummaryRows) : [])
    );

    toggleCollapse() {
        this.collapse = !this.collapse;
    }

    updateCopyTableString() {
        this.copyTableString = this.inputSummaryTable?.tableEl?.nativeElement?.innerText;
    }

    private buildSections(rows: OperationSummaryRows): InputSummarySection[] {
        return [
            { label: 'Operations', rows: rows.baseOperations ?? [] },
            { label: 'Chiller Setup', rows: rows.chillerSetup ?? [] },
        ];
    }
}