import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TurbineInput } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { TurbineService } from './turbine.service';
import { SsmtService } from '../ssmt.service';

@Component({
  selector: 'app-turbine',
  templateUrl: './turbine.component.html',
  styleUrls: ['./turbine.component.css']
})
export class TurbineComponent implements OnInit {
  @Input()
  turbineInput: TurbineInput;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<TurbineInput>();
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;


  condensingTurbineForm: FormGroup;
  highToLowTurbineForm: FormGroup;
  highToMediumTurbineForm: FormGroup;
  mediumToLowTurbineForm: FormGroup;
  constructor(private turbineService: TurbineService, private ssmtService: SsmtService) { }

  ngOnInit() {
    if(!this.turbineInput){
      this.turbineInput = this.turbineService.initTurbineInputObj();
    }
    this.initForms();
  }

  initForms(){
    this.condensingTurbineForm = this.turbineService.initCondensingFormFromObj(this.turbineInput.condensingTurbine);
    this.highToLowTurbineForm = this.turbineService.initPressureFormFromObj(this.turbineInput.highToLowTurbine);
    this.highToMediumTurbineForm = this.turbineService.initPressureFormFromObj(this.turbineInput.highToMediumTurbine);
    this.mediumToLowTurbineForm = this.turbineService.initPressureFormFromObj(this.turbineInput.mediumToLowTurbine);
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }
}
