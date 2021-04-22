import { Component, Input, OnInit } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-compressed-air-banner',
  templateUrl: './compressed-air-banner.component.html',
  styleUrls: ['./compressed-air-banner.component.css']
})
export class CompressedAirBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;
  
  constructor() { }

  ngOnInit(): void {
  }

}
