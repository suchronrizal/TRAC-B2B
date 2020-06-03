import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainOrderComponent } from './main-order.component';

describe('MainOrderComponent', () => {
  let component: MainOrderComponent;
  let fixture: ComponentFixture<MainOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
