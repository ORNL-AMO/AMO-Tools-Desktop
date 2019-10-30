import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtTutorialComponent } from './ssmt-tutorial.component';

describe('SsmtTutorialComponent', () => {
  let component: SsmtTutorialComponent;
  let fixture: ComponentFixture<SsmtTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
