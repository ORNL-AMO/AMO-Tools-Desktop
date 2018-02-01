import { Component, OnInit, ViewEncapsulation, Input, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { PHAST, Modification } from '../../../shared/models/phast/phast';
import { LossTab } from '../../tabs';

@Component({
  selector: 'app-losses-result-panel',
  templateUrl: './losses-result-panel.component.html',
  styleUrls: ['./losses-result-panel.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LossesResultPanelComponent implements OnInit {
  @Input()
  lossesTab: LossTab;
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Input()
  toggleCalculate: boolean;
  @Input()
  modification: Modification;
  @Input()
  inSetup: boolean;
  @Input()
  containerHeight: number;

  @ViewChild('resultTabs') resultTabs: ElementRef;

  tabSelect: string = 'results';
  helpHeight: number;
  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.containerHeight){
      if(!changes.containerHeight.firstChange){
        this.getContainerHeight();
      }
    }
  }

  getContainerHeight() {
    if (this.containerHeight && this.resultTabs) {
      let tabHeight = this.resultTabs.nativeElement.clientHeight;
      this.helpHeight = this.containerHeight - tabHeight;
      console.log(this.helpHeight);
    }
  }

  setTab(str: string){
    this.tabSelect = str;
  }
}
