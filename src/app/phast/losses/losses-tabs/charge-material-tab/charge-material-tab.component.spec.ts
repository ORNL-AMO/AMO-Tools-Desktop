import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeMaterialTabComponent } from './charge-material-tab.component';

describe('ChargeMaterialTabComponent', () => {
  let component: ChargeMaterialTabComponent;
  let fixture: ComponentFixture<ChargeMaterialTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChargeMaterialTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargeMaterialTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
