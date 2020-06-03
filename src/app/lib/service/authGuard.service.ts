import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MainService } from '../../lib/service/main.service';
import * as _ from 'lodash';

@Injectable()
export class authGuard implements CanActivate {
    constructor(
        private router: Router,
        private mainService: MainService
    ){}

    canActivate() {
        setTimeout(()=>{
            var segment_array = this.router.url.split( '/' );
            var last_segment = segment_array.pop();
            if(this.mainService['activeMenu'].length){
                let find = _.find(this.mainService['activeMenu'],{link:last_segment});
                if(find == undefined){
                    this.router.navigate(['/404']);
                }
            }      
        }, 500);
        return true;
    }
}