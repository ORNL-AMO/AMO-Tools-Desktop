import { Component, Input, OnInit } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-flue-gas-moisture-panel',
    templateUrl: './flue-gas-moisture-panel.component.html',
    styleUrls: ['./flue-gas-moisture-panel.component.css']
  })
  
  export class FlueGasMoisturePanelComponent implements OnInit {
    @Input()
    settings: Settings;
    
    tabSelect: string = "results";
    
    constructor() {
    }
    
    ngOnInit() {
    }

    setTab(tab: string) {
        this.tabSelect = tab;
    }
  }