import { Component, Input, OnInit } from "@angular/core";
import { CompressedAirAssessmentService } from "../compressed-air-assessment.service";
import { CompressedAirAssessment } from "../../shared/models/compressed-air-assessment";


@Component({
    selector: 'app-compressed-air-sankey',
    templateUrl: './compressed-air-sankey.component.html',
    styleUrls: ['./compressed-air-sankey.component.css'],
    standalone: false
})
export class CompressedAirSankeyComponent implements OnInit {
  @Input()
  compressedAirAssessment: CompressedAirAssessment;
  @Input()
  inReport: boolean;
  @Input()
  showPrintView: boolean;

  
  sankeyTab: 'airflow' | 'power' = 'power';
  constructor(
    private compressedAirAssessmentService: CompressedAirAssessmentService
  ) { }

  ngOnInit() {
    if(!this.compressedAirAssessment){
      this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    }
  }

  changeSankeyTab(sankeyTab: 'airflow' | 'power') {
    if (sankeyTab === 'power' || (sankeyTab === 'airflow' && this.compressedAirAssessment.endUseData.endUses.length !== 0)) {
      this.sankeyTab = sankeyTab;
    }
  }

}
