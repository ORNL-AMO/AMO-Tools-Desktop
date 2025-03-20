import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
 
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { Settings } from '../shared/models/settings';
import { LogToolDbService } from './log-tool-db.service';
import { LogToolService } from './log-tool.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';

@Component({
    selector: 'app-log-tool',
    templateUrl: './log-tool.component.html',
    styleUrls: ['./log-tool.component.css'],
    standalone: false
})
export class LogToolComponent implements OnInit {
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  containerHeight: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }

  openExportDataSub: Subscription;
  openExportData: boolean;
  showWelcomeScreen: boolean = false;
  constructor(private activatedRoute: ActivatedRoute, 
    private logToolDbService: LogToolDbService, private logToolService: LogToolService,
    private settingsDbService: SettingsDbService,
    private analyticsService: AnalyticsService
     ) { }

  ngOnInit() {
    this.analyticsService.sendEvent('use-data-exporation');
    this.activatedRoute.url.subscribe(url => {
      this.getContainerHeight();
    });

    this.openExportDataSub = this.logToolService.openExportData.subscribe(val => {
      this.openExportData = val;
    });
    this.checkShowWelcomeScreen();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  getContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.clientHeight;
        let headerHeight = this.header.nativeElement.clientHeight;
        this.containerHeight = contentHeight - headerHeight;
        this.logToolService.setupContainerHeight.next(this.containerHeight);
      }, 100);
    }
  }

  ngOnDestroy(){
    this.openExportDataSub.unsubscribe();
  }

  checkShowWelcomeScreen() {
    if (!this.settingsDbService.globalSettings.disableDataExplorerTutorial) {
      this.showWelcomeScreen = true;
      this.logToolService.isModalOpen.next(true);
    }
  }

  async closeWelcomeScreen() {
    this.settingsDbService.globalSettings.disableDataExplorerTutorial = true;
    await firstValueFrom(this.settingsDbService.updateWithObservable(this.settingsDbService.globalSettings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());  
    this.settingsDbService.setAll(updatedSettings);
    this.showWelcomeScreen = false;
    this.logToolService.isModalOpen.next(false);
  }
  
}
