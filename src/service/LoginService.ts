import { observable } from "mobx";
import firebase, { RNFirebase, Firebase } from 'react-native-firebase';
import Event from "./Event";
import autobind from "autobind-decorator";


export default class LoginService {
    @observable
    firstName = "";

    @observable
    lastName = "";

    @observable
    aboutMe = "";

    @observable
    modelName = "";

    @observable
    year = "";

    @observable
    registration = "";

    @observable
    color = "";

    @observable
    mileage = "";

    @observable
    preferences = {}

    @observable
    profilePicture = ""

    @observable
    vehiclePicture = ""

    @observable
    NotificationToken = ""

    @observable
    mobileNumber = ""

    @observable
    pricingTable = {}

    confirm: RNFirebase.ConfirmationResult;
    user: RNFirebase.User;
    loginStatusChanged = new Event<void>();


    signOut() {
        firebase.auth().signOut();
    }


    async requestPhoneVerification(phoneNumber: string) {
        this.confirm = await firebase.auth().signInWithPhoneNumber(`+91${phoneNumber}`)
    }

    async completePhoneVerification(otp: string) {
        if(this.confirm == null) {
            throw new Error('Need to intialize phone verification');
        }
        this.user = await this.confirm.confirm(otp);
    }

    initialize() {
        firebase.auth().onAuthStateChanged(this.handleAuthStateChange);
    }

    @autobind
    async handleAuthStateChange(user: RNFirebase.User) {


        if(user == null) {
            this.user = null;
            this.setValues(null);

        } else {
            this.user = user;
            const date = new Date();
            await this.setMobileNumber(this.user.phoneNumber,date)
            var snapshot = await firebase.firestore().collection('userx').doc(this.user.uid).get();
            var value = snapshot.data();
            this.setValues(value);

        }

        this.loginStatusChanged.invoke();
    }


    setValues(value?: any) {
        if(value == null) {
            value = {};
        }

        this.firstName = value.firstName || '';
        this.lastName = value.lastName || '';
        this.aboutMe = value.aboutMe || '';
        this.preferences = value.preferences || '';
        this.profilePicture = value.profilePicture || '';
        this.vehiclePicture = value.vehiclePicture || '';

        this.modelName = value.modelName || '';
        this.year = value.year || '';
        this.registration = value.registration || '';
        this.color = value.color || '';
        this.mileage = value.mileage || '';
        this.NotificationToken = value.NotificationToken
    }

    setFirstName(value: string) {
        this.firstName = value;

        if(this.user == null) {
            return;
        }

        firebase.firestore().collection('userx').doc(this.user.uid).set({
            firstName: value
        }, {merge: true})
    }

    setLastName(value: string) {
        this.lastName = value;

        if(this.user == null) {
            return;
        }

        firebase.firestore().collection('userx').doc(this.user.uid).set({
            lastName: value
        }, {merge: true})
    }


    setAboutMe(value: string) {
        this.aboutMe = value;

        if(this.user == null) {
            return;
        }

        firebase.firestore().collection('userx').doc(this.user.uid).set({
            aboutMe: value
        }, {merge: true})
    }

    setPreferences(value: any) {
        this.preferences = value;

        if(this.user == null) {
            return;
        }

        firebase.firestore().collection('userx').doc(this.user.uid).set({
            preferences: value
        }, {merge: true})

    }


   setProfilePicture(value: string) {
        this.profilePicture = value;
        if(this.user == null) {
            return;
        }

        firebase.firestore().collection('userx').doc(this.user.uid).set({
            profilePicture: value
        }, {merge: true}).catch(error => console.log(`error`,error));
    }

    setVehiclePicture(value: string) {
        this.vehiclePicture = value;
        if(this.user == null) {
            return;
        }


        firebase.firestore().collection('userx').doc(this.user.uid).set({
            vehiclePicture: value
        }, {merge: true})

    }

    setModelName(value: string) {
        this.modelName = value;
        if(this.user == null) {
            return;
        }

        firebase.firestore().collection('userx').doc(this.user.uid).set({
            modelName: value
        }, {merge: true})

    }


    setYear(value: string) {
        this.year = value;
        if(this.user == null) {
            return;
        }

        firebase.firestore().collection('userx').doc(this.user.uid).set({
            year: value
        }, {merge: true})
    }

    setRegistration(value: string) {
        this.registration = value;
        if(this.user == null) {
            return;
        }

        firebase.firestore().collection('userx').doc(this.user.uid).set({
            registration: value
        }, {merge: true})
    }

    setColor(value: string) {
        this.color = value;
        if(this.user == null) {
            return;
        }

        firebase.firestore().collection('userx').doc(this.user.uid).set({
            color: value
        }, {merge: true})
    }

    setMileage(value: string) {
        this.mileage = value;
        if(this.user == null) {
            return;
        }

        firebase.firestore().collection('userx').doc(this.user.uid).set({
            mileage: value
        }, {merge: true})
    }
    setNotificationToken(value: string) {
        this.NotificationToken = value;
        if(this.user == null) {
            return;
        }
        firebase.firestore().collection('userx').doc(this.user.uid).set({
            NotificationToken: value
        }, {merge: true});
    }

    setMobileNumber(value: string,date:Date) {
        this.mobileNumber = value;
        if(this.user == null) {
            return;
        }
        let DateString = date.valueOf();

        firebase.firestore().collection('userx').doc(this.user.uid).set({
            mobileNumber: value,
            createdAt:DateString
        }, {merge: true})
    }

    getPricingTable(){
      firebase.firestore().collection('pricing').get().then(querySnapshot => {
        this.pricingTable = querySnapshot.docs[0].data().data;
        console.log('table',this.pricingTable)
      })
      .catch(err => console.log(err))
    }
}
