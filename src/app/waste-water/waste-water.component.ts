import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
import { CompareService } from './modify-conditions/compare.service';
import { SystemBasicsService } from './system-basics/system-basics.service';
import { WasteWaterService } from './waste-water.service';

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
  constructor(private activatedRoute: ActivatedRoute, private indexedDbService: IndexedDbService,
    private settingsDbService: SettingsDbService, private wasteWaterService: WasteWaterService,
    private assessmentDbService: AssessmentDbService, private cd: ChangeDetectorRef, private compareService: CompareService,
    private activatedSludgeFormService: ActivatedSludgeFormService, private aeratorPerformanceFormService: AeratorPerformanceFormService,
    private systemBasicsService: SystemBasicsService, private assessmentService: AssessmentService) { }

  ngOnInit(): void {
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
      // this.disclaimerToast();
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
    this.assessment.wasteWater = wasteWater;
    this.indexedDbService.putAssessment(this.assessment).then(() => {
      this.assessmentDbService.setAll();
    });
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
}
