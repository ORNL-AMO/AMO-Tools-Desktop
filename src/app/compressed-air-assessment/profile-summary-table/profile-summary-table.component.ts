import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CompressorInventoryItem, ProfileSummary, ProfileSummaryTotal, SystemInformation, SystemProfileSetup } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-profile-summary-table',
  templateUrl: './profile-summary-table.component.html',
  styleUrls: ['./profile-summary-table.component.css']
})
export class ProfileSummaryTableComponent implements OnInit {
  @Input()
  inventoryItems: Array<CompressorInventoryItem>;
  @Input()
  profileSummary: Array<ProfileSummary>;
  @Input()
  totals: Array<ProfileSummaryTotal>;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  @Input()
  totalsForPrint: Array<Array<ProfileSummaryTotal>>;
  @Input()
  systemProfileSetup: SystemProfileSetup;
  @Input()
  systemInformation: SystemInformation;



  @ViewChild('profileTable', { static: false }) profileTable: ElementRef;
  allTablesString: string;
  constructor() { }

  ngOnInit(): void {
  }

  updateTableString() {
    this.allTablesString = this.profileTable.nativeElement.innerText;
  }


  checkShowAuxiliary() {
    let auxTotal: ProfileSummaryTotal = this.totals.find(totalData => { return totalData.auxiliaryPower != 0 });
    return auxTotal != undefined;
  }

  checkIsTrim(compressorId: string): boolean {
    if (this.systemInformation.multiCompressorSystemControls == 'baseTrim' && this.systemInformation.trimSelections && this.systemProfileSetup.dayTypeId) {
      let selection = this.systemInformation.trimSelections.find(selection => { return selection.dayTypeId == this.systemProfileSetup.dayTypeId && selection.compressorId == compressorId });
      return selection != undefined;
    } else {
      return false;
    }
  }
}
