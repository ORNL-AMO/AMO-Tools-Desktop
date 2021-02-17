import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { StatePointAnalysisInput, StatePointAnalysisOutput } from '../../../shared/models/waste-water';
import { StatePointAnalysisService } from './state-point-analysis.service';

@Component({
  selector: 'app-state-point-analysis',
  templateUrl: './state-point-analysis.component.html',
  styleUrls: ['./state-point-analysis.component.css']
})
export class StatePointAnalysisComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  
  baselineData: StatePointAnalysisInput;
  modificationData: StatePointAnalysisInput;
  output: StatePointAnalysisOutput;
  
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;
  outputSubscription: Subscription;
  
  containerHeight: number;
  currentField: string;
  tabSelect: string = 'graph';
  baselineSelected: boolean = true;
  modificationExists: boolean = false;


  constructor(private settingsDbService: SettingsDbService, 
              private statePointAnalysisService: StatePointAnalysisService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.statePointAnalysisService.baselineData.getValue();
    if(!existingInputs) {
      this.statePointAnalysisService.initDefaultEmptyOutput();
      this.statePointAnalysisService.initDefaultEmptyInputs();
    }
    this.initSubscriptions();
    if(this.modificationData) {
      this.modificationExists = true;
    }
  }

  ngOnDestroy() {
    this.baselineDataSub.unsubscribe();
    this.modificationDataSub.unsubscribe();
    this.outputSubscription.unsubscribe();
  }

  initSubscriptions() {
    this.baselineDataSub = this.statePointAnalysisService.baselineData.subscribe(value => {
      this.setBaselineSelected();
      this.statePointAnalysisService.calculate(this.settings);
    })
    this.modificationDataSub = this.statePointAnalysisService.modificationData.subscribe(value => {
      this.statePointAnalysisService.calculate(this.settings);
    })
    this.outputSubscription = this.statePointAnalysisService.output.subscribe(val => {
      if (val) {
        this.output = val;
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  changeFuelType() {
    this.statePointAnalysisService.initDefaultEmptyOutput();
  }

  createModification() {
    this.statePointAnalysisService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
    this.statePointAnalysisService.calculate(this.settings);
   }

   btnResetData() {
    this.modificationExists = false;
    this.statePointAnalysisService.initDefaultEmptyInputs();
    this.statePointAnalysisService.resetData.next(true);
  }

  btnGenerateExample() {
    this.modificationExists = true;
    this.statePointAnalysisService.generateExampleData(this.settings);
    this.baselineSelected = true;
  }

  setBaselineSelected() {
    if (this.baselineSelected == false) {
      this.baselineSelected = true;
    }
  }

  setModificationSelected() {
    if (this.baselineSelected == true) {
      this.baselineSelected = false;
    }
  }
  
  setTab(str: string) {
    this.tabSelect = str;
  }
  
  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
    }
  }
}

