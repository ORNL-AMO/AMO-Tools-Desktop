import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fixture-losses-form',
  templateUrl: './fixture-losses-form.component.html',
  styleUrls: ['./fixture-losses-form.component.css']
})
export class FixtureLossesFormComponent implements OnInit {
  @Input()
  lossesForm: any;
  constructor() { }

  ngOnInit() {
  }

}
