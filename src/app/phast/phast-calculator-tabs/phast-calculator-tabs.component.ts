import { Component, OnInit } from '@angular/core';
import { PhastService } from '../phast.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-phast-calculator-tabs',
    templateUrl: './phast-calculator-tabs.component.html',
    styleUrls: ['./phast-calculator-tabs.component.css'],
    standalone: false
})
export class PhastCalculatorTabsComponent implements OnInit {
  //same as PhastTabsComponent, BehaviorSubject for calculator tabs
  calcTab: string;
  calcTabSub: Subscription;
  calcTabsCollapsed: boolean = true;
  constructor(private phastService: PhastService) { }

  ngOnInit() {
    this.calcTabSub = this.phastService.calcTab.subscribe(val => {
      this.calcTab = val;
    });
  }

  ngOnDestroy(){
    this.calcTabSub.unsubscribe();
  }

  changeCalcTab(str: string) {
    this.phastService.calcTab.next(str);   
    this.collapseCalcTabs();
  }

  collapseCalcTabs() {
    this.calcTabsCollapsed = !this.calcTabsCollapsed;
  }
}
