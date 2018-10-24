import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { SsmtService } from '../ssmt.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { SSMT } from '../../shared/models/steam/ssmt';

@Component({
  selector: 'app-help-panel',
  templateUrl: './help-panel.component.html',
  styleUrls: ['./help-panel.component.css']
})
export class HelpPanelComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inSetup: boolean;
  @Input()
  ssmt: SSMT;
  @Input()
  containerHeight: number;
  @Input()
  modificationIndex: number;

  @ViewChild('resultTabs') resultTabs: ElementRef;
  stepTab: string;
  stepTabSubscription: Subscription;
  tabSelect: string = 'help';
  helpHeight: number;

  currentFieldSubscription: Subscription;
  currentField: string;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    if (this.inSetup) {
      this.stepTabSubscription = this.ssmtService.stepTab.subscribe(tab => {
        this.stepTab = tab;
      })
    }
    else {
      this.stepTabSubscription = this.ssmtService.steamModelTab.subscribe(val => {
        this.stepTab = val;
      })
    }

    this.currentFieldSubscription = this.ssmtService.currentField.subscribe(val => {
      this.currentField = val;
    })
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  ngOnDestroy() {
    this.stepTabSubscription.unsubscribe();
    this.currentFieldSubscription.unsubscribe();
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  getContainerHeight() {
    if (this.containerHeight && this.resultTabs) {
      let tabHeight = this.resultTabs.nativeElement.clientHeight;
      this.helpHeight = this.containerHeight - tabHeight;
    }
  }

  save(){
    
  }
}
