import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-opening-losses-help',
  templateUrl: './opening-losses-help.component.html',
  styleUrls: ['./opening-losses-help.component.css']
})
export class OpeningLossesHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
