import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SSMT, SSMTInputs } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { SSMTOutput } from '../../shared/models/steam/steam-outputs';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-ssmt-diagram',
  templateUrl: './ssmt-diagram.component.html',
  styleUrls: ['./ssmt-diagram.component.css']
})
export class SsmtDiagramComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inputData: SSMTInputs;
  @Input()
  outputData: SSMTOutput;
  @Input()
  isBaseline: boolean;
  @Input()
  ssmt: SSMT;
  @Input()
  assessment: Assessment;
  @Output('emitTableSelected')
  emitTableSelected = new EventEmitter<string>();
  @Output('emitHoverChange')
  emitHoverChange = new EventEmitter<string>();
  
  hoveredEquipment: string = 'default';

  constructor() { }

  ngOnInit() {
    console.log(this.outputData);
    console.log(this.inputData);
    console.log(this.assessment);
  }

  setHover(str: string) {
    this.hoveredEquipment = str;
    this.emitHoverChange.emit(this.hoveredEquipment);
  }

  selectTable(str: string) {
    this.emitTableSelected.emit(str);
  }
}
