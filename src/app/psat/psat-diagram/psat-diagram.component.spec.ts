import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatDiagramComponent } from './psat-diagram.component';

describe('PsatDiagramComponent', () => {
  let component: PsatDiagramComponent;
  let fixture: ComponentFixture<PsatDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
