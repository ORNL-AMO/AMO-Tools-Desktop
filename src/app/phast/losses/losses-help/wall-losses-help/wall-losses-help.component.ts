import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-wall-losses-help',
  templateUrl: './wall-losses-help.component.html',
  styleUrls: ['./wall-losses-help.component.css']
})
export class WallLossesHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
