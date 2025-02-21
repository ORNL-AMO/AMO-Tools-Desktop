import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ExploreOpportunitiesResults, PSAT, PsatOutputs, PsatValid } from '../../shared/models/psat';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { PsatService } from '../psat.service';
import { CompareService } from '../compare.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SnackbarService } from '../../shared/snackbar-notification/snackbar.service';

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

  @ViewChild('resultTabs', { static: false }) resultTabs: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  annualSavings: number = 0;
  co2EmissionsSavings: number = 0;
  percentSavings: number = 0;
  // title: string;
  // unit: string;
  // titlePlacement: string;
  baselineResults: PsatOutputs;
  modificationResults: PsatOutputs;
  sankeyView: string = 'Baseline';
  opportunityPsatValid: PsatValid;

  tabSelect: string = 'results';
  currentField: string;
  helpHeight: number;
  smallScreenTab: string = 'form';
  constructor(private psatService: PsatService, 
    private settingsDbService: SettingsDbService, 
    private compareService: CompareService, 
    private snackbarService: SnackbarService) { }

  ngOnInit() {
    let globalSettings = this.settingsDbService.globalSettings;
    if (globalSettings) {
      if (globalSettings.defaultPanelTab) {
        this.tabSelect = globalSettings.defaultPanelTab;
      }
    }
    // this.title = 'Potential Adjustment';
    // this.unit = '%';
    // this.titlePlacement = 'top';
    this.getResults();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
      this.getContainerHeight();
      this.notifyExploreOpps();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight) {
      if (!changes.containerHeight.firstChange) {
        this.getContainerHeight();
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.isFirstChange()) {
      this.getResults();
      this.notifyExploreOpps();
    }
  }

  getContainerHeight() {
    if (this.containerHeight && this.resultTabs) {       
      let tabHeight = this.resultTabs.nativeElement.clientHeight;
      this.helpHeight = this.containerHeight - tabHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.helpHeight = this.containerHeight - tabHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }     
    }
  }

  resizeTabs(){
    if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
      this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
    }
    
  }

  addExploreOpp() {
    this.compareService.openNewModal.next(true);
  }
  getResults() {
    let psatResults: ExploreOpportunitiesResults;
    if (this.modificationExists) {
      if (this.psat.modifications[this.modificationIndex].psat.inputs.whatIfScenario === true) {
        this.psat.modifications[this.modificationIndex].psat.valid = this.psatService.isPsatValid(this.psat.modifications[this.modificationIndex].psat.inputs, false);
        this.opportunityPsatValid = this.psat.modifications[this.modificationIndex].psat.valid;
        psatResults = this.psatService.getPsatResults(this.psat.inputs, this.settings, this.psat.modifications[this.modificationIndex].psat.inputs);
      } else if (!this.psat.modifications[this.modificationIndex].psat.inputs.whatIfScenario) {
        // Pass scenario as baseline
        this.psat.modifications[this.modificationIndex].psat.valid = this.psatService.isPsatValid(this.psat.modifications[this.modificationIndex].psat.inputs, true);
        this.opportunityPsatValid = this.psat.modifications[this.modificationIndex].psat.valid;
        psatResults = this.psatService.getPsatResults(this.psat.inputs, this.settings);
        psatResults.modificationResults = psatResults.baselineResults;
      }
    } else {
      this.psat.valid = this.psatService.isPsatValid(this.psat.inputs, true);
      this.opportunityPsatValid = this.psat.valid;
      psatResults = this.psatService.getPsatResults(this.psat.inputs, this.settings);
    }
    this.baselineResults = psatResults.baselineResults;
    this.modificationResults = psatResults.modificationResults;
    this.annualSavings = psatResults.annualSavings;
    this.percentSavings = psatResults.percentSavings;
    this.co2EmissionsSavings = psatResults.co2EmissionsSavings;
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

  notifyExploreOpps() {
    if (this.modificationExists) {
      if (!this.psat.modifications[this.modificationIndex].exploreOpportunities) {
        this.snackbarService.setSnackbarMessage('exploreOpportunities', 'info', 'long');
      } 
    }
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
