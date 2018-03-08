import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-motor-performance',
  templateUrl: './motor-performance.component.html',
  styleUrls: ['./motor-performance.component.css']
})
export class MotorPerformanceComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  currentField: string;
  performanceForm: FormGroup;

  toggleCalculate: boolean = false;
  tabSelect: string = 'results';
  constructor(private psatService: PsatService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    if (!this.psat) {
      this.performanceForm = this.psatService.initForm();
      //default values for standalone calculator
      this.performanceForm.patchValue({
        frequency: this.psatService.getLineFreqFromEnum(0),
        horsePower: '200',
        motorRPM: 1780,
        efficiencyClass: this.psatService.getEfficiencyClassFromEnum(1),
        motorVoltage: 460,
        fullLoadAmps: 225.4,
        sizeMargin: 1
      });
    } else {
      this.performanceForm = this.psatService.getFormFromPsat(this.psat.inputs);
    }

    //use system settings for standalone calculator
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          if (results.length != 0) {
            if (results[0].powerMeasurement != 'hp') {
              this.performanceForm.patchValue({
                horsePower: '150'
              })
            }
            this.settings = results[0];
          }
        }
      )
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  calculate() {
    this.toggleCalculate = !this.toggleCalculate;
  }
  setTab(str: string) {
    this.tabSelect = str;
  }
  changeField(str: string) {
    this.currentField = str;
  }
}
