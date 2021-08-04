import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatSankeyComponent } from './psat-sankey.component';

describe('PsatSankeyComponent', () => {
  let component: PsatSankeyComponent;
  let fixture: ComponentFixture<PsatSankeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatSankeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
