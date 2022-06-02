import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssessmentService } from '../dashboard/assessment.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { EGridService } from '../shared/helper-services/e-grid.service';
import { Assessment } from '../shared/models/assessment';
import { CompressedAirAssessment } from '../shared/models/compressed-air-assessment';
import { Settings } from '../shared/models/settings';
import { CompressedAirAssessmentService } from './compressed-air-assessment.service';
import { CompressedAirCalculationService } from './compressed-air-calculation.service';
import { ConvertCompressedAirService } from './convert-compressed-air.service';
import { DayTypeService } from './day-types/day-type.service';
import { ExploreOpportunitiesService } from './explore-opportunities/explore-opportunities.service';
import { GenericCompressorDbService } from './generic-compressor-db.service';
import { InventoryService } from './inventory/inventory.service';
import { SystemInformationFormService } from './system-information/system-information-form.service';

@Component({
  selector: 'app-compressed-air-assessment',
  templateUrl: './compressed-air-assessment.component.html',
  styleUrls: ['./compressed-air-assessment.component.css']
})
export class CompressedAirAssessmentComponent implements OnInit {
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  containerHeight: number;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setContainerHeight();
  }

  assessment: Assessment;
  settings: Settings;
  showUpdateUnitsModal: boolean = false;
  oldSettings: Settings;
  mainTab: string;
  mainTabSub: Subscription;
  setupTab: string;
  setupTabSub: Subscription;
  profileTab: string;
  profileTabSub: Subscription;
  compressedAirAsseementSub: Subscription;
  disableNext: boolean = false;
  showModificationListSub: Subscription;
  showModificationList: boolean = false;
  showAddModificationSub: Subscription;
  showAddModification: boolean = false;
  isModalOpen: boolean;
  modalOpenSub: Subscription;
  assessmentTab: string;
  assessmentTabSub: Subscription;
  showWelcomeScreen: boolean = false;
  constructor(private activatedRoute: ActivatedRoute,
    private convertCompressedAirService: ConvertCompressedAirService, private assessmentDbService: AssessmentDbService, private cd: ChangeDetectorRef, private systemInformationFormService: SystemInformationFormService,
    private settingsDbService: SettingsDbService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private indexedDbService: IndexedDbService, private compressedAirCalculationService: CompressedAirCalculationService,
    private dayTypeService: DayTypeService,
    private egridService: EGridService,
    private genericCompressorDbService: GenericCompressorDbService, private inventoryService: InventoryService,
    private exploreOpportunitiesService: ExploreOpportunitiesService, private assessmentService: AssessmentService) { }

  ngOnInit(): void {
    this.egridService.getAllSubRegions();
    // this.compressedAirCalculationService.test();
    this.activatedRoute.params.subscribe(params => {
      this.assessment = this.assessmentDbService.getById(parseInt(params['id']));
      let settings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
      if (!settings) {
        settings = this.settingsDbService.getByAssessmentId(this.assessment, false);
        this.addSettings(settings);
      } else {
        this.settings = settings;
        this.compressedAirAssessmentService.settings.next(settings);
        this.genericCompressorDbService.getAllCompressors(this.settings);
      }
      this.compressedAirAssessmentService.updateCompressedAir(this.assessment.compressedAirAssessment, false);
    });

    this.compressedAirAsseementSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val && this.assessment) {
        this.save(val);
        this.setDisableNext();
      }
    })
    let tmpTab: string = this.assessmentService.getTab();
    if (tmpTab) {
      this.compressedAirAssessmentService.mainTab.next(tmpTab);
    }

    this.mainTabSub = this.compressedAirAssessmentService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.setContainerHeight();
    });

    this.setupTabSub = this.compressedAirAssessmentService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.setDisableNext();
      this.setContainerHeight();
    });

    this.showAddModificationSub = this.compressedAirAssessmentService.showAddModificationModal.subscribe(val => {
      this.showAddModification = val;
      this.cd.detectChanges();
    });


    this.showModificationListSub = this.compressedAirAssessmentService.showModificationListModal.subscribe(val => {
      this.showModificationList = val;
      this.cd.detectChanges();
    });

    this.profileTabSub = this.compressedAirAssessmentService.profileTab.subscribe(val => {
      this.profileTab = val;
    });

    this.modalOpenSub = this.compressedAirAssessmentService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

    this.assessmentTabSub = this.compressedAirAssessmentService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    });
    this.checkShowWelcomeScreen();
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
    this.setupTabSub.unsubscribe();
    this.profileTabSub.unsubscribe();
    this.compressedAirAsseementSub.unsubscribe();
    this.modalOpenSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.showAddModificationSub.unsubscribe();
    this.showModificationListSub.unsubscribe();
    this.compressedAirAssessmentService.mainTab.next('system-setup');
    this.compressedAirAssessmentService.setupTab.next('system-basics');
    this.compressedAirAssessmentService.profileTab.next('setup');
    this.inventoryService.selectedCompressor.next(undefined);
    this.exploreOpportunitiesService.modificationResults.next(undefined);
    this.exploreOpportunitiesService.selectedDayType.next(undefined);
    this.compressedAirAssessmentService.compressedAirAssessment.next(undefined);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // this.disclaimerToast();
      this.setContainerHeight();
    }, 100);
  }

  addSettings(settings: Settings) {
    delete settings.id;
    delete settings.directoryId;
    settings.assessmentId = this.assessment.id;
    this.indexedDbService.addSettings(settings).then(() => {
      this.settingsDbService.setAll().then(() => {
        this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
        //on init, settings added. need to convert defaults
        if (this.settings.unitsOfMeasure == 'Metric') {
          let oldSettings: Settings = JSON.parse(JSON.stringify(this.settings));
          oldSettings.unitsOfMeasure = 'Imperial';
          this.assessment.compressedAirAssessment = this.convertCompressedAirService.convertCompressedAir(this.assessment.compressedAirAssessment, oldSettings, this.settings);
        }
        this.genericCompressorDbService.getAllCompressors(this.settings);
        this.compressedAirAssessmentService.settings.next(this.settings);
      });
    });
  }

  setDisableNext() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let hasValidCompressors: boolean = this.inventoryService.hasValidCompressors(compressedAirAssessment);
    let hasValidSystemInformation: boolean = this.systemInformationFormService.getFormFromObj(compressedAirAssessment.systemInformation, this.settings).valid;
    let hasValidDayTypes: boolean = this.dayTypeService.hasValidDayTypes(compressedAirAssessment.compressedAirDayTypes);
    if (this.setupTab == 'system-information' && !hasValidSystemInformation) {
      this.disableNext = true;
    } else if (this.setupTab == 'day-types' && !hasValidDayTypes) {
      this.disableNext = true;
    } else if (hasValidCompressors == false && this.setupTab != 'system-basics' && this.setupTab != 'system-information') {
      this.disableNext = true;
    } else if (this.setupTab == 'system-profile') {
      let hasValidSystemProfile: boolean = this.compressedAirAssessmentService.hasValidProfileSummaryData(compressedAirAssessment).isValid;
      if (hasValidSystemProfile) {
        this.disableNext = false;
      } else {
        this.disableNext = true;
      }
    } else {
      this.disableNext = false;
    }
  }

  next() {
    if (this.setupTab == 'system-basics') {
      this.compressedAirAssessmentService.setupTab.next('system-information');
    } else if (this.setupTab == 'system-information') {
      this.compressedAirAssessmentService.setupTab.next('inventory');
    } else if (this.setupTab == 'inventory') {
      this.compressedAirAssessmentService.setupTab.next('day-types');
    } else if (this.setupTab == 'day-types') {
      this.compressedAirAssessmentService.setupTab.next('system-profile');
    } else if (this.setupTab == 'system-profile') {
      // this.compressedAirAssessmentService.mainTab.next('end-uses');
      this.compressedAirAssessmentService.mainTab.next('assessment');
    }
  }

  back() {
    if (this.setupTab == 'system-information') {
      this.compressedAirAssessmentService.setupTab.next('system-basics');
    } else if (this.setupTab == 'inventory') {
      this.compressedAirAssessmentService.setupTab.next('system-information');
    } else if (this.setupTab == 'day-types') {
      this.compressedAirAssessmentService.setupTab.next('inventory');
    } else if (this.setupTab == 'system-profile') {
      this.compressedAirAssessmentService.setupTab.next('day-types');
    } else if (this.setupTab == 'end-uses') {
      // this.compressedAirAssessmentService.mainTab.next('system-profile');
    }
  }

  setContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.offsetHeight;
        let headerHeight = this.header.nativeElement.offsetHeight;
        let footerHeight = 0;
        if (this.footer) {
          footerHeight = this.footer.nativeElement.offsetHeight;
        }
        this.containerHeight = contentHeight - headerHeight - footerHeight;
      }, 100);
    }
  }

  save(compressedAirAssessment: CompressedAirAssessment) {
    this.assessment.compressedAirAssessment = compressedAirAssessment;
    this.indexedDbService.putAssessment(this.assessment).then(() => {
      this.assessmentDbService.setAll();
    });
  }

  initUpdateUnitsModal(oldSettings: Settings) {
    this.oldSettings = oldSettings;
    this.showUpdateUnitsModal = true;
    this.cd.detectChanges();
  }

  closeUpdateUnitsModal(updated?: boolean) {
    if (updated) {
      this.compressedAirAssessmentService.mainTab.next('system-setup');
      this.compressedAirAssessmentService.setupTab.next('system-basics');
    }
    this.showUpdateUnitsModal = false;
    this.cd.detectChanges();
  }

  selectUpdateAction(shouldUpdateData: boolean) {
    if (shouldUpdateData == true) {
      this.updateData();
    }
    this.closeUpdateUnitsModal(shouldUpdateData);
  }

  updateData() {
    let currentSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    this.assessment.compressedAirAssessment = this.convertCompressedAirService.convertCompressedAir(this.assessment.compressedAirAssessment, this.oldSettings, currentSettings);
    this.assessment.compressedAirAssessment.existingDataUnits = currentSettings.unitsOfMeasure;
    this.save(this.assessment.compressedAirAssessment);
  }

  checkShowWelcomeScreen() {
    if (!this.settingsDbService.globalSettings.disableCompressedAirTutorial) {
      this.showWelcomeScreen = true;
      this.compressedAirAssessmentService.modalOpen.next(true);
    }
  }

  closeWelcomeScreen() {
    this.settingsDbService.globalSettings.disableCompressedAirTutorial = true;
    this.indexedDbService.putSettings(this.settingsDbService.globalSettings);
    this.showWelcomeScreen = false;
    this.compressedAirAssessmentService.modalOpen.next(false);
  }
}
