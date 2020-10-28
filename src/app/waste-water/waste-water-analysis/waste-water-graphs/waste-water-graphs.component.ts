import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnalysisGraphItem, WasteWaterAnalysisService } from '../waste-water-analysis.service';

@Component({
  selector: 'app-waste-water-graphs',
  templateUrl: './waste-water-graphs.component.html',
  styleUrls: ['./waste-water-graphs.component.css']
})
export class WasteWaterGraphsComponent implements OnInit {

  analysisGraphItemsSub: Subscription;
  analysisGraphItems: Array<AnalysisGraphItem>;
  constructor(private wasteWaterAnalysisService: WasteWaterAnalysisService) { }

  ngOnInit(): void {
    this.analysisGraphItemsSub = this.wasteWaterAnalysisService.analysisGraphItems.subscribe(val => {
      this.analysisGraphItems = val.filter(item => { return item.selected });
    });
  }

  ngOnDestroy() {
    this.analysisGraphItemsSub.unsubscribe();
  }

}
