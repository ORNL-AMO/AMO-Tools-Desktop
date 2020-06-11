import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityCompressorDataFormComponent } from './facility-compressor-data-form.component';

describe('FacilityCompressorDataFormComponent', () => {
  let component: FacilityCompressorDataFormComponent;
  let fixture: ComponentFixture<FacilityCompressorDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacilityCompressorDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacilityCompressorDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
