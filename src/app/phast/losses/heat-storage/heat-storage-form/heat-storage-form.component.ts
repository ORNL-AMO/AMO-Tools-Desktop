import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-heat-storage-form',
  templateUrl: './heat-storage-form.component.html',
  styleUrls: ['./heat-storage-form.component.css']
})
export class HeatStorageFormComponent implements OnInit {
  @Input()
  heatStorageForm: any;
  constructor() { }

  ngOnInit() {
  }

}
