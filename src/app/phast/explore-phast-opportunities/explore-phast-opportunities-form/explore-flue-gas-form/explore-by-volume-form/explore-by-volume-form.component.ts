import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { PHAST } from '../../../../../shared/models/phast/phast';
import { Settings } from '../../../../../shared/models/settings';

@Component({
  selector: 'app-explore-by-volume-form',
  templateUrl: './explore-by-volume-form.component.html',
  styleUrls: ['./explore-by-volume-form.component.css']
})
export class ExploreByVolumeFormComponent implements OnInit {
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
