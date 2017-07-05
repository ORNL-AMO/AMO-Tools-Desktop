import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-o2-enrichment-form',
  templateUrl: './o2-enrichment-form.component.html',
  styleUrls: ['./o2-enrichment-form.component.css']
})
export class O2EnrichmentFormComponent implements OnInit {
  @Input()
  furnaceForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit() {
  }
  calc() {
    if (this.furnaceForm.valid) {
      this.calculate.emit(true);
    }
  }
}
