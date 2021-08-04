import { Component, Input, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { AnalysisGraphItem, WasteWaterAnalysisService } from '../../waste-water-analysis/waste-water-analysis.service';

@Component({
  selector: 'app-srt-graphs',
  templateUrl: './srt-graphs.component.html',
  styleUrls: ['./srt-graphs.component.css']
})
export class SrtGraphsComponent implements OnInit {
  @Input()
  printView: boolean;
  @Input()
  settings: Settings;

  analysisGraphItems: Array<AnalysisGraphItem>;
  constructor(private wasteWaterAnalysisService: WasteWaterAnalysisService) { }

  ngOnInit(): void {
    let reportGraphVariables: Array<string> = [
      'Se',
      'MLVSS',
      'MLSS',
      'SludgeProd',
      'SolidProd',
      'O2Reqd',
      'EstimatedEff'
    ]

    this.wasteWaterAnalysisService.initXAxisVariables();
    this.wasteWaterAnalysisService.setGraphData();
    this.analysisGraphItems = this.wasteWaterAnalysisService.analysisGraphItems.getValue();
    this.analysisGraphItems = this.analysisGraphItems.filter(graphItem => {
      return reportGraphVariables.includes(graphItem.variableY.name)
    });
  }

}
