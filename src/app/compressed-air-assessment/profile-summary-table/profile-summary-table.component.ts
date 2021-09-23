import { Component, Input, OnInit } from '@angular/core';
import { CompressorInventoryItem, ProfileSummary, ProfileSummaryTotal } from '../../shared/models/compressed-air-assessment';

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

  constructor() { }

  ngOnInit(): void {
  }

}
