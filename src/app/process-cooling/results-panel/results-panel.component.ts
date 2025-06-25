import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProcessCoolingMainTabString, ProcessCoolingService, ProcessCoolingSetupTabString } from '../process-cooling.service';

@Component({
  selector: 'app-results-panel',
  standalone: false,
  templateUrl: './results-panel.component.html',
  styleUrl: './results-panel.component.css'
})
export class ResultsPanelComponent {

  setupTabSub: Subscription;
  mainTabSub: Subscription;
  mainTab: ProcessCoolingMainTabString;
  panelTabSelect: PanelTab = 'help';
  displayInventory: boolean;
  constructor(private processCoolingService: ProcessCoolingService) { }

  ngOnInit(): void {
    this.setupTabSub = this.processCoolingService.setupTab.subscribe(val => {
      this.displayInventory = val == 'inventory';
      if(this.displayInventory){
        this.panelTabSelect = val as PanelTab;
      } else {
        this.panelTabSelect = 'help';
      }

    });

    this.mainTabSub = this.processCoolingService.mainTab.subscribe(val => {
      this.mainTab = val;
    });
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.mainTabSub.unsubscribe();
  }

  setTab(str: PanelTab) {
    this.panelTabSelect = str;
  }
}


  export type PanelTab = ProcessCoolingSetupTabString | 'help' | 'results';