import { Component, Input, OnInit } from "@angular/core";
import { Assessment } from "../../shared/models/assessment";


@Component({
  selector: 'app-compressed-air-sankey',
  templateUrl: './compressed-air-sankey.component.html',
  styleUrls: ['./compressed-air-sankey.component.css']
})
export class CompressedAirSankeyComponent implements OnInit {
  @Input()
  assessment: Assessment;

  sankeyTab: 'airflow' | 'power' = 'power';
  constructor(
  ) { }

  ngOnInit() {
    console.log(this.assessment)
  }

  changeSankeyTab(sankeyTab: 'airflow' | 'power') {
    if (sankeyTab === 'power' || (sankeyTab === 'airflow' && this.assessment.compressedAirAssessment.endUseData.endUses.length !== 0)) {
      this.sankeyTab = sankeyTab;
    }
  }

}
