import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SSMT } from '../../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../../shared/models/settings';
import { SsmtService } from '../../../../ssmt.service';

@Component({
  selector: 'app-explore-pressure-turbine-form',
  templateUrl: './explore-pressure-turbine-form.component.html',
  styleUrls: ['./explore-pressure-turbine-form.component.css']
})
export class ExplorePressureTurbineFormComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();


  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
  }

  save() {
    this.emitSave.emit(true);
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }
}
