import { Component, Input, OnInit } from "@angular/core";
import { Assessment } from "../../shared/models/assessment";


@Component({
    selector: 'app-compressed-air-sankey',
    templateUrl: './compressed-air-sankey.component.html',
    styleUrls: ['./compressed-air-sankey.component.css'],
    standalone: false
})
export class CompressedAirSankeyComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  inReport: boolean;
  @Input()
  showPrintView: boolean;

  
  sankeyTab: 'airflow' | 'power' = 'power';
  constructor(
  ) { }

  ngOnInit() {
  }

  changeSankeyTab(sankeyTab: 'airflow' | 'power') {
    if (sankeyTab === 'power' || (sankeyTab === 'airflow' && this.assessment.compressedAirAssessment.endUseData.endUses.length !== 0)) {
      this.sankeyTab = sankeyTab;
    }
  }

}
