import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-landing-screen',
  templateUrl: './landing-screen.component.html',
  styleUrls: ['./landing-screen.component.css']
})
export class LandingScreenComponent implements OnInit {
  @Output('hideLandingScreen')
  hideLandingScreen = new EventEmitter<boolean>();

  displayVideo: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  showVideo() {
    this.displayVideo = true;
  }

  hideScreen() {
    this.hideLandingScreen.emit(true);
  }
}
