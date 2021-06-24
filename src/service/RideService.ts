import { observable, toJS, computed } from "mobx";
import { GeoCollectionReference, GeoFirestore, GeoQuery, GeoQuerySnapshot } from 'geofirestore';
import fetch from 'react-native-cancelable-fetch';
import { Location } from "../components/ModalLocationInput";
const firebase = require('react-native-firebase');
import { Listener } from '../service/Event';
import { loginService } from "../AppRouter";
const REVRSE_GEO_CODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const apiKey = "AIzaSyBingc6-iojmFM1vHcsoooqMMu5OOz7U7U";

export default class RideService {
    @observable
    loading = false;

    @observable
    firstRequest = true;

    @observable
    changes: string

    @observable
    MyCurrentRides = new Array;

    @observable
    Listner: Listener<any>;

    @observable
    MyHistoryRides = new Array;

    Rides = new Array;

    limit: number;

    startPoint;

    endPoint;

    date;

    lastVisible;
    Firestore = firebase.firestore();
    geofirestore: GeoFirestore = new GeoFirestore(this.Firestore);
    geocollection: GeoCollectionReference = this.geofirestore.collection('points');

    calculatePrice = (destination: Location, startPoint: Location, rate: number) => {
        const Y1 = startPoint.longitude;
        const X1 = startPoint.latitude;
        const X2 = destination.latitude;
        const Y2 = destination.longitude;
        const dist = this.distance(X1, Y1, X2, Y2, 'K');
        const price = dist * rate;
        return price.toFixed(0);

    }

    createLocation(locationData: Location, Point: string, city: string) {
        let location;
        if (city == null) {
            location = {
                point: Point,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                address: locationData.address
            }
        } else {
            location = {
                city: city,
                point: Point,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                address: locationData.address
            }
        }
        return location

    }

    fetchCityForLocation(location: Location, point): Promise<void> {
        return fetch(`${REVRSE_GEO_CODE_URL}?key=${apiKey}&latlng=${location.latitude},${location.longitude}&result_type=locality`, null, this)
            .then(res => res.json())
            .then(data => {
                let { results } = data;
                let city = '';
                let finalLocation;
                if (results.length > 0) {
                    let { address_components } = results[0];
                    city = address_components[0].long_name;
                    if (address_components[0].long_name == 'New Delhi') {
                        city = 'Delhi';
                    }
                    finalLocation = this.createLocation(location, point, city);
                } else {
                    city = location.address;
                    const city2 = city.split(',');
                    finalLocation = this.createLocation(location, point, city2[0]);
                }

                return finalLocation;
            });
    }

    addRideDetails = async (
        startPoint: Location,
        destination: Location,
        stopOvers: Array<Location>,
        date: Date,
        time: Date,
        numSeats: number,
        driver: Object,
        price: string,
        driverId: string,
    ) => {
        const Locations = new Array;

        const start = await this.fetchCityForLocation(startPoint, 'START');

        const startCity = start;

        for (let index = 0; index < stopOvers.length; index++) {
            let stop = this.createLocation(stopOvers[index], 'STOP', null);
            Locations.push(stop);
        }

        const end = await this.fetchCityForLocation(destination, 'END');
        Locations.push(end);

        let DateString = date.valueOf();

        var timeString = time.toLocaleString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true });

        console.log(`startCity`, startCity, 'date', date, `length`, Locations.length);

        if (end == null || startCity == null || date == null || Locations.length == 0) {
            return 'Oops! Somthing went wrong';
        }

        // upload data to firestore
        const GeoPoint = new firebase.firestore.GeoPoint(startCity.latitude, startCity.longitude);
        const passengers:Array<string> = [driverId]
        const documentData = {
            startCity: startCity,
            Time: timeString,
            Driver: driver,
            numberOfSeats: numSeats,
            Date: DateString,
            Locations: Locations,
            status: 'OFFERED',
            price: price,
            passengers: passengers,
        }

     await this.geocollection.add({ data: documentData, coordinates: GeoPoint })
     return

    }

    distance(lat1: number, lon1: number, lat2: number, lon2: number, unit: string) {
        var radlat1 = Math.PI * lat1 / 180
        var radlat2 = Math.PI * lat2 / 180
        var theta = lon1 - lon2
        var radtheta = Math.PI * theta / 180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180 / Math.PI
        dist = dist * 60 * 1.1515
        if (unit == "K") { dist = dist * 1.609344 }
        if (unit == "M") { dist = dist * 0.8684 }
        return dist
    }

    matchDestination = (element: any, destination: Location) => {

        const X1 = destination.latitude;
        const Y1 = destination.longitude;

        const Locations = element.data().data.Locations;

        Locations.forEach(el => {
            if (el == null) {
                return;
            } else if (el.longitude == null) {
                return;
            } else if (el.latitude == null) {
                return
            }

            const Y2 = el.longitude;
            const X2 = el.latitude;
            const dist = this.distance(X1, Y1, X2, Y2, 'K');

            // console.log(`dist:`, Math.round(dist), `element`, element, el.city);
            if (Math.round(dist) <= 50) {
                let present = false;
                console.log(`dist:`, Math.round(dist), `element`, element, el.city);
                this.Rides.forEach(elem => {
                    if (element.id == elem.id) {
                        present = true;
                    }
                })
                if (present) {
                    return;
                } else {
                    this.Rides.push(element);
                    present = false;
                }
                if (this.Rides.length > this.limit) {
                    this.Rides.length = this.limit;
                    return;
                }
            }

        });

    }

    async ridesFinder(startPoint: Location, destination: Location, date: Date) {
        this.Rides = [];
        this.limit = 10
        var DateString = date.toDateString();

        const start = await this.fetchCityForLocation(startPoint, 'START');
        this.startPoint = start;

        const end = await this.fetchCityForLocation(destination, 'END');
        this.endPoint = end;

        this.date = DateString;

        if (this.startPoint == null) {
            return;
        }

        const query: GeoQuery = this.geocollection.near({ center: new firebase.firestore.GeoPoint(this.startPoint.latitude, this.startPoint.longitude), radius: 50 });

        return query.get().then((value: GeoQuerySnapshot) => {

            const points = value.docs; // All docs returned by GeoQuery

            points.forEach(el => {
                if (el.data().data.Date == null) {
                    return;
                }
                const date = new Date(el.data().data.Date).toDateString();
                if (date == DateString && el.data().data.numberOfSeats != 0 && el.data().data.status == 'OFFERED') {
                    this.matchDestination(el, this.endPoint);
                }
            })
        }).then(() => {
            // console.log(`rides`,this.Rides.length,JSON.stringify(this.Rides));
            return this.Rides;

        }).catch(err => {
            console.log(`error`, err);
        })

    }

    async paginateRides() {
        this.Rides = [];
        this.limit = 20;

        const DateString = this.date;
        this.limit = this.limit + 10;

        const query: GeoQuery = this.geocollection.near({ center: new firebase.firestore.GeoPoint(this.startPoint.latitude, this.startPoint.longitude), radius: 50 });
        return query.get().then((value: GeoQuerySnapshot) => {

            const points = value.docs; // All docs returned by GeoQuery

            points.forEach(el => {
                const date = new Date(el.data().data.Date).toDateString();
                if (date == DateString) {
                    this.matchDestination(el, this.endPoint);
                }

            })
        }).then(() => {
            // console.log(`rides`,this.Rides.length,JSON.stringify(this.Rides));
            return this.Rides;
        });
    }

    async getMyHistoryRides(limit: number) {
        const rides = new Array;
        await this.geocollection.where('data.passengers','array-contains',loginService.user.uid).where('data.status', '==', 'COMPLETED').limit(limit).get().then(res => {
            res.docs.map((element, index) => {
                const ride = element.data();

                        const data = {
                            item: element,
                            status: ride.data.status,
                        }

                        rides.push(data);

            })
        });
        rides.sort((a, b) => {
            return (a.item.data().data.Date - b.item.data().data.Date)
        })
        this.MyHistoryRides = rides;
    }

    added = (doc: any, rideSorted: Array<object>, expiredRides: Array<string>) => {
        this.changes = 'added';
        console.log('added',doc)
        let date = new Date;
        const ride = doc.data();
        const element = doc;
        const expiryDate = new Date(ride.data.Date + 84600000);
        const passengers = ride.data.passenger;
        let isPassenger = false;
        let passengerStatus = ''
        if (expiryDate < date) {
            expiredRides.push(element.id);
            return
        }

        if (ride.data.Driver.Id == loginService.user.uid) {
        const data = {
            item: element,
            status: ride.data.status
        }
        if (expiryDate > date && ride.data.status == 'OFFERED') {
            rideSorted.push(data);
        }
        }
        if (passengers != undefined) {
            passengers.map(el => {
                if (el.userId == loginService.user.uid) {
                    isPassenger = true
                    passengerStatus = el.status
                    return
                } else {
                    isPassenger = false
                    return
                }
            })
        }
        if (isPassenger) {
            const data = {
                item: element,
                status: passengerStatus,
            }
            if (expiryDate > date && ride.data.status == 'OFFERED') {
                rideSorted.push(data);
            }
        }
    }

    modified = (change: any, uid: string) => {
        console.log('Modified: ', change.doc);
        const modified = change.doc;
        let isPresent;
        let isPassenger: boolean;
        let passengerIndex: number
        let isDriver: boolean = modified.data().data.Driver.Id == uid;
        let rideStatus = modified.data().data.status;
        let passengers = modified.data().data.passenger;

        if (passengers != undefined) {
            passengers.map((element, index) => {
                if (element.userId == uid) {
                    isPassenger = true
                    passengerIndex = index
                    return
                }
                return
            })
            if (isPassenger == undefined) {
                isPassenger = false
            }
        }

        this.MyCurrentRides.forEach((element, index) => {
            if (element.item.id == modified.id) {
                isPresent = true
                return
            }
        })

        if (isPresent == undefined) {
            isPresent = false
        }

        if (rideStatus != 'COMPLETED' && rideStatus !== 'CANCELLED') {

            //TODO check if modified ride is requested by this user and push it in myCurrentRide
            if (isPassenger == true && isPresent == false) {
                this.changes = 'modified'
                let element = passengers[passengerIndex];
                if (element.status == 'REQUESTED') {
                    const data = {
                        item: modified,
                        status: element.status
                    }
                    this.MyCurrentRides.unshift(data);
                }
            }
            //TODO check if driver and update ride
            if (isPassenger == false || isPassenger == undefined && isDriver == true && isPresent == true) {
                this.changes = 'modified'
                this.MyCurrentRides.map((element, index) => {
                    if (element.item.id == modified.id) {
                        element.item = modified
                        element.status = rideStatus
                        return
                    }
                    return
                })
            }

            // //TODO FOR PASSENGER check if ride is present and update ride item and status when accepted, left, removed
            // console.log(`conditions before`,
            // 'ispassenger false expected:-',isPassenger,
            // 'isDriver false expected:-',isDriver,
            // 'isPresent true expected:-',isPresent,
            // 'empty expected:-',passengers);
            //&& passengers[passengerIndex].status == 'CONFIRMED'
            if (isPassenger == true && isDriver == false && isPresent == true) {
                this.changes = 'modified'
                this.MyCurrentRides.map(element => {
                    if (element.item.id == modified.id) {
                        element.item = modified;
                        element.status = passengers[passengerIndex].status
                    }
                })
            }

            //TODO check if ride is present and update ride item and status when rejected
            if (isPresent == true && isPassenger == false && isDriver == false) {
                this.changes = 'modified'
                this.MyCurrentRides.map(element => {
                    if (element.item.id == modified.id) {
                        element.item = modified;
                        element.status = 'REJECTED'
                        console.log(`when rejected passenger`, element);
                    }
                })
            }
        }

        if (rideStatus == 'COMPLETED' || rideStatus == 'CANCELLED') {
            if (isPresent == true) {
                this.changes = 'modified';
                this.MyCurrentRides.forEach((element, index) => {
                    if (element.item.id == modified.id) {
                        this.MyCurrentRides.splice(index, 1);
                        return
                    }
                })
            }
        }
    }

    currentListener(limit: number) {
         let rideSorted = new Array
         let expiredRides = new Array;
        const Listener = this.geocollection.where('data.passengers', 'array-contains', loginService.user.uid).limit(limit).onSnapshot(querySnapshot => {
            querySnapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                     this.added(change.doc,rideSorted,expiredRides);
                }
                if (change.type === 'modified') {
                    this.modified(change, loginService.user.uid)
                }
            })

            if (this.changes == 'added') {
                rideSorted.sort((a, b) => {
                    return (a.item.data().data.Date - b.item.data().data.Date)
                })
                this.MyCurrentRides = rideSorted;
                this.markRidesComplete(expiredRides);
            }
        }, error => console.log('listener', error));
        return Listener;

    }

    markRidesComplete(rides: Array<string>) {
        rides.forEach(async ID => {
            await this.geocollection.doc(ID).set({
                data: {
                    status: 'COMPLETED'
                }
            }, { merge: true });
        })
    }

}
