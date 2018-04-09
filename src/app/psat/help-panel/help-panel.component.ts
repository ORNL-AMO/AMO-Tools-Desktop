import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { PSAT, PsatOutputs } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { Modification, PsatInputs } from '../../shared/models/psat';
import { PsatService } from '../psat.service';
import { SettingsService } from '../../settings/settings.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-help-panel',
  templateUrl: './help-panel.component.html',
  styleUrls: ['./help-panel.component.css']
})
export class HelpPanelComponent implements OnInit {
  @Input()
  currentTab: string;
  // @Input()
  // currentField: string;
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

  tabSelect: string = 'results';
  baselineResults: PsatOutputs;
  modificationResults: PsatOutputs;
  annualSavings: number;
  percentSavings: number;
  getResultsSub: Subscription;
  constructor(private psatService: PsatService, private settingsService: SettingsService) { }

  ngOnInit() {
    this.getResultsSub = this.psatService.getResults.subscribe(val => {
      if (val) {
        this.getResults();
      }
    })

    let globalSettings = this.settingsService.globalSettings;
    if (globalSettings) {
      if (globalSettings.defaultPanelTab) {
        this.tabSelect = globalSettings.defaultPanelTab;
      }
    }
  }

  ngOnDestroy(){
    this.getResultsSub.unsubscribe();
  }

  setTab(str: string) {
    this.tabSelect = str;
  }


  getResults() {
    //create copies of inputs to use for calcs
    let psatInputs: PsatInputs = JSON.parse(JSON.stringify(this.psat.inputs));
    let tmpForm = this.psatService.getFormFromPsat(psatInputs);
    if (tmpForm.status == 'VALID') {
      if (psatInputs.optimize_calculation) {
        this.baselineResults = this.psatService.resultsOptimal(psatInputs, this.settings);
      } else {
        this.baselineResults = this.psatService.resultsExisting(psatInputs, this.settings);
      }
    } else {
      this.baselineResults = this.psatService.emptyResults();
    }
    if (this.modification) {
      let modInputs: PsatInputs = JSON.parse(JSON.stringify(this.modification.psat.inputs));
      tmpForm = this.psatService.getFormFromPsat(modInputs);
      if (tmpForm.status == 'VALID') {
        if (modInputs.optimize_calculation) {
          this.modificationResults = this.psatService.resultsOptimal(modInputs, this.settings);
        } else {
          this.modificationResults = this.psatService.resultsModified(modInputs, this.settings, this.baselineResults.pump_efficiency);
        }
      } else {
        this.modificationResults = this.psatService.emptyResults();
      }
    } else {
      this.modificationResults = this.psatService.emptyResults();
    }
    this.annualSavings = this.baselineResults.annual_cost - this.modificationResults.annual_cost;
    this.percentSavings = Number(Math.round((((this.annualSavings * 100) / this.baselineResults.annual_cost) * 100) / 100).toFixed(0));
  }


  save() {
    this.emitSave.emit(true);
  }
}
