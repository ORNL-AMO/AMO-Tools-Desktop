import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PSAT, Modification, PsatOutputs, PsatInputs } from '../../shared/models/psat';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { PsatService } from '../psat.service';
import { SettingsService } from '../../settings/settings.service';
import { CompareService } from '../compare.service';

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

  annualSavings: number = 0;
  percentSavings: number = 0;
  title: string;
  unit: string;
  titlePlacement: string;
  tmpNewPumpType: string;
  tmpInitialPumpType: string;
  tmpNewEfficiencyClass: string;
  tmpInitialEfficiencyClass: string;

  baselineResults: PsatOutputs;
  modificationResults: PsatOutputs;
  isFirstChange: boolean = true;

  tabSelect: string = 'results';
  currentField: string;
  constructor(private psatService: PsatService, private settingsService: SettingsService, private compareService: CompareService) { }

  ngOnInit() {
    let globalSettings = this.settingsService.globalSettings;
    if(globalSettings){
      if(globalSettings.defaultPanelTab){
        this.tabSelect = globalSettings.defaultPanelTab;
      }
    }
    this.title = 'Potential Adjustment';
    this.unit = '%';
    this.titlePlacement = 'top';
    this.getResults();
  }

  // checkForExploreMod() {
  //   let i = 0;
  //   this.psat.modifications.forEach(mod => {
  //     if (mod.exploreOpportunities) {
  //       this.exploreModIndex = i;
  //       this.exploreModExists = true;
  //     } else {
  //       i++;
  //     }
  //   })
  //   if(!this.exploreModExists){
  //     this.tabSelect = 'help';
  //   }
  // }

  // addExploreOpp() {
  //   if (!this.psat.modifications) {
  //     this.psat.modifications = new Array();
  //   }
  //   let psatCpy: PSAT = JSON.parse(JSON.stringify(this.assessment.psat.inputs));
  //   psatCpy.name = 'Opportunities Modification';
  //   this.psat.modifications.push({
  //     notes: {
  //       systemBasicsNotes: '',
  //       pumpFluidNotes: '',
  //       motorNotes: '',
  //       fieldDataNotes: ''
  //     },
  //     psat: {
  //       inputs: JSON.parse(JSON.stringify(this.assessment.psat.inputs))
  //     },
  //     exploreOpportunities: true
  //   });
  //   this.save();
  //   this.checkForExploreMod();
  //   this.getResults();
  // }

  addExploreOpp(){
    this.compareService.openNewModal.next(true);
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
    if (this.modificationExists) {
      let modInputs: PsatInputs = JSON.parse(JSON.stringify(this.psat.modifications[this.modificationIndex].psat.inputs));
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
      this.annualSavings = this.baselineResults.annual_cost - this.modificationResults.annual_cost;
      this.percentSavings = Number(Math.round((((this.annualSavings * 100) / this.baselineResults.annual_cost) * 100) / 100).toFixed(0));
    }
  }

  save() {
    //this.assessment.psat = this.psat;
    if (!this.psat.modifications[this.modificationIndex].psat.name) {
      this.psat.modifications[this.modificationIndex].psat.name = 'Opportunities Modification';
    }
    this.saved.emit(true);
  }
  setTab(str: string) {
    this.tabSelect = str;
  }

  focusField($event) {
    this.currentField = $event;
  }

  optimize() {
    let tmpInputs = JSON.parse(JSON.stringify(this.psat.inputs));
    let baseLineResults = this.psatService.resultsExisting(tmpInputs, this.settings);
  }
}
