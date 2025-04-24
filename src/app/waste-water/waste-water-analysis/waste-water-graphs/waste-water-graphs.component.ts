import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnalysisGraphItem, WasteWaterAnalysisService } from '../waste-water-analysis.service';

@Component({
    selector: 'app-waste-water-graphs',
    templateUrl: './waste-water-graphs.component.html',
    styleUrls: ['./waste-water-graphs.component.css'],
    standalone: false
})
export class WasteWaterGraphsComponent implements OnInit {
  @Input()
  containerHeight: number;


  analysisGraphItemsSub: Subscription;
  analysisGraphItems: Array<AnalysisGraphItem>;
  constructor(private wasteWaterAnalysisService: WasteWaterAnalysisService) { }

  ngOnInit(): void {
    this.analysisGraphItemsSub = this.wasteWaterAnalysisService.analysisGraphItems.subscribe(val => {
      this.analysisGraphItems = val.filter(item => { return item.selected });
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 200)
    });
  }

  ngOnDestroy() {
    this.analysisGraphItemsSub.unsubscribe();
  }

  ngAfterViewInit() {
    window.dispatchEvent(new Event('resize'));
  }

}
