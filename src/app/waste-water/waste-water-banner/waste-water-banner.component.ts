import { Component, Input, OnInit } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-waste-water-banner',
  templateUrl: './waste-water-banner.component.html',
  styleUrls: ['./waste-water-banner.component.css']
})
export class WasteWaterBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;
  
  constructor() { }

  ngOnInit(): void {
  }

}
