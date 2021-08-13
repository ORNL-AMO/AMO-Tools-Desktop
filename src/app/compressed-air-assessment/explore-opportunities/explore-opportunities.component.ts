import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, Modification } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { InventoryService } from '../inventory/inventory.service';
import { ExploreOpportunitiesService } from './explore-opportunities.service';

@Component({
  selector: 'app-explore-opportunities',
  templateUrl: './explore-opportunities.component.html',
  styleUrls: ['./explore-opportunities.component.css']
})
export class ExploreOpportunitiesComponent implements OnInit {
  @Input()
  containerHeight: number;
  @Output('exploreOppsToast')
  exploreOppsToast = new EventEmitter<boolean>();

  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment
  modificationExists: boolean;
  selectedModificationSub: Subscription;
  modification: Modification;
  tabSelect: string = 'compressor-profile';
  secondaryAssessmentTab: string;
  secondaryAssessmentTabSub: Subscription;
  selectedDayTypeSub: Subscription;
  selectedDayType: CompressedAirDayType;
  dayTypeOptions: Array<CompressedAirDayType>;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploerOpportunitiesService: ExploreOpportunitiesService,
    private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.selectedDayTypeSub = this.exploerOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
    });

    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressedAirAssessment = val;
        this.dayTypeOptions = val.compressedAirDayTypes;
        this.modificationExists = (val.modifications && val.modifications.length != 0);
        if(!this.selectedDayType){
          this.exploerOpportunitiesService.selectedDayType.next(this.compressedAirAssessment.compressedAirDayTypes[0]);
        }
      }
    });

    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (!val && this.modificationExists) {
        this.compressedAirAssessmentService.selectedModificationId.next(this.compressedAirAssessment.modifications[0].modificationId);
      } else if (val && this.modificationExists) {
        this.modification = this.compressedAirAssessment.modifications.find(modification => { return modification.modificationId == val });
        if (!this.modification) {
          this.compressedAirAssessmentService.selectedModificationId.next(this.compressedAirAssessment.modifications[0].modificationId);
        }
      }
    });
    this.secondaryAssessmentTabSub = this.compressedAirAssessmentService.secondaryAssessmentTab.subscribe(val => {
      this.secondaryAssessmentTab = val;
    });

  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.selectedModificationSub.unsubscribe();
    this.secondaryAssessmentTabSub.unsubscribe();
    this.selectedDayTypeSub.unsubscribe();
    this.inventoryService.selectedCompressor.next(undefined);
  }

  addExploreOpp() {
    this.compressedAirAssessmentService.showAddModificationModal.next(true);
  }

  save() {
    this.exploerOpportunitiesService.saveModification(this.modification);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeDayType() {
    this.exploerOpportunitiesService.selectedDayType.next(this.selectedDayType);
  }
}
