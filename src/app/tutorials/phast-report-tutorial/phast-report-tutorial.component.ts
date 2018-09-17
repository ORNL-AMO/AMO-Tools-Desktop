import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
@Component({
  selector: 'app-phast-report-tutorial',
  templateUrl: './phast-report-tutorial.component.html',
  styleUrls: ['./phast-report-tutorial.component.css']
})
export class PhastReportTutorialComponent implements OnInit {
  @Output('closeTutorial')
  closeTutorial = new EventEmitter<boolean>();
  @Input()
  inTutorials: boolean;

  showItem: Array<boolean> = [true, false, false, false, false, false, false];

  index: number = 0;
  dontShow: boolean = true;
  show: boolean = true;
  constructor(private settingsDbService: SettingsDbService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    setTimeout(() => {
      this.next();
    }, 1000)
  }

  next() {
    this.showItem[this.index] = false;
    this.index++;
    this.showItem[this.index] = true;
  }

  prev() {
    this.showItem[this.index] = false;
    this.index--;
    this.showItem[this.index] = true;
  }
  close() {
    if (this.dontShow && !this.inTutorials) {
      this.sendDontShow();
    }
    this.closeTutorial.emit(true);
  }

  sendDontShow() {
    this.settingsDbService.globalSettings.disablePhastReportTutorial = this.dontShow;
    this.indexedDbService.putSettings(this.settingsDbService.globalSettings).then(() => {
      this.settingsDbService.setAll();
    });
  }
}
