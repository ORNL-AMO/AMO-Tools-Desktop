import { Component, OnInit, HostListener, ViewChild, ElementRef, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ReceiverTankService } from './receiver-tank.service';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-receiver-tank',
  templateUrl: './receiver-tank.component.html',
  styleUrls: ['./receiver-tank.component.css']
})
export class ReceiverTankComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  calcType: string;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  methods: Array<{ name: string, value: number }> = [
    {
      name: 'General',
      value: 0
    },
    {
      name: 'Dedicated Storage',
      value: 1
    },
    {
      name: 'Metered Storage',
      value: 2
    },
    {
      name: 'Bridging Compressor Reaction Delay',
      value: 3
    }
  ];
  currentField: string;
  currentFieldSub: Subscription;
  constructor(public receiverTankService: ReceiverTankService, private settingsDbService: SettingsDbService, private router: Router) {
  }

  ngOnInit() {
    if (this.calcType == undefined) {
      this.setCalcType();
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.currentFieldSub = this.receiverTankService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.currentFieldSub.unsubscribe();
  }

  setCalcType() {
    if (this.router.url.indexOf('usable-air') != -1) {
      this.calcType = 'usable-air';
    } else {
      this.calcType = 'size-calculations';
    }
  }


  btnResetData() {
    if (this.calcType == 'size-calculations') {
      this.receiverTankService.setDefaults();
    } else if (this.calcType == 'usable-air') {
      this.receiverTankService.setAirCapacityDefault();
    }
    this.receiverTankService.setForm.next(true);
  }

  btnGenerateExample() {
    if (this.calcType == 'size-calculations') {
      this.receiverTankService.setExampleData(this.settings);
    } else if (this.calcType == 'usable-air') {
      this.receiverTankService.setAirCapacityExample(this.settings);
    }
    this.receiverTankService.setForm.next(true);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }
}
