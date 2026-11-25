import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../../../shared/models/assessment';
import { ExecutiveSummary } from '../../../../../shared/models/phast/phast';
import { ExecutiveSummaryService } from '../../../../../phast/phast-report/executive-summary.service';
import { Settings } from '../../../../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SettingsDbService } from '../../../../../indexedDb/settings-db.service';
import { AssessmentService } from '../../../../assessment.service';
import { toLegacyPhastAssessment } from '../../../../../process-heating-assessment/services/legacy-phast-assessment.util';


@Component({
    selector: 'app-phast-summary-card',
    templateUrl: './phast-summary-card.component.html',
    styleUrls: ['./phast-summary-card.component.css'],
    standalone: false
})
export class PhastSummaryCardComponent implements OnInit {
    @Input()
    assessment: Assessment;

    @ViewChild('reportModal', { static: false }) public reportModal: ModalDirective;

    legacyAssessment: Assessment;
    phastResults: ExecutiveSummary;
    modResults: ExecutiveSummary;
    settings: Settings;
    numMods: number = 0;
    setupDone: boolean;
    showReport: boolean = false;
    constructor(private executiveSummaryService: ExecutiveSummaryService, private settingsDbService: SettingsDbService, private assessmentService: AssessmentService) { }

    ngOnInit() {
        this.settings = this.settingsDbService.getByAssessmentId(this.assessment);
        this.legacyAssessment = toLegacyPhastAssessment(this.assessment, this.settings);
        this.setupDone = this.legacyAssessment.phast.setupDone;
        if (this.setupDone) {
            this.phastResults = this.executiveSummaryService.getSummary(this.legacyAssessment.phast, false, this.settings, this.legacyAssessment.phast);
            let tmpSavings = 0;
            if (this.legacyAssessment.phast.modifications) {
                this.numMods = this.legacyAssessment.phast.modifications.length;
                this.legacyAssessment.phast.modifications.forEach(mod => {
                    let tempVal = this.executiveSummaryService.getSummary(mod.phast, true, this.settings, this.legacyAssessment.phast, this.phastResults);
                    if (tempVal.annualCostSavings > tmpSavings) {
                        tmpSavings = tempVal.annualCostSavings;
                        this.modResults = tempVal;
                    }
                });
            }
        }
    }

    goToAssessment(assessment: Assessment, str?: string, str2?: string) {
        this.assessmentService.goToAssessment(assessment, str, str2);
    }

    openInProcessHeatingAssessment(assessment: Assessment) {
        this.assessmentService.goToAssessment(assessment, 'baseline', undefined, 'process-heating');
    }

    showReportModal() {
        this.showReport = true;
        this.reportModal.show();
    }

    hideReportModal() {
        this.reportModal.hide();
        this.showReport = false;
    }
}
