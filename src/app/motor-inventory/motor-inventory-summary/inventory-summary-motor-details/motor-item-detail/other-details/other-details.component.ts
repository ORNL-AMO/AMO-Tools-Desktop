import { Component, OnInit, Input } from '@angular/core';
import { OtherOptions, OtherData } from '../../../../motor-inventory';

@Component({
  selector: 'app-other-details',
  templateUrl: './other-details.component.html',
  styleUrls: ['./other-details.component.css']
})
export class OtherDetailsComponent implements OnInit {
  @Input()
  displayOptions: OtherOptions;
  @Input()
  otherData: OtherData;
  constructor() { }

  ngOnInit(): void {
  }

}
