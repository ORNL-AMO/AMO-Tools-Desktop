import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { OperatingCostInput, OperatingCostOutput } from "../../../../shared/models/standalone";
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-operating-cost-form',
  templateUrl: './operating-cost-form.component.html',
  styleUrls: ['./operating-cost-form.component.css']
})
export class OperatingCostFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inputs: OperatingCostInput;
  @Input()
  outputs: OperatingCostOutput;
  @Output('calculate')
  calculate = new EventEmitter<OperatingCostInput>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  @ViewChild('formElement') formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean;

  constructor() { }

  ngOnInit() {
  }
  
  ngAfterViewInit(){
    this.setOpHoursModalWidth();
  }

  emitChange() {
    this.calculate.emit(this.inputs);
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }

  closeOperatingHoursModal(){
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal(){
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: number){
    this.inputs.annualOperatingHours = oppHours;
    this.emitChange();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth(){
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
