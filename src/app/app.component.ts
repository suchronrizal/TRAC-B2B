import { Component, OnInit } from '@angular/core';
import { MainService } from './lib/service/main.service';
import { store } from './lib/service/reducer.service';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
  providers: [MainService]
})
export class AppComponent implements OnInit {
  public title = 'app';
  ngOnInit() {
    if (this.mainService['dataUser']) {
      store.dispatch({ type: 'SET_LOGIN' });
    } else {
      store.dispatch({ type: 'SET_LOGOUT' });
    }
  }

  constructor(private mainService: MainService) {}

  checkToken() {
    this.mainService.checkToken().subscribe(
      res => {},
      err => {
        if (err.status == 401) {
          this.mainService.updateToken(() => {
            this.checkToken();
          });
        }
      }
    );
  }
}
