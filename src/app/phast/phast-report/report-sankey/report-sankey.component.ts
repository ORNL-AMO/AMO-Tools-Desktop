import { Component, OnInit, Input } from '@angular/core';
import { PHAST, ExecutiveSummary } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { PhastReportService } from '../phast-report.service';
import { Assessment } from '../../../shared/models/assessment';
import { ExecutiveSummaryService, SummaryNote } from '../executive-summary.service';

@Component({
  selector: 'app-report-sankey',
  templateUrl: './report-sankey.component.html',
  styleUrls: ['./report-sankey.component.css']
})
export class ReportSankeyComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  showPrint: boolean;

  baseline: ExecutiveSummary;

  phast1CostSavings: number;
  phast1EnergySavings: number;
  phast2CostSavings: number;
  phast2EnergySavings: number;

  modification: PHAST;
  modifications: Array<ExecutiveSummary>;
  assessmentName: string;
  phastOptions: Array<any>;
  phast1: {name, phast};
  phast2: {name, phast};
  modExists: boolean = false;
  constructor(private phastReportService: PhastReportService, private executiveSummaryService: ExecutiveSummaryService) { }

  ngOnInit() {

    //debug
    this.baseline = this.executiveSummaryService.getSummary(this.phast, false, this.settings, this.phast);
    this.modifications = new Array<ExecutiveSummary>();


    //real version
    this.assessmentName = this.assessment.name.replace(/\s/g, '');
    this.phastOptions = new Array<any>();
    this.phastOptions.push({name: 'Baseline', phast: this.phast});
    this.phast1 = this.phastOptions[0];
    if (this.phast.modifications) {
      this.modExists = true;
      this.phast.modifications.forEach(mod => {

        //debug
        let tmpSummary = this.executiveSummaryService.getSummary(mod.phast, true, this.settings, this.phast, this.baseline);
        this.modifications.push(tmpSummary);

        //real version
        this.phastOptions.push({name: mod.phast.name, phast: mod.phast});
      });
      this.phast2 = this.phastOptions[1];
    }

    this.phast1CostSavings = 0;
    this.phast1EnergySavings = 0;
    this.phast2CostSavings = 0;
    this.phast2EnergySavings = 0;
    // this.phastReportService.showPrint.subscribe(printVal => {
    //   this.showPrint = printVal;
    // });
  }


  // ngAfterViewInit() {
  //   this.getPhast2Savings();

  // }

  getPhast1Savings() {

    console.log("phast1Savings");
    console.log("this.phast1.name = " + this.phast1.name);
    console.log("this.phast1.phast = " + this.phast1.phast);

    if (!this.phast1) {
      console.log("not phast1");
      return;
    }

    let isMod;
    if (this.phast1.name == this.phast.name) {
      isMod = false;
    }
    else {
      isMod = true;
    }
    let tmpSummary = this.executiveSummaryService.getSummary(this.phast1.phast, isMod, this.settings, this.phastOptions[0].phast);
    this.phast1CostSavings = tmpSummary.annualCostSavings;
    this.phast1EnergySavings = tmpSummary.annualEnergySavings

    console.log("tmpSummary.annualCostSavings = " + tmpSummary.annualCostSavings)
  }



  getPhast2Savings() {

    console.log("phast2Savings");

    if (!this.phast2) {
      console.log("not phast2");
      return;
    }
    let isMod;
    if (this.phast2.name == this.phast.name) {
      isMod = false;
    }
    else {
      isMod = true;
    }
    let tmpSummary = this.executiveSummaryService.getSummary(this.phast2.phast, isMod, this.settings, this.phastOptions[0].phast);
    this.phast2CostSavings = tmpSummary.annualCostSavings;
    this.phast2EnergySavings = tmpSummary.annualEnergySavings
    console.log("tmpSummary.annualCostSavings = " + tmpSummary.annualCostSavings)

  }

}
