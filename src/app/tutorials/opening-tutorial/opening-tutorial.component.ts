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
  show: boolean = true;
  showWelcomeText: Array<boolean> = [false, false, false, false];
  intro1: boolean = false;
  intro2: boolean = false;
  intro3: boolean = false;
  intro4: boolean = false;
  dontShow: boolean = true;
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
    this.closeTutorial.emit(true);
  }

  sendDontShow(){
    this.settingsService.setDontShow.next(this.dontShow);
  }

  getStarted(){
    if(this.dontShow){
      this.sendDontShow();
    }
    this.close();
  }
}
