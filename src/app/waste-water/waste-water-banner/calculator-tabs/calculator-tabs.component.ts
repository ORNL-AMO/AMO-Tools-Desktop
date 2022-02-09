import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterService } from '../../waste-water.service';

@Component({
  selector: 'app-calculator-tabs',
  templateUrl: './calculator-tabs.component.html',
  styleUrls: ['./calculator-tabs.component.css']
})
export class WasteWaterCalculatorTabsComponent implements OnInit {
  calcTabSub: Subscription;
  calcTab: string;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.calcTabSub = this.wasteWaterService.calcTab.subscribe(currentCalcTab => {
      this.calcTab = currentCalcTab;
    });
  }

  ngOnDestroy() {
    this.calcTabSub.unsubscribe();
  }

  changeCalcTab(str: string) {
    this.wasteWaterService.calcTab.next(str);
  }
}
