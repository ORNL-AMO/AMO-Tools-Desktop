import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PHAST } from '../../shared/models/phast/phast';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { LossTab } from '../tabs';

@Component({
  selector: 'app-explore-phast-opportunities',
  templateUrl: './explore-phast-opportunities.component.html',
  styleUrls: ['./explore-phast-opportunities.component.css']
})
export class ExplorePhastOpportunitiesComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  containerHeight: number;

  @Output('save')
  save = new EventEmitter<boolean>();
  @Input()
  saveClicked: boolean;

  tabSelect: string = 'results';
  exploreModIndex: number;
  currentField: string = 'default';
  toggleCalculate: boolean = false;
  lossTab: LossTab = {
    step: 0,
    tabName: '',
    componentStr: ''
  };
  counter: any;
  isFirstChange: boolean = true;
  constructor() { }

  ngOnInit() {
    if (!this.phast.modifications) {
      this.phast.modifications = new Array();
      this.addMod();
      this.exploreModIndex = 0;
      this.phast.modifications[this.exploreModIndex].phast.name = 'Opportunities Modification';
    } else {
      let i = 0;
      let exists = false;
      //find explore opportunites modificiation
      this.phast.modifications.forEach(mod => {
        if (mod.exploreOpportunities) {
          this.exploreModIndex = i;
          exists = true;
        } else {
          i++;
        }
      })
      //none found add one
      if (!exists) {
        this.addMod();
        this.exploreModIndex = this.phast.modifications.length - 1;
        this.phast.modifications[this.exploreModIndex].phast.name = 'Opportunities Modification'
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange) {
      if (changes.saveClicked) {
        this.save.emit(true);
      }
    } else {
      this.isFirstChange = false;
    }
  }

  addMod() {
    this.phast.modifications.push({
      notes: {
        chargeNotes: '',
        wallNotes: '',
        atmosphereNotes: '',
        fixtureNotes: '',
        openingNotes: '',
        coolingNotes: '',
        flueGasNotes: '',
        otherNotes: '',
        leakageNotes: '',
        extendedNotes: '',
        slagNotes: '',
        auxiliaryPowerNotes: '',
        exhaustGasNotes: '',
        energyInputExhaustGasNotes: '',
        heatSystemEfficiencyNotes: '',
        operationsNotes: ''
      },
      phast: JSON.parse(JSON.stringify(this.assessment.phast)),
      exploreOpportunities: true
    });
  }

  setTab(str: string) {
    this.tabSelect = str;
  }


  getResults() {
    this.startSavePolling();
    this.toggleCalculate = !this.toggleCalculate;
  }

  focusField(str: string) {
    this.currentField = str;
  }


  changeTab(tab: LossTab) {
    this.lossTab = tab;
  }

  startSavePolling() {
    this.save.emit(true);
  }
}
