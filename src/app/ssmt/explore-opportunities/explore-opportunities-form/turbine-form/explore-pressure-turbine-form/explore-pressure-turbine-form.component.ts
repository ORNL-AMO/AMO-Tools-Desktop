import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { SSMT, PressureTurbineOperationTypes, PressureTurbine } from '../../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../../shared/models/settings';
import { SsmtService } from '../../../../ssmt.service';
import { Quantity } from '../../../../../shared/models/steam/steam-inputs';

@Component({
  selector: 'app-explore-pressure-turbine-form',
  templateUrl: './explore-pressure-turbine-form.component.html',
  styleUrls: ['./explore-pressure-turbine-form.component.css']
})
export class ExplorePressureTurbineFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  baselineTurbine: PressureTurbine;
  @Input()
  modificationTurbine: PressureTurbine;
  @Output('emitShowTurbine')
  emitShowTurbine = new EventEmitter<boolean>();
  @Input()
  turbineType: string;
  @Input()
  showFormToggle: boolean;

  turbineTypeOptions: Array<Quantity>;

  showOperation: boolean;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.turbineTypeOptions = PressureTurbineOperationTypes;
    this.initOperationType();
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.showFormToggle && !changes.showFormToggle.isFirstChange()){
      if(this.showFormToggle == false){
        this.showOperation = false;
      }
    }
  }


  initOperationType() {
    if (this.baselineTurbine.operationType != this.modificationTurbine.operationType) {
      this.showOperation = true;
      this.emitShowTurbine.emit(true);
    } else if (this.baselineTurbine.operationType != 2) {
      if (this.baselineTurbine.operationValue1 != this.modificationTurbine.operationValue1 ||
        this.baselineTurbine.operationValue2 != this.modificationTurbine.operationValue2) {
        this.showOperation = true;
        this.emitShowTurbine.emit(true);
      }
    }
  }


  toggleOperationType(){
    
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
