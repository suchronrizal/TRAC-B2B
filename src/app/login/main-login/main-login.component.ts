import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, NavigationStart, Params } from '@angular/router';

// Service
import { MainService } from '../../lib/service/main.service';

@Component({
  selector: 'app-main-login',
  templateUrl: './main-login.component.html',
  styleUrls: ['./main-login.component.scss']
})
export class MainLoginComponent implements OnInit {
    public loadingPage: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private mainService: MainService
    ){}

    ngOnInit() {
        this.mainService.updateLocalStorage();
        if(this.route.children[0].url['value'][0].path != "confirmation"){
            if(this.mainService['token'] != null){
                this.activeRoute.queryParams.subscribe((params: Params) => {
                    if(params['code'] == undefined){
                        this.router.navigate(['/p/']);  
                    }else{
                        localStorage.removeItem("token");
                        localStorage.removeItem("dataUser");
                        this.mainService.updateLocalStorage();
                    }
                });		
            }
        }

        // if(this.mainService['token'] != null){
        //     this.router.navigate(['/p/']);  
        // }

        this.router.events.subscribe((event) => {
            if(event instanceof NavigationStart){
                this.loadingPage = true;
            }

            if(event instanceof NavigationEnd){
                setTimeout(()=>{
                    this.loadingPage = false;
                }, 500);
            }
        });
    }

}
