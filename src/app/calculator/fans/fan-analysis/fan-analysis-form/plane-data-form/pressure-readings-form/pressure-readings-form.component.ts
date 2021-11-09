import { Component, ElementRef, OnInit, Input, ViewChildren, ViewChild } from '@angular/core';
import { Plane } from '../../../../../../shared/models/fans';
import { FanAnalysisService } from '../../../fan-analysis.service';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-pressure-readings-form',
  templateUrl: './pressure-readings-form.component.html',
  styleUrls: ['./pressure-readings-form.component.css']
})
export class PressureReadingsFormComponent implements OnInit {
  @Input()
  planeNum: string;
  @Input()
  pressureType: string = 'Velocity';
  @ViewChildren('inputs') inputs;
  @ViewChild("importFile") importFile: ElementRef;

  traverseHoles: Array<Array<number>>;
  numLabels: Array<number>;
  planeData: Plane;
  resetFormSubscription: Subscription;
  updateTraverseDataSubscription: Subscription;
  traverseHoleWarning: string;
  filesUploaded: boolean;
  fileReferences: Array<any>;
  hasErrorData: boolean;

  constructor(private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.numLabels = new Array();
    this.setPlaneData();
    this.initializeData();
    this.resetFormSubscription = this.fanAnalysisService.resetForms.subscribe(val => {
      if (val == true) {
        this.numLabels = new Array();
        this.setPlaneData();
        this.initializeData();
      }
    });
    this.updateTraverseDataSubscription = this.fanAnalysisService.updateTraverseData.subscribe(val => {
      if (val == true) {
        this.setPlaneData();
        this.updateData();
      }
    });
    this.updateData();
    this.save();
  }

  ngOnDestroy() {
    this.resetFormSubscription.unsubscribe();
    this.updateTraverseDataSubscription.unsubscribe();
  }

  setImportFile(files: FileList) {
    this.fileReferences = new Array();
    if (files) {
      if (files.length !== 0) {
        let regex3 = /.xlsx$/;
        for (let index = 0; index < files.length; index++) {
          if (regex3.test(files[index].name)) {
            this.fileReferences.push(files[index]);
          }
        }
        if (this.fileReferences.length != 0) {
          this.importFiles();
        }
      }
    }
  }

  importFiles() {
    this.fileReferences.forEach(fileReference => {
      let excelTest = /.xlsx$/;
      if (excelTest.test(fileReference.name)) {
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
          /* read workbook */
          const bstr: string = e.target.result;
          let workBook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: true });
          let rowObject  =  XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]]);
          let nTraverseHoles = new Array();
          let rowIndex = 1;
          let oldColLength = -1;
          for (rowIndex = 1; rowIndex < rowObject.length; rowIndex++) {
            let colIndex = 1;
            let propArray = Object.keys(rowObject[rowIndex] as Object);
            nTraverseHoles.push([]);
            for (colIndex = 1; colIndex < propArray.length; colIndex++) {
              // checks if value in cell is numeric (contains only digits, negative sign, or decimal point)
              if (!(/^[0-9.-]*$/.test(rowObject[rowIndex][propArray[colIndex].toString()]))) {
                this.hasErrorData = true;
                return;
              }
              nTraverseHoles[rowIndex-1].push(rowObject[rowIndex][propArray[colIndex].toString()]);
            }
            if (oldColLength !== -1 && oldColLength !== colIndex) {
              this.hasErrorData = true;
              return;
            }
            oldColLength = colIndex;
            this.planeData.numTraverseHoles = colIndex - 1;
          }
          this.planeData.numInsertionPoints = rowIndex - 1;
          this.setTraverseHoles(nTraverseHoles);
          this.updateForm();
        };
        reader.readAsBinaryString(fileReference);
      }
    });
    this.filesUploaded = true;
  }

  setPlaneData() {
    this.planeData = this.fanAnalysisService.getPlane(this.planeNum);
  }

  initializeData() {
    if (this.pressureType != 'Static') {
      this.setTraverseHoles(this.planeData.traverseData);
    } else {
      this.setTraverseHoles(this.planeData.staticPressureData);
    }
  }

  setTraverseHoles(currentTraverseData: Array<Array<number>>) {
      this.hasErrorData = false;
      this.traverseHoles = currentTraverseData;
      for (let i = 0; i < this.planeData.numTraverseHoles; i++) {
        this.numLabels.push(i + 1);
      }
  }

  updateData() {
    this.traverseHoles = this.traverseHoles.slice(0, this.planeData.numInsertionPoints);
    if (this.traverseHoles.length < this.planeData.numInsertionPoints) {
      for (let i = this.traverseHoles.length; i < this.planeData.numInsertionPoints; i++) {
        this.traverseHoles.push(new Array<number>(this.planeData.numTraverseHoles).fill(0));
      }
    }

    for (let i = 0; i < this.traverseHoles.length; i++) {
      this.traverseHoles[i] = this.traverseHoles[i].slice(0, this.planeData.numTraverseHoles);
      if (this.traverseHoles[i].length < this.planeData.numTraverseHoles) {
        for (let n = this.traverseHoles[i].length; n < this.planeData.numTraverseHoles; n++) {
          this.traverseHoles[i].push(0);
        }
      }
    }
    this.numLabels = new Array();
    for (let i = 0; i < this.planeData.numTraverseHoles; i++) {
      this.numLabels.push(i + 1);
    }
    this.save();
  }

  focusInput(rowIndex: number, colIndex: number, rowLength: number) {
    // convert ViewChildren querylist to an array to access by index
    let inputEls = this.inputs.toArray();
    // get the flat index from row/cols
    let flatIdx = (rowIndex * rowLength) + colIndex;
    // get that reference from the input array and use the native element focus() method
    inputEls[flatIdx].nativeElement.focus();
  }

  shiftFocusDown(rowIndex: number, colIndex: number, rowLength: number) {
    let newIndex = Math.min(rowIndex + 1, this.traverseHoles.length - 1);
    this.focusInput(newIndex, colIndex, rowLength);
  }

  shiftFocusUp(rowIndex: number, colIndex: number, rowLength: number) {
    let newIndex = Math.max(0, rowIndex - 1);
    this.focusInput(newIndex, colIndex, rowLength);
  }

  shiftFocusLeft(rowIndex: number, colIndex: number, rowLength: number) {
    let newIndex = Math.max(0, colIndex - 1);
    this.focusInput(rowIndex, newIndex, rowLength);
  }

  shiftFocusRight(rowIndex: number, colIndex: number, rowLength: number) {
    let newIndex = Math.min(colIndex+1, rowLength - 1);
    this.focusInput(rowIndex, newIndex, rowLength);
  }


  setStaticPressure() {
    // Static pressure result is avg of all traverse holes/insertion points
    let row: Array<number>;
    let totalHolesValue: number = 0;
    let holeCount: number = 0;
    let holesAverage: number;
    this.traverseHoleWarning = undefined;

    for (let i = 0; i < this.traverseHoles.length; i++) {
      row = this.traverseHoles[i];
      for (let j = 0; j < row.length; j++) {
        if (row[j] == undefined || null) {
          this.traverseHoleWarning = 'Enter a value for each insertion point';
        } else {
          totalHolesValue += row[j];
          holeCount++;
        }
      }
    }

    holesAverage = (totalHolesValue / holeCount);
    if (isNaN(holesAverage)) {
      this.planeData.staticPressure = undefined;
    } else {
      this.planeData.staticPressure = holesAverage;
    }
  }

  updateForm() {
    this.fanAnalysisService.setPlane(this.planeNum, this.planeData);
    this.fanAnalysisService.updateTraverseData.next(true);
    this.fanAnalysisService.updateTraverseData.next(false);
  }

  save() {
    if (this.pressureType == 'Static') {
      this.setStaticPressure();
      this.planeData.staticPressureData = this.traverseHoles;
    } else {
      this.planeData.traverseData = this.traverseHoles;
    }
    this.fanAnalysisService.setPlane(this.planeNum, this.planeData);
    this.fanAnalysisService.getResults.next(true);
  }

  trackByFn(index: any, item: any) {
    return index;
  }
}
