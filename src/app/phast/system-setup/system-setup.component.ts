import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-system-setup',
  templateUrl: './system-setup.component.html',
  styleUrls: ['./system-setup.component.css']
})
export class SystemSetupComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  saveClicked: boolean;
  @Input()
  isAssessmentSettings: boolean;
  @Input()
  assessment: Assessment;
  @Output('emitUpdateSettings')
  emitUpdateSettings = new EventEmitter<boolean>();
  @Input()
  subTab: string;
  @Output('emitSubTabChange')
  emitSubTabChange = new EventEmitter<string>();
  @Input()
  continueClicked: boolean;

  subTabs: Array<string> = [
    'system-basics',
    'operating-hours'
  ]

  isFirstChange: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange) {
      if (changes.continueClicked) {
        this.subTab = 'operating-hours';
      }
    } else {
      this.isFirstChange = false;
    }
  }

  changeTab(str: string) {
    this.subTab = str;
  }

  getSettings() {
    this.emitUpdateSettings.emit(true);
  }
}
