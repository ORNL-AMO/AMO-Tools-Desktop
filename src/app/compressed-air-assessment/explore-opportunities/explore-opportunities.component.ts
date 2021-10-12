import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, Modification } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentResult, CompressedAirAssessmentResultsService } from '../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { InventoryService } from '../inventory/inventory.service';
import { CompressorTypeOption, CompressorTypeOptions } from '../inventory/inventoryOptions';
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
  tabSelect: string = 'results';
  secondaryAssessmentTab: string;
  secondaryAssessmentTabSub: Subscription;
  selectedDayTypeSub: Subscription;
  selectedDayType: CompressedAirDayType;
  dayTypeOptions: Array<CompressedAirDayType>;
  calculating: any;
  selectedModificationId: string;
  showCascadingSetPoints: boolean;
  hasSequencerOn: boolean;
  displayAddStorage: boolean;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService,
    private inventoryService: InventoryService, private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {
    this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
    });

    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressedAirAssessment = val;
        this.showCascadingSetPoints = this.compressedAirAssessment.compressorInventoryItems.length > 1;
        this.dayTypeOptions = val.compressedAirDayTypes;
        this.modificationExists = (val.modifications && val.modifications.length != 0);
        this.setModification();
        this.setHasSequencer();
        this.setCompressedAirAssessmentResults();
        this.setDisplayAddStorage();
      }
    });

    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (!val && this.modificationExists) {
        this.compressedAirAssessmentService.selectedModificationId.next(this.compressedAirAssessment.modifications[0].modificationId);
      } else if (val && this.modificationExists) {
        this.selectedModificationId = val;
        this.setModification();
        if (!this.modification) {
          this.compressedAirAssessmentService.selectedModificationId.next(this.compressedAirAssessment.modifications[0].modificationId);
        } else {
          this.setCompressedAirAssessmentResults();
        }
        this.setHasSequencer();
      }
    });
    this.secondaryAssessmentTabSub = this.compressedAirAssessmentService.secondaryAssessmentTab.subscribe(val => {
      if (val == 'graphs' || val == 'table') {
        if (!this.selectedDayType && this.dayTypeOptions) {
          this.exploreOpportunitiesService.selectedDayType.next(this.dayTypeOptions[0]);
        }
      }
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


  setHasSequencer() {
    if (this.compressedAirAssessment) {
      this.hasSequencerOn = this.compressedAirAssessment.systemInformation.isSequencerUsed;
      if (!this.hasSequencerOn && this.modification) {
        this.hasSequencerOn = (this.modification.useAutomaticSequencer.order != 100)
      }
    }
  }

  addExploreOpp() {
    this.compressedAirAssessmentService.showAddModificationModal.next(true);
  }

  save() {
    this.exploreOpportunitiesService.saveModification(this.modification);
  }

  setTab(str: string) {
    this.tabSelect = str;
    if (this.tabSelect == 'compressor-profile' && this.selectedDayType == undefined) {
      this.selectedDayType = this.dayTypeOptions[0];
      this.changeDayType();
    }
  }

  changeDayType() {
    this.exploreOpportunitiesService.selectedDayType.next(this.selectedDayType);
  }

  setCompressedAirAssessmentResults() {
    if (this.modification) {
      if (this.calculating) {
        clearTimeout(this.calculating);
      }

      this.calculating = setTimeout(() => {
        let compressedAirAssessmentResult: CompressedAirAssessmentResult = this.compressedAirAssessmentResultsService.calculateModificationResults(this.compressedAirAssessment, this.modification);
        this.exploreOpportunitiesService.modificationResults.next(compressedAirAssessmentResult);
        this.calculating = undefined;
      }, 750)
    } else {
      this.exploreOpportunitiesService.modificationResults.next(undefined);
    }
  }

  setModification() {
    if (this.selectedModificationId != undefined) {
      this.modification = this.compressedAirAssessment.modifications.find(modification => { return modification.modificationId == this.selectedModificationId });
    }
  }

  setDisplayAddStorage() {
    let displayAddStorage: boolean = false;
    this.compressedAirAssessment.compressorInventoryItems.forEach(item => {
      let compressorTypeOption: CompressorTypeOption = CompressorTypeOptions.find(option => { return option.value == item.nameplateData.compressorType });
      if (compressorTypeOption.lubricantTypeEnumValue == 0) {
        displayAddStorage = true;
      }
    });
    this.displayAddStorage = displayAddStorage;
  }
}
