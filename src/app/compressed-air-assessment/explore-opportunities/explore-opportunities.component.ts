import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, Modification, ProfileSummary } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';
import { CompressedAirAssessmentResultsService } from '../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { InventoryService } from '../inventory/inventory.service';
import { CompressorTypeOption, CompressorTypeOptions } from '../inventory/inventoryOptions';
import { ExploreOpportunitiesService } from './explore-opportunities.service';
import { CompressedAirAssessmentResult } from '../calculations/caCalculationModels';
import { CompressedAirAssessmentBaselineResults } from '../calculations/CompressedAirAssessmentBaselineResults';
import { CompressedAirCalculationService } from '../compressed-air-calculation.service';
import { AssessmentCo2SavingsService } from '../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { CompressedAirAssessmentModificationResults } from '../calculations/modifications/CompressedAirAssessmentModificationResults';

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
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

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
  showCascadingAndSequencer: boolean;
  smallScreenTab: string = 'form';
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService,
    private inventoryService: InventoryService, private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService,
    private compressedAirCalculationService: CompressedAirCalculationService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
    });

    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressedAirAssessment = val;
        this.setBaselineResults();
        this.showCascadingAndSequencer = (this.compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'cascading' || this.compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'targetPressureSequencer');
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
      } else if (val == 'modifications') {
        if (this.dayTypeOptions && this.dayTypeOptions.length == 1) {
          this.exploreOpportunitiesService.selectedDayType.next(undefined);
        }
      }
      this.secondaryAssessmentTab = val;
    });

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.selectedModificationSub.unsubscribe();
    this.secondaryAssessmentTabSub.unsubscribe();
    this.selectedDayTypeSub.unsubscribe();
    this.inventoryService.selectedCompressor.next(undefined);
    this.exploreOpportunitiesService.baselineResults = undefined;
    this.exploreOpportunitiesService.baselineDayTypeProfileSummarries = undefined;
    // this.compressedAirAssessmentResultsService.flowReallocationSummaries = undefined;
  }

  setBaselineResults() {
    //data used in calculations stays constant in this context
    if (!this.exploreOpportunitiesService.baselineResults) {
      //set baseline results
      let compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults = new CompressedAirAssessmentBaselineResults(this.compressedAirAssessment, this.settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);
      this.exploreOpportunitiesService.baselineResults = compressedAirAssessmentBaselineResults.baselineResults;
      //set day type profile summarries
      this.exploreOpportunitiesService.baselineDayTypeProfileSummarries = compressedAirAssessmentBaselineResults.baselineDayTypeProfileSummaries.map(dayTypeProfileSummary => {
        return {
          dayTypeId: dayTypeProfileSummary.dayType.dayTypeId,
          profileSummary: dayTypeProfileSummary.profileSummary
        }
      });
      //set flow reallocation data      
      // this.compressedAirAssessmentResultsService.setFlowReallocationSummaries(
      //   this.compressedAirAssessment.compressedAirDayTypes,
      //   this.settings,
      //   this.exploreOpportunitiesService.baselineDayTypeProfileSummarries,
      //   this.compressedAirAssessment.compressorInventoryItems,
      //   this.compressedAirAssessment.systemInformation.atmosphericPressure,
      //   this.compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval,
      //   this.compressedAirAssessment.systemInformation.totalAirStorage,
      //   this.compressedAirAssessment.systemBasics.electricityCost,
      //   this.compressedAirAssessment.systemInformation
      // );
    }
  }

  setHasSequencer() {
    if (this.compressedAirAssessment) {
      this.hasSequencerOn = this.compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'targetPressureSequencer';
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
    let modIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == this.modification.modificationId });
    compressedAirAssessment.modifications[modIndex] = this.modification;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, false);
  }

  setTab(str: string) {
    this.tabSelect = str;
    if (this.tabSelect == 'compressor-profile' && this.selectedDayType == undefined) {
      this.selectedDayType = this.dayTypeOptions[0];
      this.changeDayType();
    } else if (this.secondaryAssessmentTab == 'modifications' && this.dayTypeOptions.length == 1) {
      this.selectedDayType = undefined;
      this.changeDayType();
    }
  }

  changeDayType() {
    this.exploreOpportunitiesService.selectedDayType.next(this.selectedDayType);
  }

  setCompressedAirAssessmentResults() {
    if (this.modification) {
      //TODO: pass baseline results
      // let compressedAirAssessmentResult: CompressedAirAssessmentResult = this.compressedAirAssessmentResultsService.calculateModificationResults(this.compressedAirAssessment, this.modification, this.settings, this.exploreOpportunitiesService.baselineDayTypeProfileSummarries, this.exploreOpportunitiesService.baselineResults);
      let compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults = new CompressedAirAssessmentModificationResults(this.compressedAirAssessment, this.modification, this.settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);
      this.exploreOpportunitiesService.modificationResults.next(compressedAirAssessmentModificationResults.getModificationResults());
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

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  resizeTabs() {
    if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
      this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
    }
  }

  focusedField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

}
