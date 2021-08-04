import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { FullLoadAmpsService } from './full-load-amps.service';

@Component({
  selector: 'app-full-load-amps',
  templateUrl: './full-load-amps.component.html',
  styleUrls: ['./full-load-amps.component.css']
})
export class FullLoadAmpsComponent implements OnInit {

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  flaInputSub: Subscription;
  settings: Settings;
  currentField: string;
  constructor(private settingsDbService: SettingsDbService, private fullLoadAmpsService: FullLoadAmpsService) { }

  ngOnInit() {
    this.settings = this.settingsDbService.globalSettings;
    this.fullLoadAmpsService.initDefualtEmptyInputs(this.settings);

    
  }

  ngOnDestroy(){
    this.flaInputSub.unsubscribe();
  }

  initSubscriptions() {
    this.flaInputSub = this.fullLoadAmpsService.fullLoadAmpsInputs.subscribe(value => {
      this.fullLoadAmpsService.getFormFromObj(value);
    })
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  // calculate() {
  //   this.fullLoadAmpsService.calculate(this.settings);
  // }

  btnGenerateExample() {
    this.fullLoadAmpsService.generateExampleData(this.settings);
    this.fullLoadAmpsService.generateExample.next(true);
  }

  changeField(str: string) {
    this.currentField = str;
  }

}
