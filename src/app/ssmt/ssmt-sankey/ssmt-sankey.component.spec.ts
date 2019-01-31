import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtSankeyComponent } from './ssmt-sankey.component';

describe('SsmtSankeyComponent', () => {
  let component: SsmtSankeyComponent;
  let fixture: ComponentFixture<SsmtSankeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtSankeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
