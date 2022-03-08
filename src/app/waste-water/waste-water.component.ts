import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { AssessmentService } from '../dashboard/assessment.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { Assessment } from '../shared/models/assessment';
import { Settings } from '../shared/models/settings';
import { WasteWater } from '../shared/models/waste-water';
import { ActivatedSludgeFormService } from './activated-sludge-form/activated-sludge-form.service';
import { AeratorPerformanceFormService } from './aerator-performance-form/aerator-performance-form.service';
import { ConvertWasteWaterService } from './convert-waste-water.service';
import { CompareService } from './modify-conditions/compare.service';
import { SystemBasicsService } from './system-basics/system-basics.service';
import { WasteWaterService } from './waste-water.service';
import { EGridService } from '../shared/helper-services/e-grid.service';

@Component({
  selector: 'app-waste-water',
  templateUrl: './waste-water.component.html',
  styleUrls: ['./waste-water.component.css']
})
export class WasteWaterComponent implements OnInit {
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  containerHeight: number;

  @ViewChild('updateUnitsModal', { static: false }) public updateUnitsModal: ModalDirective;
  showUpdateUnitsModal: boolean = false;
  oldSettings: Settings;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }

  assessment: Assessment;
  settings: Settings;
  mainTab: string;
  mainTabSub: Subscription;
  setupTab: string;
  setupTabSub: Subscription;
  wasteWaterSub: Subscription;
  assessmentTabSub: Subscription;
  assessmentTab: string;

  showAddModification: boolean;
  showAddModificationSub: Subscription;
  showModificationList: boolean;
  showModificationListSub: Subscription;

  isModalOpen: boolean;
  isModalOpenSub: Subscription;
  disableNext: boolean;

  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;
  constructor(private activatedRoute: ActivatedRoute, private indexedDbService: IndexedDbService,
    private egridService: EGridService,
    private settingsDbService: SettingsDbService, private wasteWaterService: WasteWaterService, private convertWasteWaterService: ConvertWasteWaterService,
    private assessmentDbService: AssessmentDbService, private cd: ChangeDetectorRef, private compareService: CompareService,
    private activatedSludgeFormService: ActivatedSludgeFormService, private aeratorPerformanceFormService: AeratorPerformanceFormService,
    private systemBasicsService: SystemBasicsService, private assessmentService: AssessmentService) { }

  ngOnInit(): void {
    this.egridService.getAllSubRegions();
    this.activatedRoute.params.subscribe(params => {
      this.assessment = this.assessmentDbService.getById(parseInt(params['id']));
      this.wasteWaterService.updateWasteWater(this.assessment.wasteWater);
      let settings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
      if (!settings) {
        settings = this.settingsDbService.getByAssessmentId(this.assessment, false);
        this.addSettings(settings);
      } else {
        this.settings = settings;
        this.wasteWaterService.settings.next(settings);
      }
      if (this.assessmentService.tab) {
        this.wasteWaterService.mainTab.next(this.assessmentService.tab);
      }
    });

    this.mainTabSub = this.wasteWaterService.mainTab.subscribe(val => {
      this.mainTab = val;
      if (this.mainTab == 'system-setup') {
        this.compareService.setWasteWaterDifferent(this.assessment.wasteWater.baselineData);
      }
      this.getContainerHeight();
    });

    this.setupTabSub = this.wasteWaterService.setupTab.subscribe(val => {
      this.setupTab = val;
    });

    this.wasteWaterSub = this.wasteWaterService.wasteWater.subscribe(val => {
      if (val && this.assessment) {
        this.saveWasteWater(val);
        this.setDisableNext(val);
      }
    });

    this.assessmentTabSub = this.wasteWaterService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
      this.getContainerHeight();
    });

    this.showAddModificationSub = this.wasteWaterService.showAddModificationModal.subscribe(val => {
      this.showAddModification = val;
      this.cd.detectChanges();
    });

    this.showModificationListSub = this.wasteWaterService.showModificationListModal.subscribe(val => {
      this.showModificationList = val;
      this.cd.detectChanges();
    });

    this.isModalOpenSub = this.wasteWaterService.isModalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

  }

  ngOnDestroy() {
    this.wasteWaterService.setupTab.next('system-basics');
    this.mainTabSub.unsubscribe();
    this.setupTabSub.unsubscribe();
    this.wasteWaterSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.showAddModificationSub.unsubscribe();
    this.showModificationListSub.unsubscribe();
    this.isModalOpenSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  getContainerHeight() {
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

  saveWasteWater(wasteWater: WasteWater) {
    wasteWater = this.updateModificationCO2Savings(wasteWater);
    this.assessment.wasteWater = wasteWater;
    
    this.indexedDbService.putAssessment(this.assessment).then(() => {
      this.assessmentDbService.setAll();
    });
  }

  updateModificationCO2Savings(wasteWater: WasteWater) {
    if (wasteWater.baselineData.co2SavingsData) {
      wasteWater.modifications.forEach(mod => {
        if (!mod.co2SavingsData) {
          mod.co2SavingsData = wasteWater.baselineData.co2SavingsData;
        } else {
          mod.co2SavingsData.zipcode = wasteWater.baselineData.co2SavingsData.zipcode;
          mod.co2SavingsData.eGridSubregion = wasteWater.baselineData.co2SavingsData.eGridSubregion;
          if (!mod.co2SavingsData.totalEmissionOutputRate) {
            mod.co2SavingsData.totalEmissionOutputRate = wasteWater.baselineData.co2SavingsData.totalEmissionOutputRate;
          }
        }
      });
    }
    return wasteWater;
  }

  addSettings(settings: Settings) {
    delete settings.id;
    delete settings.directoryId;
    settings.assessmentId = this.assessment.id;
    this.indexedDbService.addSettings(settings).then(() => {
      this.settingsDbService.setAll().then(() => {
        this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
        this.wasteWaterService.settings.next(this.settings);
      });
    });
  }

  setDisableNext(wasteWater: WasteWater) {
    let systemBasicsForm: FormGroup = this.systemBasicsService.getFormFromObj(wasteWater.systemBasics);
    let aeratorPerformanceForm: FormGroup = this.aeratorPerformanceFormService.getFormFromObj(wasteWater.baselineData.aeratorPerformanceData);
    let activatedSludgeForm: FormGroup = this.activatedSludgeFormService.getFormFromObj(wasteWater.baselineData.activatedSludgeData);
    if (this.setupTab == 'system-basics' && systemBasicsForm.valid) {
      this.disableNext = false;
    } else if (this.setupTab == 'activated-sludge' && activatedSludgeForm.valid && systemBasicsForm.valid) {
      this.disableNext = false;
    } else if (this.setupTab == 'aerator-performance' && aeratorPerformanceForm.valid && activatedSludgeForm.valid && systemBasicsForm.valid) {
      this.disableNext = false;
    } else {
      this.disableNext = true;
    }
  }

  continue() {
    if (this.setupTab == 'system-basics') {
      this.wasteWaterService.setupTab.next('activated-sludge');
    } else if (this.setupTab == 'activated-sludge') {
      this.wasteWaterService.setupTab.next('aerator-performance');
    } else if (this.setupTab == 'aerator-performance') {
      this.wasteWaterService.mainTab.next('assessment');
    }
  }

  back() {
    if (this.setupTab == 'activated-sludge') {
      this.wasteWaterService.setupTab.next('system-basics');
    } else if (this.setupTab == 'aerator-performance') {
      this.wasteWaterService.setupTab.next('activated-sludge');
    }
  }

  initUpdateUnitsModal(oldSettings: Settings) {
    this.oldSettings = oldSettings;
    this.showUpdateUnitsModal = true;
    this.cd.detectChanges();
  }

  closeUpdateUnitsModal(updated?: boolean) {
    if (updated) {
      this.wasteWaterService.mainTab.next('system-setup');
      this.wasteWaterService.setupTab.next('system-basics');
    }
    this.showUpdateUnitsModal = false;
    this.cd.detectChanges();
  }

  selectUpdateAction(shouldUpdateData: boolean) {
    if(shouldUpdateData == true) {
      this.updateData();
    } 
    this.closeUpdateUnitsModal(shouldUpdateData);
  }

  updateData() {
    let currentSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    this.assessment.wasteWater = this.convertWasteWaterService.convertWasteWater(this.assessment.wasteWater, this.oldSettings, currentSettings);
    this.assessment.wasteWater.existingDataUnits = currentSettings.unitsOfMeasure;
    this.saveWasteWater(this.assessment.wasteWater);
  }
}
