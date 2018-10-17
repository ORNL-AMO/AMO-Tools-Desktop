import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PressureTurbineOperationTypes, PressureTurbine } from '../../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../../shared/models/settings';
import { Quantity } from '../../../../../shared/models/steam/steam-inputs';
import { ExploreOpportunitiesService } from '../../../explore-opportunities.service';

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
  emitSave = new EventEmitter<{baselineTurbine: PressureTurbine, modificationTurbine: PressureTurbine}>();
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
  constructor(private exploreOpportunitiesService: ExploreOpportunitiesService) { }

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
    this.emitSave.emit({baselineTurbine: this.baselineTurbine, modificationTurbine: this.modificationTurbine});
  }

  focusField(str: string) {
    this.exploreOpportunitiesService.currentTab.next('turbine');
    this.exploreOpportunitiesService.currentField.next(str);
  }

  focusOut() {
    this.exploreOpportunitiesService.currentTab.next('turbine');
    this.exploreOpportunitiesService.currentField.next('default');
  }
}
