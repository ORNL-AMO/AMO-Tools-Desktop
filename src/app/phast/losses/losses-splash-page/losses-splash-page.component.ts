import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-losses-splash-page',
  templateUrl: './losses-splash-page.component.html',
  styleUrls: ['./losses-splash-page.component.css']
})
export class LossesSplashPageComponent implements OnInit {
  @Output('hidePage')
  hidePage = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  hideSetupDialog(){
    this.hidePage.emit(true);
  }
}
