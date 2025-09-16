import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SystemInformation } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-system-info-summary',
    templateUrl: './system-info-summary.component.html',
    styleUrls: ['./system-info-summary.component.css'],
    standalone: false
})
export class SystemInfoSummaryComponent implements OnInit {
  @Input()
  systemInformation: SystemInformation;
  @Input()
  printView: boolean;
  @Input()
  settings: Settings;
  
  collapse: boolean = false;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;
  
  constructor() { }

  ngOnInit(): void {
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }

}
