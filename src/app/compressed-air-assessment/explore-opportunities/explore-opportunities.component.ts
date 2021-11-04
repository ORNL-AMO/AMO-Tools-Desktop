import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, Modification, ProfileSummary } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';
import { BaselineResults, CompressedAirAssessmentResult, CompressedAirAssessmentResultsService } from '../compressed-air-assessment-results.service';
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
  selectedModificationId: string;
  showCascadingSetPoints: boolean;
  hasSequencerOn: boolean;
  displayAddStorage: boolean;
  settings: Settings;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService,
    private inventoryService: InventoryService, private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
    });

    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressedAirAssessment = val;
        this.setBaselineResults();
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
    this.exploreOpportunitiesService.baselineResults = undefined;
    this.exploreOpportunitiesService.baselineDayTypeProfileSummarries = undefined;
    this.compressedAirAssessmentResultsService.flowReallocationSummaries = undefined;
  }

  setBaselineResults() {
    //data used in calculations stays constant in this context
    if (!this.exploreOpportunitiesService.baselineResults) {
      //set day type profile summarries
      this.exploreOpportunitiesService.baselineDayTypeProfileSummarries = new Array();
      this.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
        let baselineProfileSummary: Array<ProfileSummary> = this.compressedAirAssessmentResultsService.calculateBaselineDayTypeProfileSummary(this.compressedAirAssessment, dayType, this.settings);
        this.exploreOpportunitiesService.baselineDayTypeProfileSummarries.push({
          dayTypeId: dayType.dayTypeId,
          profileSummary: baselineProfileSummary
        });
      });
      //set baseline results
      this.exploreOpportunitiesService.baselineResults = this.compressedAirAssessmentResultsService.calculateBaselineResults(this.compressedAirAssessment, this.settings, this.exploreOpportunitiesService.baselineDayTypeProfileSummarries);
      //set flow reallocation data      
      this.compressedAirAssessmentResultsService.setFlowReallocationSummaries(
        this.compressedAirAssessment.compressedAirDayTypes,
        this.settings,
        this.exploreOpportunitiesService.baselineDayTypeProfileSummarries,
        this.compressedAirAssessment.compressorInventoryItems,
        this.compressedAirAssessment.systemInformation.atmosphericPressure,
        this.compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval,
        this.compressedAirAssessment.systemInformation.totalAirStorage,
        this.settings.electricityCost
      );
    }
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
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let modIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId = this.modification.modificationId });
    compressedAirAssessment.modifications[modIndex] = this.modification;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, false);
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
    if (this.modification && this.compressedAirAssessmentResultsService.flowReallocationSummaries) {
      let compressedAirAssessmentResult: CompressedAirAssessmentResult = this.compressedAirAssessmentResultsService.calculateModificationResults(this.compressedAirAssessment, this.modification, this.settings, this.exploreOpportunitiesService.baselineDayTypeProfileSummarries);
      this.exploreOpportunitiesService.modificationResults.next(compressedAirAssessmentResult);
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
