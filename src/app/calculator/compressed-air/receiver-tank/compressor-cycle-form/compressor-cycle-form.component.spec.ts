import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressorCycleFormComponent } from './compressor-cycle-form.component';

describe('CompressorCycleFormComponent', () => {
  let component: CompressorCycleFormComponent;
  let fixture: ComponentFixture<CompressorCycleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressorCycleFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressorCycleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
