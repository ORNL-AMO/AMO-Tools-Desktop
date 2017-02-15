import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-assessment-banner',
  templateUrl: './assessment-banner.component.html',
  styleUrls: ['./assessment-banner.component.css']
})
export class AssessmentBannerComponent implements OnInit {
  @Input()
  workingDirectoryName: string;
  constructor() { }

  ngOnInit() {
  }

}
