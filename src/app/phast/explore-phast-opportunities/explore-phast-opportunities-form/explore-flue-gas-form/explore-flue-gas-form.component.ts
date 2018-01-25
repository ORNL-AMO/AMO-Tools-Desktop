import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-explore-flue-gas-form',
  templateUrl: './explore-flue-gas-form.component.html',
  styleUrls: ['./explore-flue-gas-form.component.css']
})
export class ExploreFlueGasFormComponent implements OnInit {
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



  toggleFlueGas(){
    
  }


  focusOut() {

  }

  calculate(){
    //this.emitCalculate.emit(true)
  }

  focusField(str: string) {
    //this.changeField.emit(str);
  }

}
