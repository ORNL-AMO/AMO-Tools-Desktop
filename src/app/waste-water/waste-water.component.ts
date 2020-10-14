import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { Assessment } from '../shared/models/assessment';
import { Settings } from '../shared/models/settings';
import { WasteWater } from '../shared/models/waste-water';
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
  constructor(private activatedRoute: ActivatedRoute, private indexedDbService: IndexedDbService,
    private settingsDbService: SettingsDbService, private wasteWaterService: WasteWaterService,
    private assessmentDbService: AssessmentDbService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.assessment = this.assessmentDbService.getById(parseInt(params['id']));
      this.wasteWaterService.wasteWater.next(this.assessment.wasteWater);
      let settings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
      this.wasteWaterService.settings.next(settings);
    });

    this.mainTabSub = this.wasteWaterService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
    });

    this.setupTabSub = this.wasteWaterService.setupTab.subscribe(val => {
      this.setupTab = val;
    });

    this.wasteWaterSub = this.wasteWaterService.wasteWater.subscribe(val => {
      if (val && this.assessment) {
        this.saveWasteWater(val);
      }
    });

    this.assessmentTabSub = this.wasteWaterService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
      this.cd.detectChanges();
    });
    
    this.showAddModificationSub = this.wasteWaterService.showAddModificationModal.subscribe(val => {
      this.showAddModification = val;
      this.cd.detectChanges();
    });

    this.showModificationListSub = this.wasteWaterService.showModificationListModal.subscribe(val =>{
      this.showModificationList = val;
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
}
