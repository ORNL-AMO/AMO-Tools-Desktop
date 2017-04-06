import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-extended-surface-losses-help',
  templateUrl: './extended-surface-losses-help.component.html',
  styleUrls: ['./extended-surface-losses-help.component.css']
})
export class ExtendedSurfaceLossesHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
