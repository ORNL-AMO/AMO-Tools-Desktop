import { Component, OnInit, Input } from '@angular/core';
import { ReportRollupService } from '../report-rollup.service';
import { Settings } from '../../shared/models/settings';
@Component({
  selector: 'app-phast-rollup',
  templateUrl: './phast-rollup.component.html',
  styleUrls: ['./phast-rollup.component.css']
})
export class PhastRollupComponent implements OnInit {
  @Input()
  settings: Settings;

  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {

    this.reportRollupService.phastResults.subscribe(val => {
      if (val.length != 0) {
       // this.calcPhastSums(val);
      }
    })
  }

}
