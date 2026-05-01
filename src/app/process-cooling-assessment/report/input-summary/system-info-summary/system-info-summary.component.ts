import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef, inject, Signal } from '@angular/core';
import { FeatureFlagService } from '../../../../shared/feature-flag.service';
import { Settings } from '../../../../shared/models/settings';
import { InputSummaryService, InputSummaryUI } from '../../../services/input-summary.service';
import { InputSummarySection } from '../../report-ui-models';
import { OperationSummaryRows } from '../../../services/input-summary.service';
import { map } from 'rxjs';

@Component({
    selector: 'app-system-info-summary',
    templateUrl: './system-info-summary.component.html',
    styleUrls: ['./system-info-summary.component.css'],
    standalone: false
})
export class SystemInfoSummaryComponent implements OnInit {
    private featureFlagService = inject(FeatureFlagService);
    private inputSummaryService = inject(InputSummaryService);

    inputSummaryUI$ = this.inputSummaryService.inputSummaryUI$;

    sections$ = this.inputSummaryUI$.pipe(
        map(ui => ui ? this.buildSections(ui.operationSummaryRows) : [])
    );

    @Input() printView: boolean;
    @Input() settings: Settings;

    showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;
    @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
    copyTableString: any;
    collapse: boolean = true;

    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit() { }

    toggleCollapse() {
        this.collapse = !this.collapse;
    }

    updateCopyTableString() {
        this.copyTableString = this.copyTable.nativeElement.innerText;
    }

    private buildSections(rows: OperationSummaryRows): InputSummarySection[] {
        return [
            { label: 'Operations', rows: rows.baseOperations ?? [] },
            { label: 'Chiller Setup', rows: rows.chillerSetup ?? [] },
        ];
    }
}