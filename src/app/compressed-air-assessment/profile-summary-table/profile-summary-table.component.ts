import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { CompressedAirDayType, CompressorInventoryItem, MultiCompressorSystemControls, ProfileSummary, ProfileSummaryTotal } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-profile-summary-table',
  templateUrl: './profile-summary-table.component.html',
  styleUrls: ['./profile-summary-table.component.css'],
  standalone: false
})
export class ProfileSummaryTableComponent implements OnChanges {
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
  dayType: CompressedAirDayType;
  @Input()
  multiCompressorSystemControls: MultiCompressorSystemControls;
  @Input()
  trimSelections: Array<{ dayTypeId: string, compressorId: string }>;

  selectedTrimCompressorId: string;

  @ViewChild('profileTable', { static: false }) profileTable: ElementRef;
  allTablesString: string;

  ngOnChanges() {
    if (this.multiCompressorSystemControls == 'baseTrim' && this.trimSelections && this.dayType) {
      let selection = this.trimSelections.find(selection => selection.dayTypeId == this.dayType.dayTypeId);
      this.selectedTrimCompressorId = selection ? selection.compressorId : undefined;
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
