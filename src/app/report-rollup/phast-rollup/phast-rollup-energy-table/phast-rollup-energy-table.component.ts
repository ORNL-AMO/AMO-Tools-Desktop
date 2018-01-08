import { Component, OnInit } from '@angular/core';
import { ReportRollupService } from '../../report-rollup.service';

@Component({
  selector: 'app-phast-rollup-energy-table',
  templateUrl: './phast-rollup-energy-table.component.html',
  styleUrls: ['./phast-rollup-energy-table.component.css']
})
export class PhastRollupEnergyTableComponent implements OnInit {

  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.reportRollupService.phastAssessments.subscribe(val => {
      if (val.length != 0) {
        console.log(val);
      }
    })
  }

}
