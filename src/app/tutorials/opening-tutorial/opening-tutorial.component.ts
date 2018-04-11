import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-opening-tutorial',
  templateUrl: './opening-tutorial.component.html',
  styleUrls: ['./opening-tutorial.component.css']
})
export class OpeningTutorialComponent implements OnInit {
  @Output('closeTutorial')
  closeTutorial = new EventEmitter<boolean>();

  showItem: Array<boolean> = [true, false, false, false, false];

  index: number = 0;
  show: boolean = false;
  showWelcomeText: Array<boolean> = [false, false, false, false];
  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.show = true;
      // this.showWelcomeText[0] = true;
      this.next();
    }, 1000)

    // setTimeout(() => {
    //   this.showWelcomeText[1] = true;
    // }, 4000)

    // setTimeout(() => {
    //   this.showWelcomeText[2] = true;
    // }, 8000)

    // setTimeout(() => {
    //   this.showWelcomeText[3] = true;
    // }, 9000)
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
}
