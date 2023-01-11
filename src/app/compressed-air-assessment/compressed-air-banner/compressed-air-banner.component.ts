import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { CompressedAirAssessment, Modification } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';

@Component({
  selector: 'app-compressed-air-banner',
  templateUrl: './compressed-air-banner.component.html',
  styleUrls: ['./compressed-air-banner.component.css']
})
export class CompressedAirBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  isBaselineValid: boolean = false;
  mainTab: string;
  mainTabSub: Subscription;
  selectedModificationSub: Subscription;
  selectedModification: Modification;
  assessmentTab: string;
  assessmentTabSub: Subscription;
  secondaryAssessmentTabSub: Subscription;
  secondaryAssessmentTab: string;
  compresssedAirAssessmentSub: Subscription;
  hasModifiedInventory: boolean = false;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.mainTabSub = this.compressedAirAssessmentService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
      if (!val && this.secondaryAssessmentTab && this.secondaryAssessmentTab != 'modifications') {
        this.changeSecondaryAssessmentTab('modifications');
      }
      this.selectedModification = compressedAirAssessment.modifications.find(modification => { return modification.modificationId == val });
      if (this.selectedModification) {
        this.hasModifiedInventory = true;
        // this.hasModifiedInventory = this.selectedModification.modifiedCompressorInventoryItems && this.selectedModification.modifiedCompressorInventoryItems.length != 0;
      
      }
    });

    this.assessmentTabSub = this.compressedAirAssessmentService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    });
    this.secondaryAssessmentTabSub = this.compressedAirAssessmentService.secondaryAssessmentTab.subscribe(val => {
      this.secondaryAssessmentTab = val;
    });

    this.compresssedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.isBaselineValid = val.setupDone;
      }
    });
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
    this.selectedModificationSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.secondaryAssessmentTabSub.unsubscribe();
    this.compresssedAirAssessmentSub.unsubscribe();
  }

  changeTab(str: string) {
    if (str == 'system-setup' || str == 'diagram' || this.isBaselineValid) {
      this.compressedAirAssessmentService.mainTab.next(str);
    }
  }

  selectModification() {
    this.compressedAirAssessmentService.showModificationListModal.next(true);
  }

  changeAssessmentTab(str: string) {
    this.compressedAirAssessmentService.assessmentTab.next(str);
  }

  changeSecondaryAssessmentTab(str: string) {
    if (this.selectedModification) {
      if (str != 'modified-inventory' || (str == 'modified-inventory' && this.hasModifiedInventory)) {
        this.compressedAirAssessmentService.secondaryAssessmentTab.next(str);
      }
    }
  }
}
