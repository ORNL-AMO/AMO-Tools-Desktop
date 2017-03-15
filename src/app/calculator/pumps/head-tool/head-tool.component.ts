import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-head-tool',
  templateUrl: './head-tool.component.html',
  styleUrls: ['./head-tool.component.css']
})
export class HeadToolComponent implements OnInit {
  @Output('close')
  close = new EventEmitter<boolean>();

  headToolForm: any;
  tabSelect: string = 'results';

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.headToolForm = this.initForm();
  }


  setTab(str: string) {
    this.tabSelect = str;
  }

  closeTool(){
    this.close.emit(true);
  }

  initForm() {
    return this.formBuilder.group({
      'type': [''],
      'suctionPipeDiameter': [''],
      'overpressure': [''],
      'surfaceElevation': [''],
      'suctionLossCoefficients': [''],
      'dischargePipeDiameter': [''],
      'dischargePressure': [''],
      'dischargeElevation': [''],
      'dischargeLineCoefficients': [''],
      'specificGravity': [''],
      'flowRate': [''],
    })
  }

}
