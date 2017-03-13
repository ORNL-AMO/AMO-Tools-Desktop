import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fixed-opening-form',
  templateUrl: './fixed-opening-form.component.html',
  styleUrls: ['./fixed-opening-form.component.css']
})
export class FixedOpeningFormComponent implements OnInit {
  @Input()
  openingLossesForm: any;
  constructor() { }

  ngOnInit() {
  }

}
