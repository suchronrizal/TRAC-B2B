import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { MainService } from '../lib/service/main.service';

@Injectable()
export class LoginService {
	private urlLogin: string = this.mainService['host'] + '/authorization/login/';
	private urlForgotPass: string = this.mainService['host'] + '/authorization/forget-password/';
	private urlNewPass: string = this.mainService['host'] + '/authorization/update-password';
	private urlApproval: string = this.mainService['hostOrder'] + '/order/approval-reservation/confirmation?ReservationId=';

	constructor(
		private http:Http,
		private mainService: MainService
	){}

	// ============================================================================== //
	// Post Login
	// ============================================================================== //
    	postLogin(body){
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlLogin, JSON.stringify(body), options).map((res:Response) => res.json());
	}
	
	// ============================================================================== //
	// Forgot Password
	// ============================================================================== //
	postForgotPass(body){
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlForgotPass, JSON.stringify(body), options).map((res:Response) => res.json());
	}

	// ============================================================================== //
	// New Password
	// ============================================================================== //
	postNewPass(body){
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlNewPass, JSON.stringify(body), options).map((res:Response) => res.json());
	}

	// ============================================================================== //
	// Get Approval
	// ============================================================================== //
	getApproval(ReservationId,Email,ApprovalStatus){
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlApproval + ReservationId + '&Email='+ Email +'&ApprovalStatus=' + ApprovalStatus, options).map((res:Response) => res.json());
	}
}
