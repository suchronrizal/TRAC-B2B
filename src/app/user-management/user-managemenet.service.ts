import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import * as _ from 'lodash';

import { MainService } from '../lib/service/main.service';
import { UserAccount } from './user-account/user-account';

@Injectable()
export class UserManagemenetService {
	private businessUnitId = '0104';

	// ============================================================================== //
	// Properties
	// ============================================================================== //
	// URL Account Profile
	private urlProfile = this.mainService['host'] + '/authorization/user-profile/all';
	private urlProfileAllPagination = this.mainService['host'] + '/authorization/user-profile/all-list';
	private urlProfileAll = this.mainService['host'] + '/authorization/user-profile/all';
	private urlProfileCustomer = this.mainService['host'] + '/authorization/user-profile/customer/';
	private urlAutoCompleteProfile = this.mainService['host'] + '/authorization/user-profile/auto-complete/';
	private urlProfileCustomerPaginate = this.mainService['host'] + '/authorization/user-profile/user-customer-list/';
	private urlPostProfile = this.mainService['host'] + '/authorization/user-profile/save/';
	private urlUpdateProfile = this.mainService['host'] + '/authorization/user-profile/update/';
	private urlDeleteProfile = this.mainService['host'] + '/authorization/user-profile/delete/';
	private urlMultiDeleteProfile = this.mainService['host'] + '/authorization/user-profile/delete';
	private urlActivate = this.mainService['host'] + '/authorization/user-profile/change-status/';
	private urlPostCsv = this.mainService['host'] + '/authorization/customer-upload';
	private urlCustomer: string = this.mainService['hostCostumer'] + '/customer';
	private urlCompanyName: string = 'https://fms-om-dev.azurewebsites.net/api/omni/Company';
	private urlBusinessUnit: string = 'https://fms-om-dev.azurewebsites.net/api/omni/BusinessUnit/';

	// URL Role
	private urlRole = this.mainService['host'] + '/authorization/role/';
	private urlPostRole = this.mainService['host'] + '/authorization/role/save/';

	// URL Menu Role
	private urlPostMenuRole = this.mainService['host'] + '/authorization/menu-role/save/';
	private urlUpdateMenuRole = this.mainService['host'] + '/authorization/menu-role/update/';
	private urlDeleteMenuRole = this.mainService['host'] + '/authorization/menu-role/delete/';
	private urlMenuRole = this.mainService['host'] + '/authorization/menu-role/role/';

	// Organization
	private urlOrganization = this.mainService['hostOrg'] + '/organization/organization-structure/customer/';
	private urlOrgName: string = this.mainService['hostOrg'] + '/organization/config-organization/id/customer/';
	private urlOrgNamePerRow: string = this.mainService['hostOrg'] + '/organization/config-organization/';
	private urlGetOrgStructure = this.mainService['hostOrg'] + '/organization/view-tree/';

	// Eligibility Detail
	private urlDetailEligibility = this.mainService['hostCon'] + '/configuration/eligibility/detail-by-customer/';

	//Budget
	private urlBudgetMultiCostCenter =
		this.mainService['hostBilling'] + '/billing/configuration-payment-scheme/multiple-costcenter/';

	constructor(private http: Http, private mainService: MainService) {
		this.mainService.updateLocalStorage();
	}

	// ============================================================================== //
	// CRUD Profile
	// ============================================================================== //
	getAccount(page) {
		if (this.mainService['dataUser'] != null) {
			let dataUser = JSON.parse(this.mainService['dataUser']);
			let headers = new Headers({
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this.mainService['token']
			});
			let options = new RequestOptions({ headers: headers });
			let indicatorId = dataUser.UserIndicator[0].RoleIndicatorId,
				paramUrl;

			switch (indicatorId) {
				case 'MRI001':
				case 'MRI002':
					paramUrl = this.urlProfile + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId;
					break;
				case 'MRI003':
				case 'MRI004':
					paramUrl =
						this.urlProfileCustomer +
						dataUser.UserProfileB2B[0].CustomerId +
						'?BusinessUnitId=' +
						dataUser.UserCompanyMapping[0].BusinessUnitId;
					break;
			}
			return this.http.get(paramUrl + '&page=' + page, options).map((res: Response) => res.json());
		}
	}
	//yang dipake buat user-account yg didepan
	getAccountUser(urlPagination) {
		if (this.mainService['dataUser'] != null) {
			let dataUser = JSON.parse(this.mainService['dataUser']);
			let headers = new Headers({
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this.mainService['token']
			});
			let options = new RequestOptions({ headers: headers });
			let indicatorId = dataUser.UserIndicator[0].RoleIndicatorId,
				paramUrl;

			switch (indicatorId) {
				case 'MRI001':
				case 'MRI002':
					paramUrl = this.urlProfileAllPagination + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId;
					break;
				case 'MRI003':
				case 'MRI004':
					paramUrl =
						this.urlProfileCustomerPaginate +
						dataUser.UserProfileB2B[0].CustomerId +
						'?BusinessUnitId=' +
						dataUser.UserCompanyMapping[0].BusinessUnitId;
					break;
			}
			return this.http.get(paramUrl + '&' + urlPagination, options).map((res: Response) => res.json());
		}
	}
	getAccountAll() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlProfileAll, options).map((res: Response) => res.json());
	}

	//end point baru 28-april-20
	getAccountByCustomerPaginate(url, customerId: String) {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(
				this.urlProfileCustomerPaginate +
					customerId +
					'?BusinessUnitId=' +
					dataUser.UserCompanyMapping[0].BusinessUnitId +
					url,
				options
			)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}
	//yang dipake buat user-account yg dibelakang
	getAccountByCustomer(id: String) {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlProfileCustomer + id + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId, options)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}
	//urlAutoCompleteProfile
	getAccountByCustomerAutocomplete(id: String, keywords: String) {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(
				this.urlAutoCompleteProfile + id + '/' + dataUser.UserCompanyMapping[0].BusinessUnitId + '?Search=' + keywords,
				options
			)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}
	postAccount(body: UserAccount): Observable<UserAccount> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlPostProfile, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	updateAccount(id: String, body: UserAccount) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.put(this.urlUpdateProfile + id, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	postCSVAccount(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlPostCsv, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	deleteAccount(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.delete(this.urlDeleteProfile + id, options).map((res: Response) => res.json());
	}
	multiDeleteAccount(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlMultiDeleteProfile, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	putActivate(status: any, id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.put(this.urlActivate + id, JSON.stringify({ activeStatus: status }), options)
			.map((res: Response) => res.json());
	}

	// ============================================================================== //
	// Role
	// ============================================================================== //
	getRole() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlRole, options).map((res: Response) => res.json());
	}
	postRole(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlPostRole, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	postMenuRole(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlPostMenuRole, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	updateMenuRole(body: any, id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.put(this.urlUpdateMenuRole + id, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	getMenuRole(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlMenuRole + id, options).map((res: Response) => res.json());
	}
	deleteMenuRole(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.delete(this.urlDeleteMenuRole + id, options).map((res: Response) => res.json());
	}

	// ============================================================================== //
	// Get Organization
	// ============================================================================== //
	getOrganization(id: String) {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlOrganization + id + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId, options)
			.map((res: Response) => res.json());
	}
	getOrganizationName(CustomerId: String, OrganizationId: String) {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(
				this.urlOrgName +
					CustomerId +
					'/organization/' +
					OrganizationId +
					'?BusinessUnitId=' +
					dataUser.UserCompanyMapping[0].BusinessUnitId,
				options
			)
			.map((res: Response) => res.json());
	}

	getOrganizationNamePerRow(OrganizationId: String) {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(
				this.urlOrgNamePerRow + OrganizationId + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId,
				options
			)
			.map((res: Response) => res.json());
	}

	getOrgStructureTree(id: String): Observable<any> {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetOrgStructure + id + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId, options)
			.map((res: Response) => res.json());
	}

	// Customer
	// ======================== //
	getCustomer(): Observable<any> {
		if (this.mainService['dataUser'] != null) {
			let dataUser = JSON.parse(this.mainService['dataUser']);
			let headers = new Headers({
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this.mainService['token']
			});
			let options = new RequestOptions({ headers: headers });
			let indicatorId = dataUser.UserIndicator[0].RoleIndicatorId,
				paramUrl;

			switch (indicatorId) {
				case 'MRI001':
				case 'MRI002':
					paramUrl = this.urlCustomer + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId;
					break;
				case 'MRI003':
				case 'MRI004':
					paramUrl =
						this.urlCustomer +
						'/detail/' +
						dataUser.UserProfileB2B[0].CustomerId +
						'?BusinessUnitId=' +
						dataUser.UserCompanyMapping[0].BusinessUnitId;
					break;
			}
			return this.http.get(paramUrl, options).map((res: Response) => res.json());
		}
	}

	// Get Company Name
	// ======================== //
	getCompanyName() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlCompanyName, options).map((res: Response) => res.json());
	}

	// Get Business Unit
	// ======================== //
	getBusinessUnit(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlBusinessUnit + id, options).map((res: Response) => res.json());
	}

	// Eligibility Detail
	getDetailELigibility(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlDetailEligibility + id, options).map((res: Response) => res.json());
	}

	getBudgetSingle(CustomerId, CostCenterId) {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.post(
				this.urlBudgetMultiCostCenter + CustomerId + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId,
				JSON.stringify(CostCenterId),
				options
			)
			.map((res: Response) => res.json());
	}
}
