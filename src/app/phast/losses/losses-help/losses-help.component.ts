import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-losses-help',
  templateUrl: './losses-help.component.html',
  styleUrls: ['./losses-help.component.css']
})
export class LossesHelpComponent implements OnInit {
  @Input()
  lossesTab: string;
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
