import { Component, OnInit, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-fsat-tutorial',
  templateUrl: './fsat-tutorial.component.html',
  styleUrls: ['./fsat-tutorial.component.css']
})
export class FsatTutorialComponent implements OnInit {
  @Output('closeTutorial')
  closeTutorial = new EventEmitter<boolean>();

  showItem: Array<boolean> = [true, false, false, false, false, false, false, false, false, false, false, false];

  index: number = 0;
  showWelcomeText: Array<boolean> = [false, false, false, false];
  //dontShow: boolean = true;
  show: boolean = true;
  constructor() { }

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
    // if(this.dontShow){
    //   // this.sendDontShow();
    // }
    this.closeTutorial.emit(true);
  }

  // sendDontShow(){
  //   this.settingsService.setDontShow.next(this.dontShow);
  // }
}
