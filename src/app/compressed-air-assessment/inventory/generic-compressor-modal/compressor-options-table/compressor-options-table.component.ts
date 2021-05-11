import { Component, OnInit } from '@angular/core';
import { GenericCompressor, GenericCompressorDbService } from '../../../generic-compressor-db.service';

@Component({
  selector: 'app-compressor-options-table',
  templateUrl: './compressor-options-table.component.html',
  styleUrls: ['./compressor-options-table.component.css']
})
export class CompressorOptionsTableComponent implements OnInit {

  genericCompressors: Array<GenericCompressor>;
  constructor(private genericCompressorDbService: GenericCompressorDbService) { }

  ngOnInit(): void {
    this.genericCompressors = this.genericCompressorDbService.genericCompressors;
  }


  selectCompressor(compressor: GenericCompressor){

  }
}
