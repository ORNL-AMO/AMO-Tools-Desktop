import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-field-data',
  templateUrl: './field-data.component.html',
  styleUrls: ['./field-data.component.css']
})
export class FieldDataComponent implements OnInit {
  @Input()
  psatForm: any;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }

  focusField(str: string){
    console.log(str);
    this.changeField.emit(str);
  }
}
