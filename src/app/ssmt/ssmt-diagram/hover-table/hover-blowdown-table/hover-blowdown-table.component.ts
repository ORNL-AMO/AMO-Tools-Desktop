import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { BoilerOutput, SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { BoilerInput, SSMTInputs } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-hover-blowdown-table',
    templateUrl: './hover-blowdown-table.component.html',
    styleUrls: ['./hover-blowdown-table.component.css'],
    standalone: false
})
export class HoverBlowdownTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  outputData: SSMTOutput;
  @Input()
  inputData: SSMTInputs;
  @Input()
  inResultsPanel: boolean;


  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  boiler: BoilerOutput;
  boilerInput: BoilerInput;
  constructor() { }

  ngOnInit() {
    this.boiler = this.outputData.boilerOutput;
    this.boilerInput = this.inputData.boilerInput;
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
