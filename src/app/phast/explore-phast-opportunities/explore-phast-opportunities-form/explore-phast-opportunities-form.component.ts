import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PHAST, ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { PhastResultsService } from '../../phast-results.service';

@Component({
  selector: 'app-explore-phast-opportunities-form',
  templateUrl: './explore-phast-opportunities-form.component.html',
  styleUrls: ['./explore-phast-opportunities-form.component.css']
})
export class ExplorePhastOpportunitiesFormComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('changeField')
  changeField = new EventEmitter<string>();

  resultsCategories: ShowResultsCategories;

  showCharge: boolean = false;
  showFixture: boolean = false;
  showLeakage: boolean = false;
  showWall: boolean = false;
  showOpening: boolean = false;
  constructor(private phastResultsService: PhastResultsService) { }

  ngOnInit() {
    this.resultsCategories = this.phastResultsService.getResultCategories(this.settings);
    
    if(this.phast.losses.chargeMaterials){
      this.showCharge = true;
    }
    if(this.phast.losses.fixtureLosses){
      this.showFixture = true;
    }
    if(this.phast.losses.leakageLosses){
      this.showLeakage = true;
    }
    if(this.phast.losses.wallLosses){
      this.showWall = true;
    }
    if(this.phast.losses.openingLosses){
      this.showOpening = true;
    }
  
  }

  calculate(){
    this.emitCalculate.emit(true);
  }

  focusField(str: string){
    this.changeField.emit(str);
  }
}
