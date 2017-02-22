import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-field-data',
  templateUrl: './field-data.component.html',
  styleUrls: ['./field-data.component.css']
})
export class FieldDataComponent implements OnInit {
  @Input()
  psatForm: any;
  constructor() { }

  ngOnInit() {
  }

}
