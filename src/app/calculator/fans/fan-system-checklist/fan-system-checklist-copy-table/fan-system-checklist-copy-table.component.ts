import { ElementRef, Input, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FanSystemChecklistOutput, FanSystemChecklistResult } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-fan-system-checklist-copy-table',
  templateUrl: './fan-system-checklist-copy-table.component.html',
  styleUrls: ['./fan-system-checklist-copy-table.component.css']
})
export class FanSystemChecklistCopyTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  result: FanSystemChecklistResult;
  
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  
  copyTableString: any;
  
  constructor() { }
  
  ngOnInit() {
  }
  
  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
    console.log(this.copyTableString);
  }
}
