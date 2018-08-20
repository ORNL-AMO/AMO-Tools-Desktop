import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-phast-assessment-tutorial',
  templateUrl: './phast-assessment-tutorial.component.html',
  styleUrls: ['./phast-assessment-tutorial.component.css']
})
export class PhastAssessmentTutorialComponent implements OnInit {
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
    this.settingsDbService.globalSettings.disablePhastAssessmentTutorial = this.dontShow;
    this.indexedDbService.putSettings(this.settingsDbService.globalSettings).then(() => {
      this.settingsDbService.setAll();
    });
  }
}
