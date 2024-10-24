import { Injectable } from '@angular/core';
import { ImportExportAssessment, ImportExportDirectory, ImportExportData, ImportExportInventory, ImportExportDiagram } from './importExportModel';
import { Directory } from '../../shared/models/directory';
import { Assessment } from '../../shared/models/assessment';
import * as _ from 'lodash';
import { Calculator } from '../../shared/models/calculators';
import { Settings } from '../../shared/models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { CalculatorDbService } from '../../indexedDb/calculator-db.service';
import { SSMT } from '../../shared/models/steam/ssmt';
import { InventoryItem } from '../../shared/models/inventory/inventory';
import { InventoryDbService } from '../../indexedDb/inventory-db.service';
import { DayTypeSummary } from '../../log-tool/log-tool-models';
import { Diagram } from '../models/diagram';
import { DiagramIdbService } from '../../indexedDb/diagram-idb.service';
@Injectable()
export class ExportService {
  exportAll: boolean = false;
  exportData: ImportExportData;
  exportDirectories: Array<ImportExportDirectory>;
  exportAssessments: Array<ImportExportAssessment>;
  exportDiagrams: Array<ImportExportDiagram>;
  exportPreAssessments: Array<Calculator>;
  exportInventories: Array<ImportExportInventory>;
  directoryAssessments: Array<ImportExportAssessment>;
  directoryInventories: Array<ImportExportInventory>;
  constructor(private settingsDbService: SettingsDbService, 
    private assessmentDbService: AssessmentDbService, 
    private directoryDbService: DirectoryDbService,
    private diagramDbService: DiagramIdbService, 
    private calculatorDbService: CalculatorDbService,
    private inventoryDbService: InventoryDbService) {
  }
  getSelected(dir: Directory, isSelectAll: boolean): ImportExportData {
    this.exportAssessments = new Array<ImportExportAssessment>();
    this.exportDiagrams = new Array<ImportExportDiagram>();
    this.exportDirectories = new Array<ImportExportDirectory>();
    this.exportInventories = new Array<ImportExportInventory>();
    this.exportPreAssessments = new Array<Calculator>();
    
    let assessments: Array<Assessment>;
    let selectedDirectories: Array<Directory>;
    let preAssessments: Array<Calculator> = new Array<Calculator>();
    let inventories: Array<InventoryItem> = new Array<InventoryItem>();
    let diagrams: Array<Diagram> = new Array<Diagram>();

    if (!isSelectAll) {
      assessments = _.filter(dir.assessments, (assessment) => { return assessment.selected === true; });
      selectedDirectories = _.filter(dir.subDirectory, (subDir) => { return subDir.selected === true; });
      preAssessments = _.filter(dir.calculators, (calc) => { return calc.preAssessments && calc.selected === true; });
      inventories = _.filter(dir.inventories, (inventory) => { return inventory.selected === true });
      diagrams = _.filter(dir.diagrams, (diagram) => { return diagram.selected === true });
    } else {
      selectedDirectories = [dir];
    }

    if (assessments) {
      assessments.forEach(assessment => {
        let obj = this.getAssessmentObj(assessment);
        this.exportAssessments.push(obj);
      });
    }

    if (preAssessments) {
      this.exportPreAssessments = preAssessments;
    }
    if (selectedDirectories) {
      selectedDirectories.forEach(dir => {
        this.addDirectoryObj(dir);
        this.setDirectoryExportAssessments(dir);
        this.setDirectoryExportedInventories(dir);
        this.setDirectoryExportedDiagrams(dir);
        this.setDirectoryExportPreAssessmentCalcs(dir);
      });
    }
    if (inventories) {
      inventories.forEach(inventory => {
        let obj = this.getInventoryObj(inventory);
        this.exportInventories.push(obj);
      });
    }

    if (diagrams) {
      diagrams.forEach(diagram => {
        let obj = this.getDiagramObj(diagram);
        this.exportDiagrams.push(obj);
      });
    }
    this.exportData = {
      directories: this.exportDirectories,
      assessments: this.exportAssessments,
      calculators: this.exportPreAssessments,
      inventories: this.exportInventories,
      diagrams: this.exportDiagrams
    };
    return this.exportData;
  }

  getSelectedAssessment(assessment: Assessment): ImportExportData {
    this.exportAssessments = new Array<ImportExportAssessment>();
    this.exportDirectories = new Array<ImportExportDirectory>();
    this.exportInventories = new Array<ImportExportInventory>();
    this.exportDiagrams = new Array<ImportExportDiagram>();
    this.exportPreAssessments = new Array<Calculator>(); 

    if (assessment) {
      let obj = this.getAssessmentObj(assessment);
      this.exportAssessments.push(obj);     
    }  
        
    this.exportData = {
      directories: this.exportDirectories,
      assessments: this.exportAssessments,
      calculators: this.exportPreAssessments,
      inventories: this.exportInventories,
      diagrams: this.exportDiagrams
    };
    return this.exportData;
  }

  getSelectedInventory(inventoryItem: InventoryItem): ImportExportData {
    this.exportAssessments = new Array<ImportExportAssessment>();
    this.exportDirectories = new Array<ImportExportDirectory>();
    this.exportInventories = new Array<ImportExportInventory>();
    this.exportPreAssessments = new Array<Calculator>(); 
    this.exportDiagrams = new Array<ImportExportDiagram>();

    if (inventoryItem) {
      let obj = this.getInventoryObj(inventoryItem);
      this.exportInventories.push(obj);     
    }  
        
    this.exportData = {
      directories: this.exportDirectories,
      assessments: this.exportAssessments,
      calculators: this.exportPreAssessments,
      inventories: this.exportInventories,
      diagrams: this.exportDiagrams
    };
    return this.exportData;
  }

  
  getDiagramObj(diagram: Diagram): ImportExportDiagram {
    let settings: Settings = this.settingsDbService.getByDiagramId(diagram);
    // todo 7081 - move assessmentId up to diagram
    let assessment: Assessment = this.assessmentDbService.findById(diagram.assessmentId);
    let importExportDiagram: ImportExportDiagram = {
      diagram: diagram,
      settings: settings,
      assessment: assessment
    };
    return importExportDiagram;
  }

  
  getAssessmentObj(assessment: Assessment): ImportExportAssessment {
    if (assessment.ssmt) {
      assessment = this.removeSsmtResults(assessment);
    }
    if (assessment.compressedAirAssessment) {
      assessment = this.removeDataExplorerData(assessment);
    }
    let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
    let calculator: Calculator = this.calculatorDbService.getByAssessmentId(assessment.id);
    let diagram: Diagram = this.diagramDbService.findById(assessment.diagramId);
    let model: ImportExportAssessment = {
      assessment: assessment,
      settings: settings,
      calculator: calculator,
      diagram: diagram
    };
    return model;
  }

  removeSsmtResults(assessment: Assessment): Assessment {
    assessment.ssmt = this.deleteSsmtResults(assessment.ssmt);
    if (assessment.ssmt.modifications) {
      assessment.ssmt.modifications.forEach(mod => {
        mod.ssmt = this.deleteSsmtResults(mod.ssmt);
        if (mod.ssmt.modifications) {
          delete mod.ssmt.modifications;
        }
      })
    }
    return assessment;
  }
  deleteSsmtResults(ssmt: SSMT): SSMT {
    if (ssmt.outputData) {
      delete ssmt.outputData;
    }
    return ssmt;
  }

  removeDataExplorerData(assessment: Assessment): Assessment {
    if (assessment.compressedAirAssessment.logToolData) {
      let excludedDayTypeIndex: number;
      assessment.compressedAirAssessment.logToolData.dayTypeSummaries.forEach((dts: DayTypeSummary, index: number) => {
        delete dts.dayType.logToolDays;
        if (dts.dayType.label === 'Excluded') {
          excludedDayTypeIndex = index;
        }
      });
      if (excludedDayTypeIndex !== undefined) {
        assessment.compressedAirAssessment.logToolData.dayTypeSummaries.splice(excludedDayTypeIndex, 1);
      }
    }
    if (assessment.compressedAirAssessment.systemProfile) {
      assessment.compressedAirAssessment.systemProfile.profileSummary.forEach(profile => {
        profile.logToolFieldId = undefined;
        profile.logToolFieldIdAmps = undefined;
        profile.logToolFieldIdPowerFactor = undefined;
        profile.logToolFieldIdVolts = undefined;
      });
    }
    return assessment;
  }
  addDirectoryObj(directory: Directory) {
    let testDirAdded = _.find(this.exportDirectories, (item) => { return item.directory.id === directory.id; });
    if (!testDirAdded) {
      let settings: Settings = this.settingsDbService.getByDirectoryId(directory.id);
      let calculators: Array<Calculator> = this.calculatorDbService.getByDirectoryId(directory.id);
      let dirItem: ImportExportDirectory = {
        settings: settings,
        calculator: calculators,
        directory: directory
      };
      this.exportDirectories.push(dirItem);
    }
  }

  setDirectoryExportAssessments(dir: Directory) {
    let assessments = this.assessmentDbService.getByDirectoryId(dir.id);
    if (assessments) {
      assessments.forEach(assessment => {
        let obj = this.getAssessmentObj(assessment);
        this.exportAssessments.push(obj);
      });
    }
    let subDirs = this.directoryDbService.getSubDirectoriesById(dir.id);
    if (subDirs) {
      subDirs.forEach(subDir => {
        this.addDirectoryObj(subDir);
        this.setDirectoryExportAssessments(subDir);
      });
    }
  }

  setDirectoryExportedDiagrams(dir: Directory) {
    let diagrams = this.diagramDbService.getByDirectoryId(dir.id);
    if (diagrams) {
      diagrams.forEach(assessment => {
        let obj = this.getDiagramObj(assessment);
        this.exportDiagrams.push(obj);
      });
    }
    let subDirs = this.directoryDbService.getSubDirectoriesById(dir.id);
    if (subDirs) {
      subDirs.forEach(subDir => {
        this.addDirectoryObj(subDir);
        this.setDirectoryExportedDiagrams(subDir);
      });
    }
  }

  setDirectoryExportPreAssessmentCalcs(dir: Directory) {
    let preAssessmentCalcs: Calculator[] = this.calculatorDbService.getByDirectoryId(dir.id);
    if (preAssessmentCalcs) {
      preAssessmentCalcs.forEach(calc => {
        this.exportPreAssessments.push(calc);
      });
    }
    let subDirs = this.directoryDbService.getSubDirectoriesById(dir.id);
    if (subDirs) {
      subDirs.forEach(subDir => {
        this.addDirectoryObj(subDir);
        this.setDirectoryExportPreAssessmentCalcs(subDir);
      });
    }
  }

  setDirectoryExportedInventories(dir: Directory) {
    let inventories = this.inventoryDbService.getByDirectoryId(dir.id);
    if (inventories) {
      inventories.forEach(inventory => {
        let obj = this.getInventoryObj(inventory);
        this.exportInventories.push(obj);
      });
    }
    let subDirs = this.directoryDbService.getSubDirectoriesById(dir.id);
    if (subDirs) {
      subDirs.forEach(subDir => {
        this.addDirectoryObj(subDir);
        this.setDirectoryExportedInventories(subDir);
      });
    }
  }
  getInventoryObj(inventory: InventoryItem): ImportExportInventory {
    return {
      inventoryItem: inventory,
      settings: this.settingsDbService.getByInventoryId(inventory)
    }
  }
}