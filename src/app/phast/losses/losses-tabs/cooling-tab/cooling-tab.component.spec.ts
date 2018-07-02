import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingTabComponent } from './cooling-tab.component';

describe('CoolingTabComponent', () => {
  let component: CoolingTabComponent;
  let fixture: ComponentFixture<CoolingTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoolingTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
