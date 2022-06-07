import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressorCycleHelpComponent } from './compressor-cycle-help.component';

describe('CompressorCycleHelpComponent', () => {
  let component: CompressorCycleHelpComponent;
  let fixture: ComponentFixture<CompressorCycleHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressorCycleHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressorCycleHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
