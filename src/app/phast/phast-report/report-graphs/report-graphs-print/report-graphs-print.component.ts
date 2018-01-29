import { Component, OnInit, Input } from '@angular/core';
import { PhastService } from '../../../phast.service';
import { PHAST, PhastResults, ShowResultsCategories } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { Assessment } from '../../../../shared/models/assessment';
import { PhastResultsService } from '../../../phast-results.service';
import { graphColors } from '../graphColors';
import { PhastReportService } from '../../phast-report.service';


@Component({
    selector: 'app-report-graphs-print',
    templateUrl: './report-graphs-print.component.html',
    styleUrls: ['./report-graphs-print.component.css']
})
export class ReportGraphsPrintComponent implements OnInit {
    @Input()
    modExists: boolean;
    @Input()
    resultCats: ShowResultsCategories;
    @Input()
    baselinePhast: any;
    @Input()
    modPhast: any;
    @Input()
    resultsArray: Array<any>;
    @Input()
    settings: Settings;
    @Input()
    printView: boolean;
    @Input()
    chartContainerWidth: number;

    constructor() { }

    ngOnInit() { 
    }

    ngAfterViewInit() {

    }
}