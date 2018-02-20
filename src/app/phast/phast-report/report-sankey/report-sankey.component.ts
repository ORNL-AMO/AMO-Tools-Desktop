import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { PhastReportService } from '../phast-report.service';
import { Assessment } from '../../../shared/models/assessment';
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

  modification: PHAST;
  assessmentName: string;
  phastOptions: Array<any>;
  phast1: PHAST;
  phast2: PHAST;
  modExists: boolean = false;
  constructor(private phastReportService: PhastReportService) { }

  ngOnInit() {
    this.assessmentName = this.assessment.name.replace(/\s/g, '');
    this.phastOptions = new Array<any>();
    this.phastOptions.push({name: 'Baseline', phast: this.phast});
    this.phast1 = this.phastOptions[0];
    if (this.phast.modifications) {
      this.modExists = true;
      this.phast.modifications.forEach(mod => {
        this.phastOptions.push({name: mod.phast.name, phast: mod.phast});
      });
      this.phast2 = this.phastOptions[1];
    }
    // this.phastReportService.showPrint.subscribe(printVal => {
    //   this.showPrint = printVal;
    // });
  }

}
