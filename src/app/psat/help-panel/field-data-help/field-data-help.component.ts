import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-field-data-help',
  templateUrl: './field-data-help.component.html',
  styleUrls: ['./field-data-help.component.css']
})
export class FieldDataHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
