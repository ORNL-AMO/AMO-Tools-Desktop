import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-explore-charge-materials-form',
  templateUrl: './explore-charge-materials-form.component.html',
  styleUrls: ['./explore-charge-materials-form.component.css']
})
export class ExploreChargeMaterialsFormComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  
  constructor() { }

  ngOnInit() {
  }

}
