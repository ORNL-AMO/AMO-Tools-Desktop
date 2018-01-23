import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PHAST } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';

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
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  exploreModIndex: number;
  @Output('changeField')
  changeField = new EventEmitter<string>();


  constructor() { }

  ngOnInit() {
  }

  startSavePolling(){
    
  }

}
