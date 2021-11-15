import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirDiagramComponent } from './compressed-air-diagram.component';

describe('CompressedAirDiagramComponent', () => {
  let component: CompressedAirDiagramComponent;
  let fixture: ComponentFixture<CompressedAirDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressedAirDiagramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
