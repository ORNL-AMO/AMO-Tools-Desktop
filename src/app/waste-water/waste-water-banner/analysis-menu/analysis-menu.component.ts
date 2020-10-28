import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnalysisGraphItem, WasteWaterAnalysisService } from '../../waste-water-analysis/waste-water-analysis.service';

@Component({
  selector: 'app-analysis-menu',
  templateUrl: './analysis-menu.component.html',
  styleUrls: ['./analysis-menu.component.css']
})
export class AnalysisMenuComponent implements OnInit {

  analysisTab: string;
  analysisTabSub: Subscription;
  analysisGraphItemsSub: Subscription;
  analysisGraphItems: Array<AnalysisGraphItem>;
  showDropdown: boolean = false;
  constructor(private wasteWaterAnalysisService: WasteWaterAnalysisService) { }

  ngOnInit(): void {
    this.analysisTabSub = this.wasteWaterAnalysisService.analysisTab.subscribe(val => {
      this.analysisTab = val;
    });

    this.analysisGraphItemsSub = this.wasteWaterAnalysisService.analysisGraphItems.subscribe(val => {
      this.analysisGraphItems = val;
    });
  }

  ngOnDestroy() {
    this.analysisTabSub.unsubscribe();
    this.analysisGraphItemsSub.unsubscribe();
  }

  changeTab(str: string) {
    this.wasteWaterAnalysisService.analysisTab.next(str);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  toggleSelected(analysisGraphItem: AnalysisGraphItem) {
    analysisGraphItem.selected = !analysisGraphItem.selected;
    this.wasteWaterAnalysisService.analysisGraphItems.next(this.analysisGraphItems);
  }
}
