import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { SSMTInputs, SsmtValid } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { SSMTOutput } from '../../../../shared/models/steam/steam-outputs';

@Component({
    selector: 'app-header-summary',
    templateUrl: './header-summary.component.html',
    styleUrls: ['./header-summary.component.css'],
    standalone: false
})
export class HeaderSummaryComponent implements OnInit {
  @Input()
  baselineInputData: SSMTInputs;
  @Input()
  modificationInputData: Array<{ name: string, inputData: SSMTInputs, valid: SsmtValid }>;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  @Input()
  modificationOutputs: Array<SSMTOutput>;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  collapse: boolean = true;
  numMods: number = 0;
  showProcessSteamUsageNote: boolean;
  constructor() { }

  ngOnInit() {
    if (this.modificationInputData) {
      this.numMods = this.modificationInputData.length;
    }
    this.checkProcessSteamUsage();
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

  checkProcessSteamUsage(){
    this.modificationInputData.forEach(input => {
      if(input.inputData.headerInput.numberOfHeaders > 1){
        if(input.inputData.headerInput.lowPressureHeader.useBaselineProcessSteamUsage == true){
          this.showProcessSteamUsageNote = true;
        }
        if(input.inputData.headerInput.numberOfHeaders == 3 && input.inputData.headerInput.mediumPressureHeader.useBaselineProcessSteamUsage == true){
          this.showProcessSteamUsageNote = true;
        }
      }
    })
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }

}
