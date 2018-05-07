import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { FanSetupService } from './fan-setup.service';
import { FormGroup } from '@angular/forms';
import { FanSetup } from '../../shared/models/fans';

@Component({
  selector: 'app-fan-setup',
  templateUrl: './fan-setup.component.html',
  styleUrls: ['./fan-setup.component.css']
})
export class FanSetupComponent implements OnInit {
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;
  @Input()
  fanSetup: FanSetup;
  @Input()
  modificationIndex: number;

  fanTypes: Array<string> = [
    'Airfoil (SISW)',
    'Backward Curved (SISW)',
    'Radial (SISW)',
    'Radial Tip (SISW)',
    'Backward Inclined (SISW)',
    'Airfoil (DIDW)',
    'Backward Inclined (DIDW)',
    'ICF Air handling',
    'ICF Material handling',
    'ICF Long shavings'
  ]

  drives: Array<string> = [
    'Direct Drive',
    'V-Belt Drive',
    'Notched V-Belt Drive',
    'Synchronous Belt Drive'
  ];

  fanForm: FormGroup;
  constructor(private fanSetupService: FanSetupService) { }

  ngOnInit() {
    this.init();
    if(!this.selected){
      this.disableForm();
    }
  }
  ngOnChanges(changes: SimpleChanges){
    if(changes.selected && !changes.selected.firstChange){
      if(this.selected){
        this.enableForm();
      }else{
        this.disableForm();
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.firstChange) {
      this.init();
    }
  }

  init(){
    this.fanForm =  this.fanSetupService.getFormFromObj(this.fanSetup);
  }
  disableForm() {
    this.fanForm.controls.fanType.disable();
    this.fanForm.controls.drive.disable();
  }

  enableForm() {
    this.fanForm.controls.fanType.enable();
    this.fanForm.controls.drive.enable();
  }

  focusField(){

  }

  save(){

  }

  subtractNum(){

  }

  addNum(){

  }
}
