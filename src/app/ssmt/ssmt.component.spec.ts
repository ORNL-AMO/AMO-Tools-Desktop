import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtComponent } from './ssmt.component';

describe('SsmtComponent', () => {
  let component: SsmtComponent;
  let fixture: ComponentFixture<SsmtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
