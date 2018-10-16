import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PressureTurbine, CondensingTurbine } from '../../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../../shared/models/settings';
import { SsmtService } from '../../../../ssmt.service';

@Component({
  selector: 'app-explore-turbine-form',
  templateUrl: './explore-turbine-form.component.html',
  styleUrls: ['./explore-turbine-form.component.css']
})
export class ExploreTurbineFormComponent implements OnInit {
  @Input()
  baselineTurbine: PressureTurbine | CondensingTurbine;
  @Input()
  settings: Settings;
  @Input()
  modificationTurbine: PressureTurbine | CondensingTurbine;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  turbineType: string;

  showUseTurbine: boolean;
  show
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
  }

  toggleTurbineStatus(){
    if(this.showUseTurbine == false){
      this.modificationTurbine.useTurbine = this.baselineTurbine.useTurbine;
    }
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
