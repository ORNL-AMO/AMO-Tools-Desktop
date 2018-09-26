import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TurbineData } from '../../shared/models/ssmt';
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
  turbineData: TurbineData;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<TurbineData>();
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
    if(!this.turbineData){
      this.turbineData = this.turbineService.initTurbineDataObj();
    }
    this.initForms();
  }

  initForms(){
    this.condensingTurbineForm = this.turbineService.initCondensingFormFromObj(this.turbineData.condensingTurbine);
    this.highToLowTurbineForm = this.turbineService.initPressureFormFromObj(this.turbineData.highToLowTurbine);
    this.highToMediumTurbineForm = this.turbineService.initPressureFormFromObj(this.turbineData.highToMediumTurbine);
    this.mediumToLowTurbineForm = this.turbineService.initPressureFormFromObj(this.turbineData.mediumToLowTurbine);
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }
}
