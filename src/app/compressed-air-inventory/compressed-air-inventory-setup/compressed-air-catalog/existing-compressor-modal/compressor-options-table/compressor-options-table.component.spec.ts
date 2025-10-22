import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressorOptionsTableComponent } from './compressor-options-table.component';

describe('CompressorOptionsTableComponent', () => {
  let component: CompressorOptionsTableComponent;
  let fixture: ComponentFixture<CompressorOptionsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressorOptionsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressorOptionsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
