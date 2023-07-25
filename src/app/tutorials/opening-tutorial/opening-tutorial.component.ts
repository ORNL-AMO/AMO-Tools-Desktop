import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
 
import { firstValueFrom } from 'rxjs';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-opening-tutorial',
  templateUrl: './opening-tutorial.component.html',
  styleUrls: ['./opening-tutorial.component.css']
})
export class OpeningTutorialComponent implements OnInit {
  @Output('closeTutorial')
  closeTutorial = new EventEmitter<boolean>();
  @Input()
  idbStarted: boolean;

  showItem: Array<boolean> = [true, false, false, false, false, false, false];

  index: number = 0;
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
    if (this.dontShow) {
      this.sendDontShow();
    }
    this.closeTutorial.emit(true);
  }

  async sendDontShow() {
      this.settingsDbService.globalSettings.disableTutorial = this.dontShow;
      await firstValueFrom(this.settingsDbService.updateWithObservable(this.settingsDbService.globalSettings));
      let settings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
      this.settingsDbService.setAll(settings);
  }
}
