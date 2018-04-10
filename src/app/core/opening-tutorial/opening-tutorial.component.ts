import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-opening-tutorial',
  templateUrl: './opening-tutorial.component.html',
  styleUrls: ['./opening-tutorial.component.css']
})
export class OpeningTutorialComponent implements OnInit {
  @Output('closeTutorial')
  closeTutorial = new EventEmitter<boolean>();
  
  showItem: Array<boolean> = [true, false, false];

  index: number = 0;
  constructor() { }

  ngOnInit() {
  }

  next(){
    this.showItem[this.index] = false;
    this.index++;
    this.showItem[this.index] = true;
  }

  prev(){
    this.showItem[this.index] = false;
    this.index--;
    this.showItem[this.index] = true;
  }  
  close(){
    this.closeTutorial.emit(true);
  }
}
