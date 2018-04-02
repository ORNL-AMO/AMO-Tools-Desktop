import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { PHAST } from '../../shared/models/phast/phast';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { LossTab } from '../tabs';
import { ModalDirective } from 'ngx-bootstrap';
import { PhastCompareService } from '../phast-compare.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
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
  @ViewChild('addModificationModal') public addModificationModal: ModalDirective;

  @Output('save')
  save = new EventEmitter<boolean>();

  tabSelect: string = 'results';
  exploreModIndex: number;
  currentField: string = 'default';
  toggleCalculate: boolean = false;
  lossTab: LossTab = {
    step: 0,
    tabName: '',
    componentStr: ''
  };

  exploreModExists: boolean = false;
  modExists: boolean = false;
  selectModificationSubscription: Subscription;
  constructor(private phastCompareService: PhastCompareService) { }

  ngOnInit() {
    if (this.phast.modifications) {
      if (this.phast.modifications.length != 0) {
        this.modExists = true;
        this.selectModificationSubscription = this.phastCompareService.selectedModification.subscribe(mod => {
          if (mod) {
            this.exploreModIndex = _.findIndex(this.phast.modifications, (val) => {
              return val.phast.name == mod.name
            })
            if(this.exploreModIndex){
              this.exploreModExists = true;
            }
          }else{
            this.checkForExploreMod();
          }
        })
      }
    }
  }

  ngOnDestroy(){
    this.selectModificationSubscription.unsubscribe();
  }

  checkForExploreMod() {
    let i = 0;
    //find explore opportunites modificiation
    this.phast.modifications.forEach(mod => {
      if (mod.exploreOpportunities) {
        this.exploreModIndex = i;
        this.exploreModExists = true;
        this.phastCompareService.selectedModification.next(this.phast.modifications[this.exploreModIndex].phast);
      } else {
        i++;
      }
    })
  }

  addMod() {
    let phastCpy: PHAST = JSON.parse(JSON.stringify(this.assessment.phast));
    phastCpy.name = 'Explore Opportunities';
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
      phast: phastCpy,
      exploreOpportunities: true
    });
    this.modExists = true;
    this.closeModal();
    this.getResults();
    this.checkForExploreMod();
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

  closeModal() {
    this.addModificationModal.hide();
  }


  openModal() {
    if (!this.modExists) {
      this.addModificationModal.show();
    } else {
      this.addMod();
    }
  }
}
