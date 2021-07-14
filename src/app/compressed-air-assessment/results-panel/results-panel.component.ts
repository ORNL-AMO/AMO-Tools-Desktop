import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';

@Component({
  selector: 'app-results-panel',
  templateUrl: './results-panel.component.html',
  styleUrls: ['./results-panel.component.css']
})
export class ResultsPanelComponent implements OnInit {

  setupTabSub: Subscription;
  tabSelect: 'help' | 'performance-profile' | 'current-inventory' | 'end-uses' = 'help';
  displayEndUses: boolean;
  displayInventory: boolean;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.setupTabSub = this.compressedAirAssessmentService.setupTab.subscribe(val => {
      this.displayEndUses = (val == 'end-uses');
      this.displayInventory = (val == 'inventory');
      if(this.displayInventory){
        this.tabSelect = 'current-inventory';
      }

      if (this.tabSelect != 'help') {
        if (!this.displayEndUses && this.tabSelect == 'end-uses') {
          this.tabSelect = 'help';
        } else if (!this.displayInventory && (this.tabSelect == 'performance-profile' || this.tabSelect == 'current-inventory')) {
          this.tabSelect = 'help';
        }
      }
    });
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
  }

  setTab(str: 'help' | 'performance-profile' | 'current-inventory' | 'end-uses') {
    this.tabSelect = str;
  }
}
