import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-assessment-banner',
  templateUrl: './assessment-banner.component.html',
  styleUrls: ['./assessment-banner.component.css']
})
export class AssessmentBannerComponent implements OnInit {
  @Input()
  workingDirectoryName: string;
  @Output('changeView')
  changeView = new EventEmitter();
  settingsOpen: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  openSettings(){
    this.settingsOpen =  !this.settingsOpen;
    this.changeView.emit(true);
  }

}
