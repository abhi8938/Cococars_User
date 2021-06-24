import * as React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import autobind from 'autobind-decorator'
import { RouterStore } from 'mobx-react-router';
import { observer, inject } from 'mobx-react';
import ModalLocationInput, { Location } from '../components/ModalLocationInput';
import ModaleDateInput from '../components/ModalDateInput';
import Button from '../components/Button';
import LoginService from './../service/LoginService';
import RideService from './../service/RideService';
import Dialog, { DialogContent, DialogFooter, DialogButton, DialogTitle } from 'react-native-popup-dialog';
import Header from './../components/Header';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { observable } from 'mobx';
import LoaderOverlay from './../components/LoaderOverlay';
type findRide = {
    routing?: RouterStore
    login?: LoginService
    rides?: RideService
}

@inject('routing')
@inject('login')
@inject('rides')

@observer
export default class FindRidePage extends React.Component<findRide>{

    state={
        isloading: false
    }

   @observable
    startPoint: Location
   
   @observable
    destination: Location 
   
   @observable
    date: Date 
    
    @observable
    errorMessage = ""

    @observable
    errorDialogVisible = false;
    
    @autobind
    goToMain() {
        this.props.routing.replace('/')
    }
   @autobind
  async findRide(){
      this.handleSubmitErrors();
      if(this.errorDialogVisible) {
        return;
    }
    this.setState({ isloading:true});
    const ridesFound = 'NO RIDES';
    const res = await this.props.rides.ridesFinder(this.startPoint, this.destination, this.date);
     if(res.length == 0){
        this.setState({isloading: false});
        this.props.routing.replace({
        pathname: '/listRides',
        state: ridesFound
      });
    }else if(res.length > 0){
        const data = {
            res:res
        }
        this.setState({isloading: false});
        this.props.routing.replace({
            pathname: '/listRides',
            state: data
      });
    }
}
@autobind
hideErrorDialog() {
    this.errorMessage = ""; 
    this.errorDialogVisible = false;
}   
 
handleSubmitErrors() {
    if(this.startPoint == null) {
        this.errorMessage = "Please enter the Start Location."
        this.errorDialogVisible = true;
        return;
    }

    if(this.destination == null) {
        this.errorMessage = "Please enter the Destination."
        this.errorDialogVisible = true;
        return;
    }

    if(this.date == null) {
        this.errorMessage = "Please enter the Journey Date."
        this.errorDialogVisible = true;
        return;
    }
}

    render(){
        return(
            <View>
               <Header theme="black" icon="close" iconClick={this.goToMain} title="Find Rides" />  
               <LoaderOverlay loading={this.state.isloading} style={{height:hp('90%')}}>
               <View style={{paddingTop:hp('4%'), paddingLeft:wp('4%')}}>
               <ModalLocationInput placeholder="Add Your Start Location" icon="pointer" label="Start Location"
                        location={this.startPoint} onLocationChanged={it => this.startPoint = it}/>
               </View>
               <View style={{paddingLeft:wp('4%')}}>
               <ModalLocationInput style={{marginTop: 20}} placeholder="Add Your Destination" icon="location"  
                        label="Destination" location={this.destination} onLocationChanged={it => this.destination = it}/>
               </View>
               <ModaleDateInput date={this.date} onDateChanged={it => this.date = it} style={{marginTop: 20, marginLeft:wp('4.2%')}}
                        placeholder="Add Your Start Date" label="Start Date"/>
              <View style={{alignItems: 'center', width: '100%'}}>
                        <Button onClick={this.findRide} text="Find Rides" style={{marginTop: 32, width: 220}}/>
                    </View>
                    </LoaderOverlay>
                    <Dialog visible={this.errorDialogVisible} width={0.9}
                    onTouchOutside={this.hideErrorDialog}
                    dialogTitle={<DialogTitle title="Ride Details Incomplete"/>}
                    footer={
                        <DialogFooter>
                          <DialogButton text="OK" onPress={this.hideErrorDialog}/>
                        </DialogFooter>
                    }>
                    <DialogContent>
                        <Text style={{marginTop: 12, fontSize: 18, textAlign: 'center'}}> {this.errorMessage} </Text>
                    </DialogContent>
                </Dialog>
            </View>
            
        )
    }
}