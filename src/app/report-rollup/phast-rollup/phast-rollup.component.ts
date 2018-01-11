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


  showEnergyUse: boolean = true;
  showSummary: boolean = true;
  showGraphs: boolean = true;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
  }

  toggleCollapse(varName: string){
    this[varName] = !this[varName]
  }

}
