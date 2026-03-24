import { Component, ElementRef, Input, OnInit, ViewChild, inject, Signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { InventorySummary, InventorySummaryOverviewService } from '../inventory-summary-overview.service';
import { Settings } from '../../../../shared/models/settings';
import { FeatureFlagService } from '../../../../shared/feature-flag.service';

@Component({
    selector: 'app-pump-inventory-overview-table',
    templateUrl: './inventory-overview-table.component.html',
    styleUrls: ['./inventory-overview-table.component.css'],
    standalone: false
})
export class InventoryOverviewTableComponent implements OnInit {
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  @Input()
  settings: Settings;
  tableString: any;
  inventorySummary: InventorySummary;
  invetorySummarySub: Subscription;
  private featureFlagService = inject(FeatureFlagService);
  showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;

  constructor(private inventorySummaryOverviewService: InventorySummaryOverviewService) { }

  ngOnInit(): void {
    this.invetorySummarySub = this.inventorySummaryOverviewService.inventorySummary.subscribe(val => {
      this.inventorySummary = val;
    })
  }

  ngOnDestroy() {
    this.invetorySummarySub.unsubscribe();
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
  
}

