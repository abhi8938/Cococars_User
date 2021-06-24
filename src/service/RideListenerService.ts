// import { observable, toJS } from "mobx";
// import { Listener } from "./Event";
// import firebase, { RNFirebase, Firebase } from 'react-native-firebase';

// export default class RideListenerService {

//     @observable
//     loading = true;

//     @observable
//     changes: string

//     @observable
//     rideListner: Listener<any>;

//     @observable
//     MyCurrentRides = new Array;

//     collection = firebase.firestore().collection("points").where("d.data.Date", ">",Date.now().valueOf()).orderBy("d.data.Date", "ASC").limit(20)

//     added = (change: any, uid: string, rideSorted: Array<object>, expiredRides: Array<string>) => {
//         // console.log('added', change.doc);
//         // this.changes = 'added';
//         let date = new Date;
//         const ride = change.doc.data().d;
//         const element = change.doc;
//         const expiryDate = new Date(ride.data.Date + 84600000);
//         const passengers = ride.data.passenger;
//         let isPassenger = false;
//         let passengerStatus = ''

//         if (expiryDate < date) {
//             expiredRides.push(element.id);
//             return
//         }

//         if (ride.data.Driver.Id == uid) {
//             const data = {
//                 item: element,
//                 status: ride.data.status
//             }

//             if (expiryDate > date) {
//                 this.MyCurrentRides.push(data);
               
//             return
//             }
//         }
//         if (passengers != undefined) {
//             passengers.map(el => {
//                 if (el.userId == uid) {
//                     isPassenger = true
//                     passengerStatus = el.status
//                     return
//                 } else {
//                     isPassenger = false
//                     return
//                 }
//             })
//         }
//         if (isPassenger) {
//             const data = {
//                 item: element,
//                 status: passengerStatus,
//             }
//             if (expiryDate > date) {
//                 this.MyCurrentRides.push(data);
               
//             }
//         }
//     }

//     modified = (change: any, uid: string) => {
//         console.log('Modified: ', change.doc);
//         const modified = change.doc;
//         let isPresent;
//         let isPassenger: boolean;
//         let passengerIndex: number
//         let isDriver: boolean = modified.data().data.Driver.Id == uid;
//         let rideStatus = modified.data().data.status;
//         let passengers = modified.data().data.passenger;

//         if (passengers != undefined) {
//             passengers.map((element, index) => {
//                 if (element.userId == uid) {
//                     isPassenger = true
//                     passengerIndex = index
//                     return
//                 }
//                 return
//             })
//             if (isPassenger == undefined) {
//                 isPassenger = false
//             }
//         }

//         this.MyCurrentRides.forEach((element, index) => {
//             if (element.item.id == modified.id) {
//                 isPresent = true
//                 return
//             }
//         })

//         if (isPresent == undefined) {
//             isPresent = false
//         }

//         if (rideStatus != 'COMPLETED' && rideStatus !== 'CANCELLED') {

//             //TODO check if modified ride is requested by this user and push it in myCurrentRide
//             if (isPassenger == true && isPresent == false) {
//                 this.changes = 'modified'
//                 let element = passengers[passengerIndex];
//                 if (element.status == 'REQUESTED') {
//                     const data = {
//                         item: modified,
//                         status: element.status
//                     }
//                     this.MyCurrentRides.push(data);
//                 }
//             }
//             //TODO check if driver and update ride
//             if (isPassenger == false && isDriver == true && isPresent == true) {
//                 this.changes = 'modified'
//                 this.MyCurrentRides.map((element, index) => {
//                     if (element.item.id == modified.id) {
//                         element.item = modified
//                         element.status = rideStatus
//                         return
//                     }
//                     return
//                 })
//             }

//             // //TODO FOR PASSENGER check if ride is present and update ride item and status when accepted, left, removed
//             // console.log(`conditions before`, 
//             // 'ispassenger false expected:-',isPassenger, 
//             // 'isDriver false expected:-',isDriver, 
//             // 'isPresent true expected:-',isPresent, 
//             // 'empty expected:-',passengers);
//             //&& passengers[passengerIndex].status == 'CONFIRMED'
//             if (isPassenger == true && isDriver == false && isPresent == true) {
//                 this.changes = 'modified'
//                 this.MyCurrentRides.map(element => {
//                     if (element.item.id == modified.id) {
//                         element.item = modified;
//                         element.status = passengers[passengerIndex].status
//                     }
//                 })
//             }

//             //TODO check if ride is present and update ride item and status when rejected
//             if (isPresent == true && isPassenger == false && isDriver == false) {
//                 this.changes = 'modified'
//                 this.MyCurrentRides.map(element => {
//                     if (element.item.id == modified.id) {
//                         element.item = modified;
//                         element.status = 'REJECTED'
//                         console.log(`when rejected passenger`, element);
//                     }
//                 })
//             }
//         }

//         if (rideStatus == 'COMPLETED' || rideStatus == 'CANCELLED') {
//             if (isPresent == true) {
//                 this.changes = 'modified';
//                 this.MyCurrentRides.forEach((element, index) => {
//                     if (element.item.id == modified.id) {
//                         this.MyCurrentRides.splice(index, 1);
//                         return
//                     }
//                 })
//             }
//         }
//     }

//     currentListner(uid: string, limit: number) {
//         let rideSorted = new Array
//         let expiredRides = new Array;
//         console.log(`executed`);
//         const Listener = this.collection.onSnapshot(querySnapshot => {
//             console.log(`add`, querySnapshot);
//             querySnapshot.docChanges.forEach(change => {

//                 if (change.type === 'added') {
//                     this.added(change, uid, rideSorted, expiredRides);
                 
//                 }
//                 if (change.type === 'modified') {
//                     this.modified(change, uid)
//                 }
//             })

//             // console.log(`changes`, this.changes);
//             // if (this.changes == 'added') {
//             //     rideSorted.sort((a, b) => {
//             //         return (a.item.data().data.Date - b.item.data().data.Date)
//             //     })
//             //     if (rideSorted.length > limit) {
//             //         rideSorted.length = limit
//             //     }
//             //     this.MyCurrentRides = rideSorted;
//             this.loading = false
//             this.markRidesComplete(expiredRides);
//             // }
//         }, error => console.log('listener', error.message));

//         return Listener;
//     }

//     markRidesComplete(rides: Array<string>) {
//         rides.forEach(async ID => {
//             await firebase.firestore().collection('points').doc(ID).set({
//                 data: {
//                     status: 'COMPLETED'
//                 }
//             }, { merge: true });
//         })
//     }
// }
