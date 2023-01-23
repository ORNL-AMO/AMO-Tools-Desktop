import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReplaceCompressorsEEM } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';

@Component({
  selector: 'app-results-panel',
  templateUrl: './results-panel.component.html',
  styleUrls: ['./results-panel.component.css']
})
export class ResultsPanelComponent implements OnInit {
  @Input()
  inModifiedInventory: boolean;
  setupTabSub: Subscription;
  tabSelect: CompressedAirSetupTab = 'help';
  displayEndUses: boolean;
  displayInventory: boolean;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.setupTabSub = this.compressedAirAssessmentService.setupTab.subscribe(val => {
      this.displayEndUses = (val == 'end-uses');
      this.displayInventory = (val == 'inventory');
      if (this.displayInventory || this.displayEndUses) {
        this.tabSelect = val as CompressedAirSetupTab;
      } else {
        this.tabSelect = 'help';
      }
    });
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
  }

  setTab(str: CompressedAirSetupTab) {
    this.tabSelect = str;
  }
}


export type CompressedAirSetupTab = 'help' | 'performance-profile' | 'inventory' | 'end-uses';