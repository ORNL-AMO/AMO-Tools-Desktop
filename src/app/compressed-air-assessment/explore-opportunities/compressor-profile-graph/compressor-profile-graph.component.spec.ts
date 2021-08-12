import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressorProfileGraphComponent } from './compressor-profile-graph.component';

describe('CompressorProfileGraphComponent', () => {
  let component: CompressorProfileGraphComponent;
  let fixture: ComponentFixture<CompressorProfileGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressorProfileGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressorProfileGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
