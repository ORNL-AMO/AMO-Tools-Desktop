import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, Modification } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from '../../baseline-tab-content/inventory-setup/inventory/inventory.service';
import { CompressorTypeOption, CompressorTypeOptions } from '../../baseline-tab-content/inventory-setup/inventory/inventoryOptions';
import { ExploreOpportunitiesService } from './explore-opportunities.service';
import { CompressedAirAssessmentBaselineResults } from '../../calculations/CompressedAirAssessmentBaselineResults';
import { CompressedAirCalculationService } from '../../compressed-air-calculation.service';
import { AssessmentCo2SavingsService } from '../../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { CompressedAirAssessmentModificationResults } from '../../calculations/modifications/CompressedAirAssessmentModificationResults';

@Component({
  selector: 'app-explore-opportunities',
  templateUrl: './explore-opportunities.component.html',
  styleUrls: ['./explore-opportunities.component.css'],
  standalone: false
})
export class ExploreOpportunitiesComponent implements OnInit {
  @Input()
  containerHeight: number;

  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  smallScreenTab: string = 'form';
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.resizeTabs();
    // }, 100);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}
