import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-compressor-replacement-help',
  templateUrl: './compressor-replacement-help.component.html',
  styleUrls: ['./compressor-replacement-help.component.css'],
  standalone: false
})
export class CompressorReplacementHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit(): void { }
}
