import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { LogToolDbService } from './log-tool-db.service';
import { LogToolService } from './log-tool.service';

@Component({
  selector: 'app-log-tool',
  templateUrl: './log-tool.component.html',
  styleUrls: ['./log-tool.component.css']
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
    private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.logToolDbService.initLogToolData();
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

  closeWelcomeScreen() {
    this.settingsDbService.globalSettings.disableDataExplorerTutorial = true;
    this.indexedDbService.putSettings(this.settingsDbService.globalSettings);
    this.showWelcomeScreen = false;
    this.logToolService.isModalOpen.next(false);
  }
  
}
