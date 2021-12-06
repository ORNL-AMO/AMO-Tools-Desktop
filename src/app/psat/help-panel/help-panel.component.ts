import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { PSAT, PsatOutputs } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { Modification, PsatInputs } from '../../shared/models/psat';
import { PsatService } from '../psat.service';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { PsatTabService } from '../psat-tab.service';
@Component({
  selector: 'app-help-panel',
  templateUrl: './help-panel.component.html',
  styleUrls: ['./help-panel.component.css']
})
export class HelpPanelComponent implements OnInit {
  @Input()
  currentTab: string;
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  @Input()
  psat: PSAT;
  @Input()
  inSetup: boolean;
  @Input()
  modification: Modification;
  @Input()
  modificationIndex: number;
  @Input()
  saveClicked: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  containerHeight: number;
  @Input()
  showResults: boolean;
  @ViewChild('resultTabs', { static: false }) resultTabs: ElementRef;

  // currentField: string = 'default';
  tabSelect: string = 'results';
  baselineResults: PsatOutputs;
  modificationResults: PsatOutputs;
  annualSavings: number;
  percentSavings: number;
  getResultsSub: Subscription;
  helpHeight: number;
  modificationName: string;
  modifyConditionsTabSub: Subscription;
  constructor(private psatService: PsatService, private settingsDbService: SettingsDbService, private psatTabService: PsatTabService) { }

  ngOnInit() {
    this.getResultsSub = this.psatService.getResults.subscribe(val => {
      if (val) {
        this.getResults();
      }
    })

    let globalSettings = this.settingsDbService.globalSettings;
    if (globalSettings) {
      if (globalSettings.defaultPanelTab) {
        this.tabSelect = globalSettings.defaultPanelTab;
      }
    }

    this.modifyConditionsTabSub = this.psatTabService.modifyConditionsTab.subscribe(val => {
      this.currentTab = val;
    })

  }

  ngOnDestroy() {
    this.getResultsSub.unsubscribe();
    this.modifyConditionsTabSub.unsubscribe();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight) {
      if (!changes.containerHeight.firstChange) {
        this.getContainerHeight();
      }
    }
    if (changes.settings) {
      if (!changes.settings.firstChange) {
        this.getResults();
      }
    }
  }

  getContainerHeight() {
    if (this.containerHeight && this.resultTabs) {
      let tabHeight = this.resultTabs.nativeElement.clientHeight;
      this.helpHeight = this.containerHeight - tabHeight;
    }
  }
  setTab(str: string) {
    this.tabSelect = str;
  }

  getResults() {
    let psatResults: {baselineResults: PsatOutputs, modificationResults: PsatOutputs, annualSavings: number, percentSavings: number};
    if(this.modification){
      this.modificationName = this.modification.psat.name;
      this.modification.psat.valid = this.psatService.isPsatValid(this.modification.psat.inputs, false);
      psatResults = this.psatService.getPsatResults(this.psat.inputs, this.settings, this.modification.psat.inputs)
    }else{
      psatResults = this.psatService.getPsatResults(this.psat.inputs, this.settings);
    }
    this.baselineResults = psatResults.baselineResults;
    this.modificationResults = psatResults.modificationResults;
    this.annualSavings = psatResults.annualSavings;
    this.percentSavings = psatResults.percentSavings;
  }

  save() {
    this.emitSave.emit(true);
  }
}
