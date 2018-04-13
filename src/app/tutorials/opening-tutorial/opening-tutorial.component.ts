import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-opening-tutorial',
  templateUrl: './opening-tutorial.component.html',
  styleUrls: ['./opening-tutorial.component.css']
})
export class OpeningTutorialComponent implements OnInit {
  @Output('closeTutorial')
  closeTutorial = new EventEmitter<boolean>();

  showItem: Array<boolean> = [true, false, false, false, false, false];

  index: number = 0;
  showWelcomeText: Array<boolean> = [false, false, false, false];
  dontShow: boolean = true;
  show: boolean = true;
  constructor(private settingsService: SettingsService) { }

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
    if(this.dontShow){
      this.sendDontShow();
    }
    this.closeTutorial.emit(true);
  }

  sendDontShow(){
    this.settingsService.setDontShow.next(this.dontShow);
  }
}
