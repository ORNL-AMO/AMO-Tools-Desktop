import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
 
import { firstValueFrom } from 'rxjs';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-dashboard-tutorial',
  templateUrl: './dashboard-tutorial.component.html',
  styleUrls: ['./dashboard-tutorial.component.css']
})
export class DashboardTutorialComponent implements OnInit {
  @Output('closeTutorial')
  closeTutorial = new EventEmitter<boolean>();
  @Input()
  inTutorials: boolean;

  showItem: Array<boolean> = [true, false, false, false, false, false, false, false, false, false, false, false];

  index: number = 0;
  showWelcomeText: Array<boolean> = [false, false, false, false];
  dontShow: boolean = true;
  show: boolean = true;
  constructor(private settingsDbService: SettingsDbService,  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.next();
    }, 1000);
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

  async sendDontShow() {
    this.settingsDbService.globalSettings.disableDashboardTutorial = this.dontShow;
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.updateWithObservable(this.settingsDbService.globalSettings))
    this.settingsDbService.setAll(updatedSettings);
  }
}
