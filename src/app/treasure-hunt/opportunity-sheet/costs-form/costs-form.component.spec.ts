import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CostsFormComponent } from './costs-form.component';

describe('CostsFormComponent', () => {
  let component: CostsFormComponent;
  let fixture: ComponentFixture<CostsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CostsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CostsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
