import * as React from 'react'
import autobind from 'autobind-decorator'
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { commonStyles } from '../components/commonStyles';
import { observer, inject } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import LoginService from '../service/LoginService';
import Header from '../components/Header';
import NumericInput from 'react-native-numeric-input';
import ModalLocationInput, { Location } from '../components/ModalLocationInput';
import { observable } from 'mobx';
import Icon from '../components/Icon';
import ModaleDateInput from '../components/ModalDateInput';
import Button from '../components/Button';
import Dialog, { DialogContent, DialogFooter, DialogButton, DialogTitle } from 'react-native-popup-dialog';
import ContentBlock from '../components/ContentBlock';
import RideService from './../service/RideService';
import LoaderOverlay from './../components/LoaderOverlay';
import RangeSlider from 'rn-range-slider';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';

type AddRidePageProps = {
    routing?: RouterStore
    login?: LoginService
    rides?: RideService
}

const styles = StyleSheet.create({
    contentBlock: {
        flexGrow: 1,
        paddingLeft: 18,
        paddingRight: 18,
        paddingTop: 32
    },
    stopoverButton: {
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 22,
        backgroundColor: 'rgb(220, 220, 220)',
        alignItems: 'center',
        borderRadius: 4,
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 12,
        paddingRight: 12

    },
    centeredRow: {
        flexDirection: 'row',
        justifyContent: 'center',

    },

    label: {
        fontSize: 14,
        color: 'rgb(120, 120, 120)',
        marginBottom: 6
    },
})

@inject('routing')
@inject('login')
@inject('rides')
@observer
export default class AddRidePage extends React.Component<AddRidePageProps> {

    state = {
        isloading: false
    }
    @observable
    price: string = 'no route'

    @observable
    rate:number = 0

    @observable
    startPoint: Location

    @observable
    destination: Location

    @observable
    stopovers = new Array<Location>();

    @observable
    date: Date

    @observable
    time: Date

    @observable
    numSeats: number;

    @observable
    errorMessage = ""

    @observable
    errorDialogVisible = false;

    @observable
    min:number = 0
    @observable
    max:number = 0
    @observable
    suggested:number = 0

    handleSubmitErrors() {
        if (this.startPoint == null) {
            this.errorMessage = "Please enter the Start Location."
            this.errorDialogVisible = true;
            return;
        }

        if (this.destination == null) {
            this.errorMessage = "Please enter the Destination."
            this.errorDialogVisible = true;
            return;
        }

        if (this.date == null) {
            this.errorMessage = "Please enter the Journey Date."
            this.errorDialogVisible = true;
            return;
        }

        if (this.time == null) {
            this.errorMessage = "Please enter the Journey Time."
            this.errorDialogVisible = true;
            return;
        }
        if (this.price == 'no route') {
            this.errorMessage = "Please select the Rate"
            this.errorDialogVisible = true;
            return;
        }
        if(this.numSeats == null){
            this.errorMessage = "Please Select Seats"
            this.errorDialogVisible = true;
            return;
        }
    }

    @autobind
    goToMain() {
        this.props.routing.replace('/')
    }

    @autobind
    async addRide() {
        this.handleSubmitErrors();
        if (this.errorDialogVisible) {
            return;
        }
        this.setState({ isloading: true });
        const driver = {
            Id: this.props.login.user.uid,
            name: this.props.login.firstName,
            carModal: this.props.login.modelName,
            profilePic: this.props.login.profilePicture
        }
        const ride = await this.props.rides.addRideDetails(this.startPoint, this.destination, this.stopovers, this.date, this.time, this.numSeats, driver, this.price, this.props.login.user.uid);
        if (ride == 'Oops! Somthing went wrong') {
            this.errorMessage = ride;
            this.errorDialogVisible = true;
        }
        this.setState({ isloading: false });
        if (this.errorDialogVisible) {
            return;
        }
        this.goToMain();
    }



    @autobind
    hideErrorDialog() {
        this.errorMessage = "";
        this.errorDialogVisible = false;
    }

    @autobind
    addStopover() {
        this.stopovers.push(null);
    }

    renderStopovers() {
        return this.stopovers.map((value, index) =>
            <ModalLocationInput style={{ marginTop: 20 }} placeholder="Add a Stopover" icon="pointer" label="Stopover"
                location={value} onLocationChanged={it => this.stopovers[index] = it} key={index} autoOpen />
        )
    }

    allotPriceRange(it:any){
        this.destination = it
        const Y1 = this.startPoint.longitude;
        const X1 = this.startPoint.latitude;
        const X2 = this.destination.latitude;
        const Y2 = this.destination.longitude;
        const dist:number = this.props.rides.distance(X1, Y1, X2, Y2, 'K');
        let distance = dist.toFixed(0)
       // console.log('dist',distance)
        if(distance<=100){
          this.min = parseFloat(this.props.login.pricingTable[0].min)
          this.max = parseFloat(this.props.login.pricingTable[0].max)
          this.suggested = parseFloat(this.props.login.pricingTable[0].suggested)
        }else if(distance>=100 && distance <=199){
            this.min = parseFloat(this.props.login.pricingTable[1].min)
            this.max = parseFloat(this.props.login.pricingTable[1].max)
            this.suggested = parseFloat(this.props.login.pricingTable[1].suggested)
        }else if(distance>=200 && distance <=299){
            this.min = parseFloat(this.props.login.pricingTable[2].min)
            this.max = parseFloat(this.props.login.pricingTable[2].max)
            this.suggested = parseFloat(this.props.login.pricingTable[2].suggested)
        }else if(distance>=300 && distance <=399){
            this.min = parseFloat(this.props.login.pricingTable[3].min)
            this.max = parseFloat(this.props.login.pricingTable[3].max)
            this.suggested = parseFloat(this.props.login.pricingTable[3].suggested)
        }else if(distance>=400 ){
            this.min = parseFloat(this.props.login.pricingTable[4].min)
            this.max = parseFloat(this.props.login.pricingTable[4].max)
            this.suggested = parseFloat(this.props.login.pricingTable[4].suggested)
        }
        this.rate = this.suggested
        this.price = `₹${this.props.rides.calculatePrice(this.destination,this.startPoint,this.rate)}`;
        }

    render() {
        return (
            <View style={commonStyles.topContainer}>
                <Header theme="black" icon="close" iconClick={this.goToMain} title="Add Ride" />
                <LoaderOverlay style={{ height: '90%' }} loading={this.state.isloading}>
                    <ContentBlock style={styles.contentBlock}>
                        <ModalLocationInput placeholder="Add Your Start Location" icon="pointer" label="Start Location"
                            location={this.startPoint} onLocationChanged={it => this.startPoint = it} />

                        {this.renderStopovers()}

                        <ModalLocationInput style={{ marginTop: 20 }} placeholder="Add Your Destination" icon="location"
                            label="Destination" location={this.destination} onLocationChanged={it => this.allotPriceRange(it)} />

                        <View style={styles.centeredRow}>
                            <TouchableOpacity style={styles.stopoverButton} onPress={this.addStopover}>
                                <Icon icon="plus" size={12} style={{ marginRight: 4 }} />
                                <Text> ADD STOPOVER </Text>
                            </TouchableOpacity>
                        </View>

                        <ModaleDateInput date={this.date} onDateChanged={it => this.date = it} style={{ marginTop: 20 }}
                            placeholder="Add Your Start Date" label="Start Date" />

                        <ModaleDateInput date={this.time} onDateChanged={it => this.time = it} mode="time"
                            placeholder="Add Your Start Time" label="Start Time" style={{ marginTop: 20 }} />


                        <View style={{ flexDirection: 'row', marginTop: 22, alignItems: 'center' }}>
                            <Icon icon="seat" size={20} style={{ marginRight: 12 }} />
                            <View>
                                <Text style={styles.label}> Number Of Available Seats </Text>
                                <NumericInput editable={false} totalHeight={36} containerStyle={{ marginTop: 3, marginLeft: 3 }}
                                    minValue={1} maxValue={4} value={this.numSeats}
                                    onChange={(value) => this.numSeats = value}
                                    onLimitReached={(isMax, msg) => {
                                        if (isMax) {
                                            this.errorMessage = 'seats availability is 4';
                                            this.errorDialogVisible = true
                                        }
                                    }}
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: 22, alignItems: 'center' }}>
                        <Icon icon="seat" size={20} style={{ marginRight: 12 }} />
                            <View style={{flex:1}}>
                                <Text style={styles.label}>Add Fair</Text>
                                <RangeSlider
                                    rangeEnabled={false}
                                    style={{ width:'80%', height: 40 }}
                                    gravity={'center'}
                                    min={1}
                                    max={3}
                                    step={1}
                                    valueType='time'
                                    initialLowValue={2}
                                    selectionColor="#000"
                                    blankColor="#fff"
                                    labelStyle='none'
                                    textSize={12}
                                    onValueChanged={(low, high, fromUser) => {
                                      if(low == 1){
                                        this.rate = this.min
                                      }else if(low ==2){
                                        this.rate = this.suggested
                                      }else if(low == 3){
                                        this.rate = this.max
                                      }

                                        if (this.startPoint == null || this.destination == null) {
                                            this.errorMessage = "Please add destinations first to calculate price"
                                            this.errorDialogVisible = true;
                                            return;
                                        }
                                        if (this.errorDialogVisible) {
                                            return;
                                        }
                                          this.price =`₹${this.props.rides.calculatePrice(this.destination,this.startPoint,this.rate)}` ;
                                    }} />
                                    <Text style={styles.label}>Fair Calculated at <Text style={{fontSize:16}}>₹ {this.rate} /KM</Text> :<Text style={{color:'#000',fontSize:16, fontWeight:'bold'}}> {this.price}</Text></Text>
                                    </View>
                        </View>
                        <View style={{ marginBottom: 54, alignItems: 'center', width: '100%' }}>
                            <Button onClick={this.addRide} text="ADD RIDE" style={{ marginTop: 15, width: 220 }} />
                        </View>

                    </ContentBlock>
                </LoaderOverlay>

                <Dialog visible={this.errorDialogVisible} width={0.9}
                    onTouchOutside={this.hideErrorDialog}
                    dialogTitle={<DialogTitle title="Ride Details Incomplete" />}
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
