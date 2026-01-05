import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CompressorInventoryItem, MultiCompressorSystemControls, ProfileSummary, ProfileSummaryTotal, SystemInformation, SystemProfileSetup } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';

@Component({
    selector: 'app-profile-summary-table',
    templateUrl: './profile-summary-table.component.html',
    styleUrls: ['./profile-summary-table.component.css'],
    standalone: false
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
  multiCompressorSystemControls: MultiCompressorSystemControls;
  @Input()
  trimSelections: Array<{ dayTypeId: string, compressorId: string }>;

  selectedTrimCompressorId: string;

  @ViewChild('profileTable', { static: false }) profileTable: ElementRef;
  allTablesString: string;
  constructor() { }

  ngOnInit(): void {
    if (this.multiCompressorSystemControls == 'baseTrim' && this.trimSelections && this.systemProfileSetup) {
      let selection = this.trimSelections.find(selection => selection.dayTypeId == this.systemProfileSetup.dayTypeId);
      this.selectedTrimCompressorId = selection? selection.compressorId : undefined;
    }
  }

  updateTableString() {
    this.allTablesString = this.profileTable.nativeElement.innerText;
  }

  checkShowAuxiliary() {
    let auxTotal: ProfileSummaryTotal = this.totals.find(totalData => { return totalData.auxiliaryPower != 0 });
    return auxTotal != undefined;
  }
}
