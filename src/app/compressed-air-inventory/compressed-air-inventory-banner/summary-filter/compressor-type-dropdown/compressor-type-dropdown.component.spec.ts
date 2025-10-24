import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressorTypeDropdownComponent } from './compressor-type-dropdown.component';

describe('CompressorTypeDropdownComponent', () => {
  let component: CompressorTypeDropdownComponent;
  let fixture: ComponentFixture<CompressorTypeDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressorTypeDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressorTypeDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
