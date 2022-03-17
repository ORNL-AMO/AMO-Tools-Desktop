import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../../../shared/models/assessment';
import { ExecutiveSummary } from '../../../../../shared/models/phast/phast';
import { ExecutiveSummaryService } from '../../../../../phast/phast-report/executive-summary.service';
import { Settings } from '../../../../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SettingsDbService } from '../../../../../indexedDb/settings-db.service';
import { AssessmentService } from '../../../../assessment.service';


@Component({
    selector: 'app-phast-summary-card',
    templateUrl: './phast-summary-card.component.html',
    styleUrls: ['./phast-summary-card.component.css']
})
export class PhastSummaryCardComponent implements OnInit {
    @Input()
    assessment: Assessment;

    @ViewChild('reportModal', { static: false }) public reportModal: ModalDirective;

    phastResults: ExecutiveSummary;
    modResults: ExecutiveSummary;
    settings: Settings;
    numMods: number = 0;
    setupDone: boolean;
    showReport: boolean = false;
    constructor(private executiveSummaryService: ExecutiveSummaryService, private settingsDbService: SettingsDbService, private assessmentService: AssessmentService) { }

    ngOnInit() {
        this.setupDone = this.assessment.phast.setupDone;
        this.settings = this.settingsDbService.getByAssessmentId(this.assessment);
        if (this.setupDone) {
            this.phastResults = this.executiveSummaryService.getSummary(this.assessment.phast, false, this.settings, this.assessment.phast);
            let tmpSavings = 0;
            if (this.assessment.phast.modifications) {
                this.numMods = this.assessment.phast.modifications.length;
                this.assessment.phast.modifications.forEach(mod => {
                    let tempVal = this.executiveSummaryService.getSummary(mod.phast, true, this.settings, this.assessment.phast, this.phastResults);
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

    showReportModal() {
        this.showReport = true;
        this.reportModal.show();
    }

    hideReportModal() {
        this.reportModal.hide();
        this.showReport = false;
    }
}
