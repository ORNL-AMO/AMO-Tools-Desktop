import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YAxisDataComponent } from './y-axis-data.component';

describe('YAxisDataComponent', () => {
  let component: YAxisDataComponent;
  let fixture: ComponentFixture<YAxisDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YAxisDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YAxisDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
