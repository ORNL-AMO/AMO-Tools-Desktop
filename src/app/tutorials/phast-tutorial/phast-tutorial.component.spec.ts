import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastTutorialComponent } from './phast-tutorial.component';

describe('PhastTutorialComponent', () => {
  let component: PhastTutorialComponent;
  let fixture: ComponentFixture<PhastTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
