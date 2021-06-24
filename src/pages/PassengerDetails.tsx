// Create button to remove rider from ride if accepted
// Create function to remove rider from ride if accepted
import React, { Component } from 'react'
import { Text, StyleSheet, View, Image, Alert } from 'react-native'
import LoginService from './../service/LoginService';
import autobind from 'autobind-decorator';
import { RouterStore } from 'mobx-react-router';
import { inject, observer } from 'mobx-react';
import BookingService from './../service/BookingService';
import NotificationService from './../service/NotificationService';
import LoaderOverlay from './../components/LoaderOverlay';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Header from './../components/Header';
import Button from './../components/Button';
import PreferencesIcon from './../components/PreferencesIcon';
import { observable } from 'mobx';

const RenderComponent = (props) => {
    return (
        <View style={{ padding: wp('4%') }}>
            <Text style={{ fontSize:wp('4.5%'), marginBottom:3}} >{props.heading}</Text>
            <Text style={{fontSize:wp('5.5%'), color:'#000'}}>{props.body}</Text>
        </View>
    )
}

type passengerDetailsProps = {
    routing?: RouterStore
    login?: LoginService
    booking?: BookingService
    notification?: NotificationService
}
@inject('routing')
@inject('login')
@inject('rides')
@inject('booking')
@inject('notification')
@observer
export default class PassengerDetails extends Component<passengerDetailsProps> {
    state = {
        isloading: false
    }

    @autobind
    goToMain() {
        this.props.routing.replace('/')
    }


    handleAccept = async () => {
        this.setState({ isloading: true,  });
        const { element } = this.props.location.state;
        const { rideId } = this.props.location.state;
        const token = await this.props.booking.requestAccept(rideId, element.userId);
       await this.props.notification.sendNotification(
            token.token,
            'Request Accepted!',
            `${this.props.login.firstName} has accepted your request. Happy journey`, token.rideData);
        this.setState({ isloading: false,  });
        this.props.routing.goBack()
    }

    handleRemovePassenger = async () => {
        const { element } = this.props.location.state;
        const { rideId } = this.props.location.state;
        this.setState({ isloading: true });
        const result = await this.props.booking.removePassenger(rideId, element.userId);
       await this.props.notification.sendNotification(
            result.token,
            'Removed From Ride!',
            `Sorry User, ${this.props.login.firstName} has removed you from ride.`,result.rideData);
        this.setState({ isloading: false });
        this.props.routing.goBack();
    }
    handleDecline = async () => {
        this.setState({ isloading: true,  });
        const { element } = this.props.location.state;
        const { rideId } = this.props.location.state;
        const token = await this.props.booking.requestDecline(rideId, element.userId);
        await this.props.notification.sendNotification(
            token.token,
            'Request Declined!',
            `Sorry User, ${this.props.login.firstName} has declined your request.`,token.rideData);
        this.setState({ isloading: false,  });
        this.props.routing.goBack();
    }
    renderPreferences() {
        const { element, rideId, userinfo } = this.props.location.state;
        if(userinfo.preferences != undefined){
        let levelchat = userinfo.preferences.chat? userinfo.preferences.chat : 0;
        let levelmusic = userinfo.preferences.music? userinfo.preferences.music : 0;
        let levelsmoke = userinfo.preferences.smoke? userinfo.preferences.smoke : 0;
        let levelpets =  userinfo.preferences.pets? userinfo.preferences.pet : 0;
        return (
            <View style={{width:'100%', padding:wp('2%'), flexDirection:'row'}}>
              <PreferencesIcon
              type='chat'
              level={levelchat}
              style={{marginLeft:wp('2%'), marginright:wp('2%')}}
              />
               <PreferencesIcon
              type='music'
              level={levelmusic}
              style={{ marginLeft:wp('2%'), marginright:wp('2%')}}
              />
               <PreferencesIcon
              type='smoke'
              level={levelsmoke}
              style={{marginLeft:wp('2%'), marginright:wp('2%')}}
              />
               <PreferencesIcon
              type='pets'
              level={levelpets}
              style={{marginLeft:wp('2%'), marginright:wp('2%')}}
              />
            </View>

        )
    }
     }
     renderButton(){
        const { element, rideId, userinfo, rideStatus } = this.props.location.state;

        if(rideStatus == 'COMPLETED'){
            return
        }
        if(element.status == 'REMOVED' || element.status == 'LEFT'){
            return
        }
        if(element.status == 'CONFIRMED'){
            return(
                <View style={[{width:'100%',flexDirection:'row', justifyContent:'center'}]}>
                <Button onClick={this.handleRemovePassenger} text="Remove" style={{  marginTop: 32, width: 150 }} />
            </View>
            )
        }

        return(
            <View style={[{width:'100%',flexDirection:'row', justifyContent:'center'}]}>
            <Button onClick={this.handleAccept} text="Accept" style={{  marginTop: 32, width: 150 }} />
            <Button onClick={this.handleDecline} text="Decline" style={{ marginLeft:wp('4%'), marginTop: 32, width: 150 }} />
        </View>
        )
     }
    render() {
        const { element, rideId, userinfo } = this.props.location.state;

            let source = userinfo.profilePicture ? {uri:userinfo.profilePicture} : require('../../assets/profile.png')
        return (
            <View>
                <Header theme="black" icon='back' iconClick={() => this.props.routing.goBack()} title="Rider's Profile" />
                <LoaderOverlay style={{ height: '90%' }} loading={this.state.isloading}>
                    <View style={{ justifyContent:'flex-start', width:'100%', paddingTop:hp('5%')}}>
                    <Image
                        source={source}
                        style={{ marginBottom:hp('2%'), alignSelf:'center', width:120, height:120, resizeMode:'cover', borderRadius: 0.5 * 120, }}
                    />
                    <RenderComponent heading={'Full Name'} body={`${userinfo.firstName} ${userinfo.lastName}`} />
                    <RenderComponent heading={'Mobile Number'} body={userinfo.mobileNumber} />
                    <RenderComponent heading={'About Me'} body={userinfo.aboutMe} />
                    {this.renderPreferences()}
                    </View>
                   {this.renderButton()}
                </LoaderOverlay>

            </View>
        )
    }
}
