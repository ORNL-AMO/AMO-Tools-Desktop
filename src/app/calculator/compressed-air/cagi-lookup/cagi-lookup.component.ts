import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener, signal, computed } from '@angular/core';
import { CagiLookupService, CagiRow, CompressorPlotData } from './cagi-lookup.service';

interface SelectedRow {
  id: number;
  data: CagiRow;
}

@Component({
  selector: 'app-cagi-lookup',
  templateUrl: './cagi-lookup.component.html',
  styleUrls: ['./cagi-lookup.component.css'],
  standalone: false
})
export class CagiLookupComponent implements OnInit, AfterViewInit {

  searchTerm = signal<string>('');
  suggestions = signal<Array<CagiRow>>([]);
  selectedRows = signal<Array<SelectedRow>>([]);
  showSuggestions = signal<boolean>(false);

  tabSelect = signal<string>('comparison');
  /** 'each' normalizes every unit to its own 100%; 'largest' scales all to the highest-capacity unit. */
  scaleMode = signal<string>('each');

  plotData = computed<Array<CompressorPlotData>>(() =>
    this.selectedRows().map(row => this.cagiLookupService.extractPoints(row.data, this.displayModel(row.data))));

  isLoaded = signal<boolean>(false);
  loadError = signal<boolean>(false);
  copied = signal<boolean>(false);

  smallScreenTab: string = 'form';
  headerHeight: number;
  containerHeight: number;

  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  private nextRowId: number = 0;
  private blurTimeout: ReturnType<typeof setTimeout>;

  constructor(private cagiLookupService: CagiLookupService) { }

  @HostListener('window:resize')
  onResize(): void {
    setTimeout(() => this.resizeTabs(), 100);
  }

  ngOnInit(): void {
    this.cagiLookupService.initCagiData()
      .then(() => this.isLoaded.set(true))
      .catch(() => this.loadError.set(true));
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.resizeTabs(), 100);
  }

  resizeTabs(): void {
    if (this.leftPanelHeader?.nativeElement?.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setSmallScreenTab(selectedTab: string): void {
    this.smallScreenTab = selectedTab;
  }

  get fields(): Array<string> { return this.cagiLookupService.fields; }
  get modelNumberKey(): string { return this.cagiLookupService.modelNumberKey; }
  get pressureKey(): string { return this.cagiLookupService.pressureKey; }

  onSearch(event: Event): void {
    const value: string = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.suggestions.set(this.cagiLookupService.search(value));
    this.showSuggestions.set(true);
  }

  onFocus(): void {
    clearTimeout(this.blurTimeout);
    if (this.suggestions().length) { this.showSuggestions.set(true); }
  }

  onBlur(): void {
    this.blurTimeout = setTimeout(() => this.showSuggestions.set(false), 150);
  }

  addRow(row: CagiRow): void {
    this.selectedRows.update(rows => [...rows, { id: this.nextRowId++, data: row }]);
    this.searchTerm.set('');
    this.suggestions.set([]);
    this.showSuggestions.set(false);
  }

  removeRow(id: number): void {
    this.selectedRows.update(rows => rows.filter(row => row.id !== id));
  }

  clearAll(): void { this.selectedRows.set([]); }

  async copyToClipboard(): Promise<void> {
    const headerLine: string = this.fields.join('\t');
    const rowLines: Array<string> = this.selectedRows().map(row => this.fields.map(field => row.data[field] ?? '').join('\t'));
    const tsv: string = [headerLine, ...rowLines].join('\n');
    try {
      await navigator.clipboard.writeText(tsv);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      this.copied.set(false);
    }
  }

  setTab(tab: string): void { this.tabSelect.set(tab); }
  setScaleMode(mode: string): void { this.scaleMode.set(mode); }

  displayModel(row: CagiRow): string {
    const model: string = row[this.modelNumberKey] ?? '';
    const pressure: string = this.pressureKey ? (row[this.pressureKey] ?? '').trim() : '';
    return pressure ? `${model} (${pressure} psig)` : model;
  }

}
