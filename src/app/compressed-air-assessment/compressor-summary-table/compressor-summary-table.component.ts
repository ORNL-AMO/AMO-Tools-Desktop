import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CompressorInventoryItem, ProfileSummary } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-compressor-summary-table',
  templateUrl: './compressor-summary-table.component.html',
  styleUrls: ['./compressor-summary-table.component.css']
})
export class CompressorSummaryTableComponent implements OnInit {
  @Input()
  profileSummary: Array<ProfileSummary>;
  @Input()
  compressorInventoryItems: Array<CompressorInventoryItem>;
  @Input()
  settings: Settings;

  @ViewChild('profileTable', { static: false }) profileTable: ElementRef;
  allTablesString: string;

  constructor() { }

  ngOnInit(): void {
  }

  updateTableString() {
    this.allTablesString = this.profileTable.nativeElement.innerText;
  }

}
