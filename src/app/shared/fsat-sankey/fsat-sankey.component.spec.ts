import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatSankeyComponent } from './fsat-sankey.component';

describe('FsatSankeyComponent', () => {
  let component: FsatSankeyComponent;
  let fixture: ComponentFixture<FsatSankeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatSankeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
