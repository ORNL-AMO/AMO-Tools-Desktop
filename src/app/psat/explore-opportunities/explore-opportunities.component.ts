import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { PSAT, Modification, PsatOutputs, PsatInputs } from '../../shared/models/psat';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { PsatService } from '../psat.service';
import { CompareService } from '../compare.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { PumpFluidService } from '../pump-fluid/pump-fluid.service';
import { FieldDataService } from '../field-data/field-data.service';
import { MotorService } from '../motor/motor.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-explore-opportunities',
  templateUrl: './explore-opportunities.component.html',
  styleUrls: ['./explore-opportunities.component.css']
})
export class ExploreOpportunitiesComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Input()
  psat: PSAT;
  @Input()
  containerHeight: number;
  @Input()
  modificationIndex: number;
  @Input()
  modificationExists: boolean;
  @Output('emitAddNewMod')
  emitAddNewMod = new EventEmitter<boolean>();


  @ViewChild('resultTabs') resultTabs: ElementRef;

  annualSavings: number = 0;
  percentSavings: number = 0;
  title: string;
  unit: string;
  titlePlacement: string;
  baselineResults: PsatOutputs;
  modificationResults: PsatOutputs;

  tabSelect: string = 'results';
  currentField: string;
  helpHeight: number;
  constructor(private psatService: PsatService, private settingsDbService: SettingsDbService, private compareService: CompareService) { }

  ngOnInit() {
    let globalSettings = this.settingsDbService.globalSettings;
    if (globalSettings) {
      if (globalSettings.defaultPanelTab) {
        this.tabSelect = globalSettings.defaultPanelTab;
      }
    }
    this.title = 'Potential Adjustment';
    this.unit = '%';
    this.titlePlacement = 'top';
    this.getResults();
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
    if(changes.modificationIndex && !changes.modificationIndex.isFirstChange()){
      this.getResults();
    }
  }

  getContainerHeight() {
    if (this.containerHeight && this.resultTabs) {
      let tabHeight = this.resultTabs.nativeElement.clientHeight;
      this.helpHeight = this.containerHeight - tabHeight;
    }
  }

  addExploreOpp() {
    this.compareService.openNewModal.next(true);
  }
  getResults() {
    let psatResults: {baselineResults: PsatOutputs, modificationResults: PsatOutputs, annualSavings: number, percentSavings: number};
    if(this.modificationExists){
      psatResults = this.psatService.getPsatResults(this.psat.inputs, this.settings, this.psat.modifications[this.modificationIndex].psat.inputs)
    }else{
      psatResults = this.psatService.getPsatResults(this.psat.inputs, this.settings);
    }
    this.baselineResults = psatResults.baselineResults;
    this.modificationResults = psatResults.modificationResults;
    this.annualSavings = psatResults.annualSavings;
    this.percentSavings = psatResults.percentSavings;
  }

  save() {
    this.saved.emit(true);
  }
  setTab(str: string) {
    this.tabSelect = str;
  }

  focusField($event) {
    this.currentField = $event;
  }

  addNewMod() {
    this.emitAddNewMod.emit(true);
  }
}
