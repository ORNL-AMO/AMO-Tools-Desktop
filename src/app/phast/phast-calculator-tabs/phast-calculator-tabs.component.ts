import { Component, OnInit } from '@angular/core';
import { PhastService } from '../phast.service';

@Component({
  selector: 'app-phast-calculator-tabs',
  templateUrl: './phast-calculator-tabs.component.html',
  styleUrls: ['./phast-calculator-tabs.component.css']
})
export class PhastCalculatorTabsComponent implements OnInit {
  //same as PhastTabsComponent, BehaviorSubject for calculator tabs
  calcTab: string;
  constructor(private phastService: PhastService) { }

  ngOnInit() {
    this.phastService.calcTab.subscribe(val => {
      this.calcTab = val;
    })
  }

  changeCalcTab(str: string) {
    this.phastService.calcTab.next(str);
  }
}
