import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MenuItem } from 'primeng/primeng';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { store } from '../../lib/service/reducer.service';

// Service
import { LayoutService } from '../layout.service';
import { MainService } from '../../lib/service/main.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private originMenu = [];
  private menurRole = [];

  @Output() loadMenu = new EventEmitter();

  constructor(
    private router: Router,
    private mainService: MainService,
    private layoutService: LayoutService
  ) {}

  public items: MenuItem[];

  ngOnInit() {
    if (this.mainService['dataUser'] != null) {
      let dataUser = JSON.parse(this.mainService['dataUser']);
      this.menurRole = _.filter(dataUser.MenuRoles, { IsRead: '1' });
      this.initMenu();
    }
  }

  // Initial Menu
  initMenu() {
    this.originMenu = [];
    let menus = [];
    let allMenu = [];
    this.layoutService.getMenu().subscribe(
      res => {
        this.originMenu = res.Data;
        _.map(res.Data, x => {
          let obj = {
            label: x.MenuName,
            routerLink: x.MenuLink,
            icon: x.MenuIcon,
            queryParams: { id: x.Id },
            items: []
          };
          let findActiveMenu = _.find(this.menurRole, { MenuId: x.Id }); // mapping original menu dengan menu yg ada di dataUser localstorage
          if (findActiveMenu != undefined) {
            if (x.MenuParent == null) {
              menus.push(obj);
              allMenu.push({ link: obj.routerLink });
            } else if (x.MenuParent != null) {
              let findObj = _.find(menus, n => {
                return n.queryParams.id == x.MenuParent;
              });
              delete obj.icon;
              delete obj.queryParams;
              delete obj.items;
              if (findObj != undefined) {
                allMenu.push({ link: obj.routerLink });
                obj.routerLink =
                  _.kebabCase(findObj.label) + '/' + obj.routerLink;
                findObj.items.push(obj);
              }
            }
          }
        });

        _.map(menus, x => {
          if (x.items.length == 0) {
            delete x.items;
          } else {
            delete x.routerLink;
          }
          delete x.queryParams;
        });
        this.items = menus;
        store.dispatch({
          type: 'SET_MENU',
          value: allMenu
        });

        var segment_array = this.router.url.split('/');
        var last_segment = segment_array.pop();
        let reserVationLink = _.includes(segment_array, 'reservation');
        let find = _.find(this.mainService['activeMenu'], {
          link: last_segment
        });
        if (!reserVationLink) {
          if (find == undefined) {
            this.router.navigate(['/404']);
          }
        }
        this.loadMenu.emit();
      },
      err => {
        if (err.status == 401) {
          this.mainService.updateToken(() => {
            this.initMenu();
          });
        }

        if (err.name == 'TimeoutError') {
          this.initMenu();
        }
      }
    );
  }
}
