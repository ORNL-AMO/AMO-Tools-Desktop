import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressorOrderingTableComponent } from './compressor-ordering-table.component';

describe('CompressorOrderingTableComponent', () => {
  let component: CompressorOrderingTableComponent;
  let fixture: ComponentFixture<CompressorOrderingTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressorOrderingTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressorOrderingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
