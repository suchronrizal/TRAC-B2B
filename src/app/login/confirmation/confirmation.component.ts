import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as _ from "lodash";

// Service
import { LoginService } from '../login.service';
import { MainService } from '../../lib/service/main.service';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
	private isLoged: boolean = false;
	public loading: boolean = true;
	public failed: boolean = false;
	private message = null;
	private title = null;

	constructor(
		private loginService: LoginService,
		private mainService: MainService,
		private activeRoute: ActivatedRoute,
		private router: Router,
	){}

	ngOnInit() {
		// subscribe to router event
		this.activeRoute.queryParams.subscribe((params: Params) => {
			let dataUser = JSON.parse(this.mainService['dataUser']);
			if(!_.isEmpty(params)){
				this.loginService.getApproval(params.ReservationId,params.Email,params.ApprovalStatus).subscribe(res =>{
					this.loading = false;

					switch(params.ApprovalStatus){
						case "1" : 
							this.message = "Success approved"; 
							this.title = "Order has been approved!";
						break;
						case "2" : 
							this.message = "Success rejected"; 
							this.title = "Order has been rejected!";
						break;
					}

					if(dataUser != null){
						if(dataUser.EmailCorp == params.Email){
							this.isLoged = true;
						}
					}
				}, err =>{
					this.loading = false;
					this.failed = true;
					this.message = null;
					if(dataUser != null){
						if(dataUser.EmailCorp == params.Email){
							this.isLoged = true;
						}
					}
				});
			}
		});	
	}
}
