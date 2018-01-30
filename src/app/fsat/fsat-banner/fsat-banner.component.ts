import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-fsat-banner',
  templateUrl: './fsat-banner.component.html',
  styleUrls: ['./fsat-banner.component.css']
})
export class FsatBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;
  constructor() { }

  ngOnInit() {
  }

}
