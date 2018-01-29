import { Component, OnInit, Input } from '@angular/core';
import { PhastService } from '../../phast.service';
import { PHAST, PhastResults, ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { PhastResultsService } from '../../phast-results.service';
import { graphColors } from './graphColors';
import { PhastReportService } from '../phast-report.service';
import { WindowRefService } from '../../../indexedDb/window-ref.service';

@Component({
  selector: 'app-report-graphs',
  templateUrl: './report-graphs.component.html',
  styleUrls: ['./report-graphs.component.css']
})
export class ReportGraphsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Input()
  inPhast: boolean;
  @Input()
  assessment: Assessment;

  selectedPhast1: any;
  selectedPhast2: any;
  baselinePhast: any;
  chartContainerWidth: number;
  doc: any;
  window: any;

  resultsArray: Array<any>;
  modExists: boolean = false;
  showResultsCats: ShowResultsCategories;
  pieLabels: any;
  baselineResults: PhastResults;
  colors: Array<string>;
  baselineLabels: Array<string>;
  modifiedLabels: Array<string>;
  showPrint: boolean = false;
  constructor(private phastService: PhastService, private phastResultsService: PhastResultsService, private phastReportService: PhastReportService, private windowRefService: WindowRefService) { }

  ngOnInit() {
    this.colors = graphColors;
    this.resultsArray = new Array<any>();
    this.showResultsCats = this.phastResultsService.getResultCategories(this.settings);
    if (this.phast.losses) {
      this.baselineResults = this.phastResultsService.getResults(this.phast, this.settings);
      this.resultsArray.push({ name: 'Baseline', data: this.baselineResults })
      this.selectedPhast1 = this.resultsArray[0];
      this.baselinePhast = this.resultsArray[0];
      if (this.phast.modifications) {
        if (this.phast.modifications.length != 0) {
          this.modExists = true;
          this.phast.modifications.forEach(mod => {
            let tmpResults = this.phastResultsService.getResults(mod.phast, this.settings);
            this.resultsArray.push({ name: mod.phast.name, data: tmpResults });
          })
          this.selectedPhast2 = this.resultsArray[1];
        }
      }
    } else {
      this.baselineResults = this.phastResultsService.initResults();
      this.resultsArray.push({ name: 'Baseline', data: this.baselineResults })
      this.selectedPhast1 = this.resultsArray[0];
    }
    this.phastReportService.baselineChartLabels.subscribe(val => {
      if (val) {
        this.getPieLabels(val);
      }
    });

    this.doc = this.windowRefService.getDoc();
    this.window = this.windowRefService.nativeWindow;
    this.chartContainerWidth = this.doc.getElementsByClassName('results')[0].clientWidth;
    if (this.chartContainerWidth == 0) {
      this.chartContainerWidth = this.doc.getElementsByClassName('assessment-item')[0].clientWidth;
    }

    //subscribe to show print value
    this.phastReportService.showPrint.subscribe(printVal => {
      this.showPrint = printVal;
    })
  }

  ngOnDestroy() {
    this.showPrint = false;
  }


  getPieLabels(labels: Array<string>) {
    this.pieLabels = new Array();
    let i = 0;
    labels.forEach(label => {
      this.pieLabels.push({
        name: label,
        color: this.colors[i]
      })
      i++;
    })
  }
}
