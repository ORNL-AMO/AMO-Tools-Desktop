import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Settings } from '../shared/models/settings';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { WaterProcess, WaterProcessDiagramService } from './water-process-diagram.service';

@Component({
  selector: 'app-water-process-diagram',
  templateUrl: './water-process-diagram.component.html',
  styleUrl: './water-process-diagram.component.css'
})
export class WaterProcessDiagramComponent {
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  containerHeight: number;
  mainTabSub: Subscription;
  modalOpenSub: Subscription;
  waterProcessSub: Subscription;
  
  mainTab: string;
  waterProcess: WaterProcess;
  isModalOpen: boolean;
  
  constructor( 
    private activatedRoute: ActivatedRoute,
    private waterProcessService: WaterProcessDiagramService,
    private settingsDbService: SettingsDbService, 
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('view-water-diagram');
    this.activatedRoute.params.subscribe(params => {
      let waterProcessId = Number(params['id']);
      this.waterProcess = this.waterProcessService.getDefaultWaterProcess();
      // todo __dbservice get by id
      // let settings: Settings = this.settingsDbService.getByInventoryId();
      // this.waterProcessService.settings.next(settings);
      // todo set isValid
      // todo next BS

      // let connectedId = this.activatedRoute.snapshot.queryParamMap.get('connectedId');
      // if (connectedId) {
      //   this.redirectFromConnected(connectedId);
      // }
    });
    this.mainTabSub = this.waterProcessService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
    });

    this.waterProcessSub = this.waterProcessService.waterProcess.subscribe(waterProcess => {
      this.saveDbData();
    });
    this.modalOpenSub = this.waterProcessService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
    this.waterProcessSub.unsubscribe();
    this.modalOpenSub.unsubscribe();   
  }

  ngAfterViewInit() {
    this.getContainerHeight();
  }

  getContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.clientHeight;
        let headerHeight = this.header.nativeElement.clientHeight;
        let footerHeight = 0;
        if (this.footer) {
          footerHeight = this.footer.nativeElement.clientHeight;
        }
        this.containerHeight = contentHeight - headerHeight - footerHeight;
      }, 100);
    }
  }

  async saveDbData() { }

  continue() {
    if (this.mainTab == 'setup') {
      this.waterProcessService.mainTab.next('diagram');
    }
  }

  back(){
    if (this.mainTab == 'diagram') {
      this.waterProcessService.mainTab.next('setup');
    }
  }

}
