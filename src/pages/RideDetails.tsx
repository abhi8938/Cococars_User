import * as React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, Image, ScrollView, Alert } from 'react-native';
import autobind from 'autobind-decorator'
import { RouterStore } from 'mobx-react-router';
import { observer, inject } from 'mobx-react';
import LoginService from './../service/LoginService';
import RideService from './../service/RideService';
import Header from './../components/Header';
import { toJS, observable } from 'mobx';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Dialog, { DialogContent, DialogFooter, DialogButton, DialogTitle } from 'react-native-popup-dialog';
import BookingService from './../service/BookingService';
import LoaderOverlay from './../components/LoaderOverlay';
import NotificationService from './../service/NotificationService';
import Button from '../components/Button';
import RideOptions from '../components/RideOptions';
import EditRideModal from '../components/EditRideModal';

type rideDetailsPage = {
    routing?: RouterStore
    login?: LoginService
    rides?: RideService
    booking?: BookingService
    notification?: NotificationService
}

@inject('routing')
@inject('login')
@inject('rides')
@inject('booking')
@inject('notification')
@observer
export default class RideDetails extends React.Component<rideDetailsPage>{

    @observable
    loading: boolean = false

    @observable
    errorDialogVisible: boolean = false;

    @observable
    errorMessage: string = ""

    @observable
    EditMode = false

    @observable
    date: string

    @observable
    time: string

    @autobind
    hideErrorDialog() {
        this.errorMessage = "";
        this.errorDialogVisible = false;
    }

    @autobind
    goToMain() { this.props.routing.replace('/'); }

    renderStops() {
        const { data } = this.props.location.state.item.data();
        let stops = new Array;
        data.Locations.map(element => {
            if (element.point == 'STOP') {
                stops.push(element.address);
            }
        })
        return stops.map((element, index) =>
            <View style={styles.StopsContainer}>
                <Text style={{ fontSize: wp('5.5%'), fontWeight: '900', paddingRight: wp('2%'), alignSelf: 'center', color: '#000' }}>*</Text>
                <Text style={[styles.subHeading, { fontSize: wp('4%'), lineHeight: hp('3.8%') }]}>{element}</Text>
            </View>
        )
    }

    handleSendRequest = async () => {
        this.loading = true
        const { data } = this.props.location.state.item.data();
        const { id } = this.props.location.state.item;
        const { price } = this.props.location.state;
        let date = new Date(data.Date);
        let dateString = date.toDateString();

        if (data.Driver.Id == this.props.login.user.uid) {
            this.loading = false
            this.errorMessage = "Sorry you can not join the ride you created."
            this.errorDialogVisible = true
            return
        }

        const token = await this.props.booking.sendRequest(
            id,
            price,
            this.props.login.user.uid,
            this.props.login.profilePicture,
            this.props.login.firstName);
        if (token == 'Seats Full') {
            this.loading = false
            this.errorMessage = token;
            this.errorDialogVisible = true;
            return
        }
        if (token == 'Ride already requested') {
            this.loading = false
            this.errorMessage = token;
            this.errorDialogVisible = true;
            return
        }
        this.loading = false
        this.goToMain();
        await this.props.notification.sendNotification(
            token.token,
            'Ride Request!',
            `${this.props.login.firstName} requested to join you on your ride on ${dateString}`, token.rideData);


    }

    handleFinish = async () => {
        const { id } = this.props.location.state.item;
        this.loading = true
        const result = await this.props.booking.manualRideComplete(id);
        if (result == 'Already Completed') {
            this.loading = false
            this.errorMessage = result;
            this.errorDialogVisible = true;
            return
        }
        await this.props.rides.getMyHistoryRides(10);
        this.loading = false
        this.goToMain();
    }

    handleLeaveRide = async () => {
        const { id } = this.props.location.state.item;
        const { data } = this.props.location.state.item.data();
        let date = new Date(data.Date);
        let dateString = date.toDateString();
        this.loading = true
        const result = await this.props.booking.leaveRide(id, this.props.login.user.uid);
        this.loading = false
        this.goToMain();
        //TODO:send notification
        await this.props.notification.sendNotification(
            result.token,
            'Rider Left!',
            `${this.props.login.firstName} left your ride on date ${dateString}`, result.rideData);

    }

    handleCancelRide = async () => {
        const { id } = this.props.location.state.item;
        const { data } = this.props.location.state.item.data();
        let date = new Date(data.Date);
        let dateString = date.toDateString();
        this.loading = true
        const result = await this.props.booking.cancelRide(id);
        if (result == 'CANCELLED') {
            this.loading = false
            this.errorMessage = result;
            this.errorDialogVisible = true;
            return
        }
        this.loading = false
        this.goToMain();
        if (result !== null) {
            await this.props.notification.sendNotification(
                result.token,
                'Ride Cancelled!',
                `${data.Driver.name} cancelled the ride on ${dateString}`, result.rideData);
        }

    }

    handlePassengerClick = async (element: any) => {
        this.loading = true
        const { id } = this.props.location.state.item;
        const { status } = this.props.location.state;
        const userInfo = await this.props.booking.getUserInfo(element.userId);
        let data = { element: element, userinfo: userInfo, rideId: id, rideStatus: status }
        this.loading = false
        return this.props.routing.push({
            pathname: '/passenger',
            state: data
        })

    }

    async handleEditRequest(date?: Date, time?: string, seats?: number) {
        const { id } = this.props.location.state.item;
        const { data } = this.props.location.state.item.data();
        let date1 = new Date(data.Date);
        let dateString = date1.toDateString();

        this.loading = true
        this.EditMode = false

        const result = await this.props.booking.editRide(id, date, time, seats);
        this.loading = false
        if (result !== null) {
            console.log('dateupdated',date.toDateString() == dateString)
            console.log('time',time == data.Time);
            if (date.toDateString() !== dateString && time == data.Time) {
                return await this.props.notification.sendNotification(
                    result.token,
                    'Ride Updated!',
                    `${data.Driver.name} updated date to ${date.toDateString()}`, result.rideData);
            }
            if (date.toDateString() == dateString && time != data.Time) {
                return await this.props.notification.sendNotification(
                    result.token,
                    'Ride Updated!',
                    `${data.Driver.name} updated time to ${time}`, result.rideData);
            }

            if (date.toDateString() != dateString && time != data.Time) {
                return await this.props.notification.sendNotification(
                    result.token,
                    'Ride Updated!',
                    `${data.Driver.name} updated date and time to ${date.toDateString()},${time}`, result.rideData);

            }



        }

    }

    renderButton() {
        const { status } = this.props.location.state;
        if (status == 'OFFERED') {
            return (
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', width: wp('100%'), bottom: 30, position: 'absolute' }}>
                    <Button onClick={this.handleFinish} text="Finish Ride" style={{ marginTop: 32, width: wp('40%') }} />
                    <Button onClick={this.handleCancelRide} text="Cancel Ride" style={{ marginTop: 32, width: wp('40%') }} />
                </View>
            )
        }
        if (status == 'CONFIRMED') {
            return (
                <View style={{ alignItems: 'center', width: '100%', bottom: 30, position: 'absolute' }}>
                    <Button onClick={this.handleLeaveRide} text="Leave Ride" style={{ marginTop: 32, width: 220 }} />
                </View>
            )
        }
    }

    renderEditModal() {
        const { data } = this.props.location.state.item.data();
        let date1 = new Date(data.Date);
        let dateString = date1.toDateString();
        return (
            <EditRideModal
                isVisible={this.EditMode}
                date={date1}
                time={data.Time}
                seats={data.numberOfSeats}
                onRequestClose={() => this.EditMode = false}
                updateRide={(date?: Date, time?: string, seats?: number) => this.handleEditRequest(date, time, seats)}
            />
        )
    }

    renderEdit() {
        const { status } = this.props.location.state;
        if (status == 'OFFERED') {
            return (<TouchableOpacity
                style={{ backgroundColor: '#ccc', paddingLeft: 4, paddingRight: 4, borderRadius: 3, elevation: 3 }}
                onPress={() => this.EditMode = true}
            ><Text style={[styles.subHeading, { color: '#000' }]}>Edit ride</Text></TouchableOpacity>)
        }
    }

    render() {
        const { data } = this.props.location.state.item.data();

        const { price } = this.props.location.state;
        const { status } = this.props.location.state;
        const cost = price ? `${price}` : status;
        const startAddress = data.startCity.address;
        const endAddress = data.Locations.map(element => {
            if (element.point == 'END') {
                return element.address;
            }
        })

        let date = new Date(data.Date);
        let dateString = date.toDateString();
        return (
            <View>
                <Header theme="black" icon="back" iconClick={() => this.props.routing.replace('/')} title="Ride Details" />
                <LoaderOverlay style={{ height: '90%' }} loading={this.loading}>
                    <ScrollView contentContainerStyle={{ flex: 1 }}>
                        <View style={styles.container}>
                            <View style={styles.leftContainer}>
                                <Text style={styles.Heading}>{dateString}, {data.Time}</Text>
                                <Text style={styles.subHeading}>{data.Driver.carModal}</Text>
                            </View>
                            <View style={styles.rightContainer}>
                                <Text style={styles.Heading}>{cost}</Text>
                                {this.renderEdit()}
                            </View>
                        </View>
                        <View style={styles.AddressContainer}>
                            <View style={styles.StartAddressContainer}>
                                <Text style={{ fontSize: wp('5.5%'), fontWeight: '900', paddingRight: wp('2%'), alignSelf: 'center', color: '#000' }}>*</Text>
                                <Text style={[styles.subHeading, { fontSize: wp('4.5%'), lineHeight: hp('3.8%') }]}>{startAddress}</Text>
                            </View>
                            {this.renderStops()}
                            <View style={styles.EndAddressContainer}>
                                <Text style={{ fontSize: wp('5.5%'), fontWeight: '900', paddingRight: wp('2%'), alignSelf: 'center', color: '#000' }}>*</Text>
                                <Text style={[styles.subHeading, { fontSize: wp('4.5%'), lineHeight: hp('3.8%') }]}>{endAddress}</Text>
                            </View>
                        </View>
                        <RideOptions
                            rideStatus={status}
                            onPassengerClick={(element) => this.handlePassengerClick(element)}
                            onSendRequest={this.handleSendRequest}
                            driverName={data.Driver.name}
                            driverPic={data.Driver.profilePic}
                            passengers={data.passenger}
                        />
                        {this.renderButton()}
                    </ScrollView>
                    {this.renderEditModal()}
                </LoaderOverlay>
                <Dialog visible={this.errorDialogVisible} width={0.9}
                    onTouchOutside={this.hideErrorDialog}
                    dialogTitle={<DialogTitle title="Something went wrong" />}
                    footer={
                        <DialogFooter>
                            <DialogButton text="OK" onPress={this.hideErrorDialog} />
                        </DialogFooter>
                    }>
                    <DialogContent>
                        <Text style={{ marginTop: 12, fontSize: 18, textAlign: 'center' }}> {this.errorMessage} </Text>
                    </DialogContent>
                </Dialog>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    HeadingText: {
        paddingLeft: wp('4%'),
        fontSize: wp('5%'),
        color: '#000'
    },
    HeadingContainer: {
        borderTopWidth: 1,
        borderColor: '#E4E4E4',
        alignItems: 'center',
        flexDirection: 'row',
        padding: wp('2.9%'),
        paddingLeft: wp('4%')
    },
    EndAddressContainer: {
        flexDirection: 'row',
        paddingBottom: hp('1.5%'),
    },
    StartAddressContainer: {
        paddingBottom: hp('1%'),
        flexDirection: 'row'
    },
    StopsContainer: {
        paddingBottom: hp('1%'),
        flexDirection: 'row'
    },
    AddressContainer: {
        width: wp('98%'),
        paddingLeft: wp('3%'),
        paddingRight: wp('5%'),
    },
    container: {
        width: wp('100%'),
        flexDirection: 'row',
        paddingLeft: wp('4%'),
        padding: wp('3%'),
        paddingTop: hp('1%'),
    },
    rightContainer: {
        flex: 2,
        alignItems: 'flex-end',
    },
    leftContainer: {
        flex: 3,

    },
    Heading: {
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
        paddingBottom: hp('.8%'),
    },
    subHeading: {
        fontSize: wp('4.2%'),
    }
})