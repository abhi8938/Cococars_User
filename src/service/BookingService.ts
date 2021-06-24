import { GeoCollectionReference, GeoFirestore, GeoQuery, GeoQuerySnapshot } from 'geofirestore';
const firebase = require('react-native-firebase');

export default class BookingService {

    Firestore = firebase.firestore();
    geofirestore: GeoFirestore = new GeoFirestore(this.Firestore);
    geocollection: GeoCollectionReference = this.geofirestore.collection('points');

    getUserInfo = async (
        userId: string
    ) => {
        var snapshot = await firebase.firestore().collection('userx').doc(userId).get();
        var value = snapshot.data();
        return value;
    }
    getNotificationData = async (rideId:string, status:string, Id?: string, passenger?: Array<object>) => {
        if (Id !== undefined && passenger === undefined) {
            const driverData = await firebase.firestore().collection('userx').doc(Id).get();
            const notificationToken = driverData.data().NotificationToken;
            const data = {
                token: notificationToken,
                rideData: {
                    rideId:rideId,
                    status:status
                }
            }
            return data
        }
        if (Id === undefined && passenger !== undefined) {
            let Tokens = new Array;
            await Promise.all(passenger.map(async user => {
                if (user.status == 'CONFIRMED' || user.status == 'REQUESTED') {
                    const userData = await firebase.firestore().collection('userx').doc(user.userId).get();
                    Promise.resolve(userData)
                    const notificationToken = userData.data().NotificationToken;
                    Tokens.push(notificationToken)
                    return
                }
            }))
            const data = {
                token: Tokens,
                rideData: {
                    rideId:rideId,
                    status:status
                }
            }
            return data
        }
    }

    getRide = async (rideId: string) => {
        const ride = await this.geocollection.doc(rideId).get();
        return ride
    }

    sendRequest = async (
        rideId: string,
        Price: number,
        userId: string,
        profilePic: string,
        userName: string) => {

        //Find ride with ride id in firestore
        const ride = await this.getRide(rideId);
        const numOfSeats = ride.data().data.numberOfSeats;
        if (numOfSeats == 0) {
            return 'Seats Full';
        }

        //Check if already requested 
        let ridePassengers = new Array;
        let passengerIds = new Array;
        passengerIds = ride.data().data.passengers;
        let alreadyThere = false;
        if (ride.data().data.passenger !== undefined) {
            ridePassengers = ride.data().data.passenger;
            ridePassengers.map(el => {
                if (el.userId == userId) {
                    alreadyThere = true;
                    return
                } else {
                    alreadyThere = false
                    return
                }
            })

            if (alreadyThere) {
                return 'Rider already present'
            }
        }

        
        //if not present push the passsenger object in ridepassengers
        const passenger = {
            userId: userId,
            status: 'REQUESTED',
            price: Price,
            profilePic: profilePic,
            name: userName
        }
        ridePassengers.push(passenger);
        passengerIds.push(userId);

        //Add passenger object with userId, username to ride document with status 'requested'
        await this.geocollection.doc(rideId).set({
            data: {
                passenger: ridePassengers,
                passengers: passengerIds
            }
        }, { merge: true })
        //Get notificationToken from driver document with driverId
        const data = await this.getNotificationData(rideId,'OFFERED',ride.data().data.Driver.Id,undefined);
        //TODO:return rideData and notification token
        return data;

    }

    requestAccept = async (rideId: string, userId: string) => {
        const ride = await this.getRide(rideId);
        let numOfSeats: number = ride.data().data.numberOfSeats;
        numOfSeats = numOfSeats - 1;

        let ridePassengers = new Array;
        ridePassengers = ride.data().data.passenger;

        ridePassengers.map(el => {
            if (el.userId == userId) {
                el.status = 'CONFIRMED'
                return
            } else {
                return
            }
        });
        await this.geocollection.doc(rideId).set({
            data: {
                passenger: ridePassengers,
                numberOfSeats: numOfSeats,

            }
        }, { merge: true });


        //Get notificationToken from driver document with driverId
        const data = await this.getNotificationData(rideId,'CONFIRMED',userId,undefined);
        // return rideData and notificationToken
        return data;
    }

    requestDecline = async (rideId: string, userId: string) => {
        //Find Ride with rideId
        const ride = await this.getRide(rideId);
        //delete passenger from array
        let ridePassengers = new Array;
        ridePassengers = ride.data().data.passenger;
        for (var i = 0; i < ridePassengers.length; i++) {
            if (ridePassengers[i].userId == userId) {
                ridePassengers.splice(i, 1);
            }
        }
        await this.geocollection.doc(rideId).set({
            data: {
                passenger: ridePassengers
            }
        }, { merge: true });


        //Get notificationToken from driver document with driverId
        const data =await this.getNotificationData(rideId,'REJECTED',userId,undefined)
        // return ridedata, notificationToken
        return data;
    }

    manualRideComplete = async (rideId: string) => {
        const ride = await this.getRide(rideId);
        let status = ride.data().data.status;
        if (status == 'COMPLETED') {
            return 'Already Completed'
        }
        await this.geocollection.doc(rideId).set({
            data: {
                status: 'COMPLETED',
            }
        }, { merge: true });
        //TODO: return rideData
        return 'Ride Completed';
    }

    editRide = async (rideId: string, date?: Date, time?: string, seats?: number) => {
        const ride = await this.getRide(rideId);
        let passenger = ride.data().data.passenger
        // update the necessary data
        await this.geocollection.doc(rideId).set({
            data: {
                Date: date.valueOf(),
                Time: time,
                numberOfSeats: seats
            }
        }, { merge: true })
        // get notificationTokens of passengers
        let data = null;
        if (passenger !== undefined) {
             data = await this.getNotificationData(rideId,'PASSENGER',undefined,passenger);
        }
        // return rideData and notificationTokens of passengers 
        return data
    }

    cancelRide = async (rideId: string) => {
        const ride = await this.getRide(rideId);
        let status = ride.data().data.status;
        let passenger = ride.data().data.passenger
        if (status == 'CANCELLED') {
            return 'CANCELLED'
        }
        await this.geocollection.doc(rideId).set({
            data: {
                status: 'CANCELLED',
            }
        }, { merge: true });

        // get notificationTokens of passengers
        let data = null;
        if (passenger !== undefined) {
             data =await this.getNotificationData(rideId,'CANCELLED',undefined,passenger);
        }
        // return rideData and notificationTokens of passengers 
        return data
    }

    leaveRide = async (rideId: string, userId: string) => {
        const ride = await this.getRide(rideId);
        // mark the passengerStatus 'LEFT'
        let passenger = ride.data().data.passenger
        passenger.map(user => {
            if (user.userId == userId) {
                user.status = 'LEFT'
                return
            }
            return
        })
        const seats = parseInt(ride.data().data.numberOfSeats) + 1
        await this.geocollection.doc(rideId).set({
            data: {
                passenger: passenger,
                numberOfSeats: seats,
            }
        }, { merge: true });
        // get the notification token of the driver
        // const userData = await firebase.firestore().collection('userx').doc(ride.data().data.Driver.Id).get();
        const data = await this.getNotificationData(rideId,'OFFERED',ride.data().data.Driver.Id,undefined);
        // return rideData and notification token
        return data
    }

    removePassenger = async (rideId: string, userId: string) => {
        const ride = await this.getRide(rideId);
        // mark the passenger status 'REMOVED'
        let passenger = ride.data().data.passenger
        passenger.map(user => {
            if (user.userId == userId) {
                user.status = 'REMOVED'
                return
            }
            return
        })
        const seats = parseInt(ride.data().data.numberOfSeats) + 1
        await this.geocollection.doc(rideId).set({
            data: {
                passenger: passenger,
                numberOfSeats: seats
            }
        }, { merge: true });
        // get the notification token of the user
        const data = await this.getNotificationData(rideId,'REMOVED',userId,undefined);
        // return rideData and notification token
        return data
    }
}