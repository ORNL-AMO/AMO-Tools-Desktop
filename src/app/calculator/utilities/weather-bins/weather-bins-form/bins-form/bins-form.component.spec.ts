import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BinsFormComponent } from './bins-form.component';

describe('BinsFormComponent', () => {
  let component: BinsFormComponent;
  let fixture: ComponentFixture<BinsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BinsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BinsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
