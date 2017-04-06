import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-atmosphere-losses-help',
  templateUrl: './atmosphere-losses-help.component.html',
  styleUrls: ['./atmosphere-losses-help.component.css']
})
export class AtmosphereLossesHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
