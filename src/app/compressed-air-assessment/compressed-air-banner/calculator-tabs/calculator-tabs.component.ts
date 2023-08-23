import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
  selector: 'app-calculator-tabs',
  templateUrl: './calculator-tabs.component.html',
  styleUrls: ['./calculator-tabs.component.css']
})
export class CalculatorTabsComponent implements OnInit {
  calcTabSub: Subscription;
  calcTab: string;
  calcTabsCollapsed: boolean = true;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.calcTabSub = this.compressedAirAssessmentService.calcTab.subscribe(currentCalcTab => {
      this.calcTab = currentCalcTab;
    });
  }

  ngOnDestroy() {
    this.calcTabSub.unsubscribe();
  }

  changeCalcTab(str: string) {
    this.compressedAirAssessmentService.calcTab.next(str);    
    this.collapseCalcTabs();
  }

  collapseCalcTabs() {
    this.calcTabsCollapsed = !this.calcTabsCollapsed;
  }
}
