import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';
import { SSMT } from '../../../../../shared/models/steam/ssmt';
import { SsmtService } from '../../../../ssmt.service';

@Component({
  selector: 'app-explore-condensing-turbine-form',
  templateUrl: './explore-condensing-turbine-form.component.html',
  styleUrls: ['./explore-condensing-turbine-form.component.css']
})
export class ExploreCondensingTurbineFormComponent implements OnInit {
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
