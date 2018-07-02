import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-general-method-help',
  templateUrl: './general-method-help.component.html',
  styleUrls: ['./general-method-help.component.css']
})
export class GeneralMethodHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
