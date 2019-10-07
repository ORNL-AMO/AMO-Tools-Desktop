import { Component, OnInit, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { PipeSizingInput, PipeSizingOutput } from "../../../shared/models/standalone";
import { Settings } from '../../../shared/models/settings';
import { PipeSizingService } from './pipe-sizing.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

@Component({
  selector: 'app-pipe-sizing',
  templateUrl: './pipe-sizing.component.html',
  styleUrls: ['./pipe-sizing.component.css']
})
export class PipeSizingComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  inputs: PipeSizingInput;
  outputs: PipeSizingOutput;
  currentField: string = 'default';
  constructor(private standaloneService: StandaloneService, private pipeSizingService: PipeSizingService, private settingsDbService: SettingsDbService) {
  }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.inputs = this.pipeSizingService.inputs;
    this.calculatePipeSize(this.inputs);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy(){
    this.pipeSizingService.inputs = this.inputs;
  }

  btnResetData() {
    this.inputs = this.pipeSizingService.getDefaultData();
    this.calculatePipeSize(this.inputs);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  calculatePipeSize(inputs: PipeSizingInput) {
    this.outputs = this.standaloneService.pipeSizing(inputs, this.settings);
  }

  setField(str: string) {
    this.currentField = str;
  }

  btnGenerateExample() {
    let tempInputs: PipeSizingInput = this.pipeSizingService.getExampleData();
    this.inputs = this.pipeSizingService.convertPipeSizingExample(tempInputs, this.settings);
    console.log('generate example');
    this.calculatePipeSize(this.inputs);
  }
}
