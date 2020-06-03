import { Injectable } from '@angular/core';
import axios from 'axios';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { MainService } from '../lib/service/main.service';

@Injectable()
export class OrderService {
	// Section Customer
	// =========================== //
	private urlCustomer: string = this.mainService['hostCostumer'] + '/customer';
	private urlGetCostCenter = this.mainService['hostOrg'] + '/organization/cost-center/customer-id/';

	// Order
	// =========================== //
	private urlFuel: string = this.mainService['hostOrder'] + '/order/fuel';
	private urlTollParking: string = this.mainService['hostOrder'] + '/order/toll-and-parking';
	private urlDriverRider: string = this.mainService['hostOrder'] + '/order/driver-or-rider/';
	private urlDriverSpesification: string = this.mainService['hostOrder'] + '/order/driver-specification';
	private urlVehicleType: string = this.mainService['hostOrder'] + '/order/vehicle-type?customerId=';
	private urlVehicleTypeByEligibility: string =
		this.mainService['hostOrder'] + '/order/vehicle-type/by-configuration?UserProfileId=';
	private urlGetPoolId: String = this.mainService['hostOrg'] + '/organization/config-organization/';
	private urlDuration: string = this.mainService['hostOrder'] + '/order/rental-duration?customerId=';
	private urlServiceType: string = this.mainService['hostOrder'] + '/order/service-type/';
	private urlChanelType: string = this.mainService['hostOrder'] + '/order/channel';
	private urlGetContract: string = this.mainService['hostOrder'] + '/order/get-contract-by-additional?customerId=';
	private urlGetPackage: string = this.mainService['hostOrder'] + '/order/package?customerId=';
	private urlGetCityCoverage: string = this.mainService['hostCon'] + '/configuration/city-coverage/detail-by-customer/';
	private urlGetMaxOrderTime: string =
		this.mainService['hostPrice'] + '/price/configuration-price-adjustment-detail/city/';
	private urlSaveReservation: string = this.mainService['hostOrder'] + '/order/reservation/save';
	private urlGetAdditional: string = this.mainService['hostPrice'] + '/price/configuration-price-product';

	private urlGetDetailOrderHistory: string = this.mainService['hostOrder'] + '/order/reservation/detail/';
	private urlGetOrderHistory: string = this.mainService['hostOrder'] + '/order/reservation/get-history';
	private urlCancelReservation: string = this.mainService['hostOrder'] + '/order/reservation/cancelReservation';
	private urlCancelOrder: string = this.mainService['hostOrder'] + '/order/reservation/cancelBookingOrder';
	private urlGetCancelReaseon: string = this.mainService['hostOrder'] + '/order/cancellationReason';
	private urlSaveExtend: string = this.mainService['hostOrder'] + '/order/reservation-extend/save';

	// PRICE OLC
	// =========================== //
	private urlGetHolidayDate: string = this.mainService['hostOrder'] + '/order/holiday-calendar/getByDate?date=';
	private urlGetPrice: string = this.mainService['hostPrice'] + '/price/configuration-price-adjustment-detail/';

	// User Profile
	private urlGetDetailUser: string = this.mainService['host'] + '/authorization/user-profile/';

	constructor(private http: Http, private mainService: MainService) {}

	// Get Detail User
	// ======================== //
	getDetailUser(id): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetDetailUser + id, options)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}

	// Get Price OLC Weekday
	// ======================== //
	getOrderHolidayDate(date: any): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetHolidayDate + date, options)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}
	getPriceWeekDay(cityId, customerId) {
		if (this.mainService['dataUser'] != null) {
			let dataUser = JSON.parse(this.mainService['dataUser']);
			let headers = new Headers({
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this.mainService['token']
			});
			let options = new RequestOptions({ headers: headers });
			return this.http
				.get(
					this.urlGetPrice +
						'city/' +
						cityId +
						'/customer/' +
						customerId +
						'?BusinessUnitId=' +
						dataUser.UserCompanyMapping[0].BusinessUnitId,
					options
				)
				.timeout(this.mainService['timeOut'])
				.map((res: Response) => res.json());
		}
	}

	// ============================================================================== //
	// Order
	// ============================================================================== //
	// postReservation(body: any) {
	// 	let headers = new Headers({
	// 		'Content-Type': 'application/json',
	// 		Authorization: 'Bearer ' + this.mainService['token']
	// 	});
	// 	let options = new RequestOptions({ headers: headers });
	// 	return this.http.post(this.urlSaveReservation, JSON.stringify(body), options).map((res: Response) => res.json());
	// }
	public async postReservation(body: any) {
		const config = {
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this.mainService['token']
			}
		};
		try {
			let axiosResponse = await axios.post(this.urlSaveReservation, JSON.stringify(body), config);
			return axiosResponse.data;
		} catch (error) {
			return error;
		}
	}
	// ============================================================================== //
	// Post Extend
	// ============================================================================== //
	postExtend(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlSaveExtend, JSON.stringify(body), options).map((res: Response) => res.json());
	}

	// Order History
	// ======================== //
	getOrderHistory(param: any): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlGetOrderHistory + param, options).map((res: Response) => res.json());
	}

	getOrderHistoryDetail(id: String): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetDetailOrderHistory + id, options)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}
	getAdditional(
		cityId,
		customerId,
		duration,
		vehicleType,
		serviceTypeId,
		fuelId,
		tollParkingId,
		driverRiderId,
		channelTypeId,
		BusinessUnitId
	) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(
				this.urlGetAdditional +
					'/city/' +
					cityId +
					'/customer/' +
					customerId +
					'/duration/' +
					duration +
					'/vehicle-type/' +
					vehicleType +
					'/service-type/' +
					serviceTypeId +
					'/fuel/' +
					fuelId +
					'/toll-parking/' +
					tollParkingId +
					'/driver-rider/' +
					driverRiderId +
					'/channel-type/' +
					channelTypeId +
					'?BusinessUnitId=' +
					BusinessUnitId,
				options
			)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}
	getOrderCancelReason(id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetCancelReaseon + '?BusinessUnitId=' + id, options)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}
	putCancelReservation(body: any): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.put(this.urlCancelReservation + '?CancelBy=1', JSON.stringify(body), options)
			.map((res: Response) => res.json());
	}
	putCancelOrder(body: any): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.put(this.urlCancelOrder + '?CancelBy=1', JSON.stringify(body), options)
			.map((res: Response) => res.json());
	}

	// Order Fetch Att
	// ======================== //
	getServiceType(BusinessUnitId): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlServiceType + BusinessUnitId, options)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}
	getMaxOrderTime(CityId, CustomerId): Observable<any> {
		if (this.mainService['dataUser'] != null) {
			let dataUser = JSON.parse(this.mainService['dataUser']);
			let headers = new Headers({
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this.mainService['token']
			});
			let options = new RequestOptions({ headers: headers });
			return this.http
				.get(
					this.urlGetMaxOrderTime +
						CityId +
						'/customer/' +
						CustomerId +
						'?BusinessUnitId=' +
						dataUser.UserCompanyMapping[0].BusinessUnitId,
					options
				)
				.timeout(this.mainService['timeOut'])
				.map((res: Response) => res.json());
		}
	}
	getContract(
		CustomerId,
		BusinessUnitId,
		StartDate,
		EndDate,
		VehicleTypeId,
		isWithDriver,
		MaterialId,
		BranchId,
		FuelSAPCode,
		TollandParkingSAPCode,
		DriverorRiderSAPCode,
		ChannelTypeSAPCode,
		CrewSAPCode,
		CoverageAreaSAPCode,
		serviceTypeId,
		cityId,
		Trip,
		Olc,
		listDates
	): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(
				this.urlGetContract +
					CustomerId +
					'&businessUnitID=' +
					BusinessUnitId +
					'&startDate=' +
					StartDate +
					'&endDate=' +
					EndDate +
					'&vehicleTypeId=' +
					VehicleTypeId +
					'&isWithDriver=' +
					isWithDriver +
					'&materialId=' +
					MaterialId +
					'&branchId=' +
					BranchId +
					'&fuel=' +
					FuelSAPCode +
					'&tollandParking=' +
					TollandParkingSAPCode +
					'&driverorRider=' +
					DriverorRiderSAPCode +
					'&channelType=' +
					ChannelTypeSAPCode +
					'&crew=' +
					CrewSAPCode +
					'&coverageArea=' +
					CoverageAreaSAPCode +
					'&serviceTypeId=' +
					serviceTypeId +
					'&cityId=' +
					cityId +
					'&Trip=' +
					Trip +
					'&Olc=' +
					Olc +
					'&dates=' +
					listDates,
				options
			)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}
	getPackage(
		CustomerId,
		BusinessUnitId,
		startDate,
		endDate,
		vehicleTypeId,
		isWithDriver,
		MaterialId,
		BranchId
	): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(
				this.urlGetPackage +
					CustomerId +
					'&businessUnitID=' +
					BusinessUnitId +
					'&startDate=' +
					startDate +
					'&endDate=' +
					endDate +
					'&vehicleTypeId=' +
					vehicleTypeId +
					'&isWithDriver=' +
					isWithDriver +
					'&materialId=' +
					MaterialId +
					'&branchId=' +
					BranchId,
				options
			)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}

	// Vehicle Type
	// ======================== //
	getVehicleType(CustomerId, BusinessUnitId, StartDate, EndDate): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(
				this.urlVehicleType +
					CustomerId +
					'&businessUnitID=' +
					BusinessUnitId +
					'&startDate=' +
					StartDate +
					'&endDate=' +
					EndDate,
				options
			)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}
	getVehicleByEligibility(UserProfileId, StartDate, EndDate): Observable<any> {
		if (this.mainService['dataUser'] != null) {
			let dataUser = JSON.parse(this.mainService['dataUser']);
			let headers = new Headers({
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this.mainService['token']
			});
			let options = new RequestOptions({ headers: headers });
			return this.http
				.get(
					this.urlVehicleTypeByEligibility +
						UserProfileId +
						'&StartDate=' +
						StartDate +
						'&EndDate=' +
						EndDate +
						'&BusinessUnitId=' +
						dataUser.UserCompanyMapping[0].BusinessUnitId,
					options
				)
				.timeout(this.mainService['timeOut'])
				.map((res: Response) => res.json());
		}
	}

	getPoolId(organizationId: any) {
		if (this.mainService['dataUser'] != null) {
			let dataUser = JSON.parse(this.mainService['dataUser']);
			let headers = new Headers({
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this.mainService['token']
			});
			let options = new RequestOptions({ headers: headers });
			return this.http
				.get(
					this.urlGetPoolId + organizationId + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId,
					options
				)
				.timeout(this.mainService['timeOut'])
				.map((res: Response) => res.json());
		}
	}
	// Duration
	// ======================== //
	getDuration(
		CustomerId,
		BusinessUnitId,
		StartDate,
		EndDate,
		VehicleTypeId,
		ServiceTypeId,
		isWithDriver
	): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(
				this.urlDuration +
					CustomerId +
					'&businessUnitID=' +
					BusinessUnitId +
					'&startDate=' +
					StartDate +
					'&endDate=' +
					EndDate +
					'&vehicleTypeId=' +
					VehicleTypeId +
					'&serviceTypeId=' +
					ServiceTypeId +
					'&isWithDriver=' +
					isWithDriver,
				options
			)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}

	// Fuel
	// ======================== //
	getFuel(): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlFuel, options)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}

	// Chanel
	// ======================== //
	getChanel(): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlChanelType, options)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}

	// Toll Parking
	// ======================== //
	getTollParking(): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlTollParking, options)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}

	// Driver
	// ======================== //
	getDriverRider(id: String): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlDriverRider + id, options)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}

	// Driver Spesification
	// ======================== //
	getDriverSpesification(): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlDriverSpesification, options)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}

	// ============================================================================== //
	// Reservator
	// ============================================================================== //

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
			return this.http
				.get(this.urlCustomer + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId, options)
				.timeout(this.mainService['timeOut'])
				.map((res: Response) => res.json());
		}
	}
	// Cost Center
	// ======================== //
	getCostCenter(id: String) {
		if (this.mainService['dataUser'] != null) {
			let dataUser = JSON.parse(this.mainService['dataUser']);

			let headers = new Headers({
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this.mainService['token']
			});
			let options = new RequestOptions({ headers: headers });
			return this.http
				.get(this.urlGetCostCenter + id + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId, options)
				.timeout(this.mainService['timeOut'])
				.map((res: Response) => res.json());
		}
	}

	// Get City Coverage
	// ======================== //
	getCityCoverage(id: String): Observable<any> {
		if (this.mainService['dataUser'] != null) {
			let dataUser = JSON.parse(this.mainService['dataUser']);
			let headers = new Headers({
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this.mainService['token']
			});
			let options = new RequestOptions({ headers: headers });
			return this.http
				.get(this.urlGetCityCoverage + id + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId, options)
				.timeout(this.mainService['timeOut'])
				.map((res: Response) => res.json());
		}
	}
}
