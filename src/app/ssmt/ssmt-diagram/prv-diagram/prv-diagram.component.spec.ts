import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrvDiagramComponent } from './prv-diagram.component';

describe('PrvDiagramComponent', () => {
  let component: PrvDiagramComponent;
  let fixture: ComponentFixture<PrvDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrvDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrvDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
