import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-compressor-cycle-help',
  templateUrl: './compressor-cycle-help.component.html',
  styleUrls: ['./compressor-cycle-help.component.css']
})
export class CompressorCycleHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit(): void {
  }

}
