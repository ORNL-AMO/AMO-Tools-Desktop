import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PSAT, Modification, PsatOutputs } from '../../shared/models/psat';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { PsatService } from '../psat.service';

@Component({
  selector: 'app-explore-opportunities',
  templateUrl: './explore-opportunities.component.html',
  styleUrls: ['./explore-opportunities.component.css']
})
export class ExploreOpportunitiesComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  saveClicked: boolean;
  @Input()
  settings: Settings;
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Input()
  psat: PSAT;

  annualSavings: number;
  optimizationRating: number;
  title: string;
  unit: string;
  titlePlacement: string;
  tmpNewPumpType: string;
  tmpInitialPumpType: string;
  tmpNewEfficiencyClass: string;
  tmpInitialEfficiencyClass: string;
  testVal: string;

  baselineResults: PsatOutputs;
  modificationResults: PsatOutputs;
  isFirstChange: boolean = true;
  exploreModIndex: number = 0;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    // this.psat = JSON.parse(JSON.stringify(this.assessment.psat));
    if (!this.psat.modifications) {
      this.psat.modifications = new Array();
      this.psat.modifications.push({
        notes: {
          systemBasicsNotes: '',
          pumpFluidNotes: '',
          motorNotes: '',
          fieldDataNotes: ''
        },
        psat: {
          inputs: JSON.parse(JSON.stringify(this.assessment.psat.inputs))
        },
        exploreOpportunities: true
      });
      this.exploreModIndex = 0;
      this.psat.modifications[this.exploreModIndex].psat.name = 'Opportunities Modification'
    } else {
      let i = 0;
      let exists = false;
      //find explore opportunites modificiation
      this.psat.modifications.forEach(mod => {
        if (mod.exploreOpportunities) {
          this.exploreModIndex = i;
          exists = true;
        } else {
          i++;
        }
      })
      //none found add one
      if (!exists) {
        this.psat.modifications.push({
          notes: {
            systemBasicsNotes: '',
            pumpFluidNotes: '',
            motorNotes: '',
            fieldDataNotes: ''
          },
          psat: {
            inputs: JSON.parse(JSON.stringify(this.assessment.psat.inputs))
          },
          exploreOpportunities: true
        });
        this.exploreModIndex = this.psat.modifications.length - 1;
        this.psat.modifications[this.exploreModIndex].psat.name = 'Opportunities Modification'
      }
    }

    this.title = 'Potential Adjustment Results';
    this.unit = '%';
    this.titlePlacement = 'top';
    this.getResults();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange) {
      if (changes.saveClicked) {
        this.save();
      }
    } else {
      this.isFirstChange = false;
    }
  }

  getResults() {
    this.baselineResults = this.psatService.results(this.psat.inputs, this.settings);
    this.modificationResults = this.psatService.results(this.psat.modifications[this.exploreModIndex].psat.inputs, this.settings);
    this.annualSavings = this.baselineResults.existing.annual_cost - this.modificationResults.existing.annual_cost;
    this.optimizationRating = Number((Math.round(this.modificationResults.existing.optimization_rating * 100 * 100) / 100).toFixed(0));
  }

  save() {
    //this.assessment.psat = this.psat;
    this.saved.emit(true);
  }
}
