import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fixture-losses-help',
  templateUrl: './fixture-losses-help.component.html',
  styleUrls: ['./fixture-losses-help.component.css']
})
export class FixtureLossesHelpComponent implements OnInit {
  @Input()
  currentField: string;
  
  constructor() { }

  ngOnInit() {
  }

}
