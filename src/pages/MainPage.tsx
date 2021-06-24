import * as React from 'react'
import { View, ImageBackground, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Alert } from "react-native";
import Header from "../components/Header";
import { commonStyles } from "../components/commonStyles";
import { RouterStore } from 'mobx-react-router';
import { observer, inject, } from 'mobx-react';
import autobind from 'autobind-decorator';
import Button from '../components/Button';
import RideService from './../service/RideService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import BottomTabs, { bottomTabsState, content } from './../components/BottomTabs';
import LoaderOverlay from '../components/LoaderOverlay';
import ContentBlock from '../components/ContentBlock';
import RideItem from '../components/RideItem';
import TopTabs, { TopTabsState } from '../components/TopTabs';
import { toJS, observable } from 'mobx';
import LoginService from './../service/LoginService';
import { element } from 'prop-types';
import NotificationService from './../service/NotificationService';
// import RideListenerService from './../service/RideListenerService';
var topTabsState = new TopTabsState();

type MainPageProps = {
    routing?: RouterStore
    login?: LoginService
    rides?: RideService
    notification?:NotificationService
   
}

@inject('routing')
@inject('login')
@inject('rides')
@inject('notification')
@observer
export default class MainPage extends React.Component<MainPageProps> {

    @observable
    isloading: boolean = false

    @observable
    currentlimit: number = 10

    @observable
    historylimit: number = 10

    @observable
    loading:boolean = false

    @autobind
    goToProfile() {
        this.props.routing.push('/profile')
    }

    @autobind
    addRide() {
        this.props.routing.push('/addride')
    }

    @autobind
    showRide() {
        this.props.routing.push('/ridedetails')
    }

    @autobind
    findRide() {
        this.props.routing.push('/findRide')
    }

    showMoreCurrent = async () => {
        this.isloading = true
        this.currentlimit  = this.currentlimit + 10
        this.props.rides.Listner = null
        this.props.rides.Listner = this.props.rides.currentListener(this.currentlimit)
      setTimeout(() =>{
        this.isloading = false
      },3000);
    }

    showMoreHistory = async () => {
        this.historylimit = this.historylimit + 10
        this.isloading = true
        await this.props.rides.getMyHistoryRides(this.historylimit);
        this.isloading = false
    }

    componentWillUpdate = () => {
        // Alert.alert('did',JSON.stringify(this.props.location));
        if (this.props.location.state !== undefined ) {
            this.loading = true
            const { state } = this.props.location;
            let rideIndex: number;
            this.props.rides.MyCurrentRides.map((element, index) => {
                if (element.item.id == state) {
                    rideIndex = index
                    return
                }
                return
            })
            this.loading = false
            if (rideIndex !== undefined) {
                return this.props.routing.push({
                    pathname: '/ridedetails',
                    state: this.props.rides.MyCurrentRides[rideIndex]
                })
            }
        }
    };

    renderStartPage() {
        return (
            <View style={commonStyles.topContainer}>
                <Header theme="black" title="Coco Cars" />
                {/* <LoaderOverlay style={{ flex:1 }} loading={this.props.rides.loading}> */}
                    <ImageBackground
                        style={styles.image}
                        source={require('../../assets/backHome.jpg')}
                    >
                        <View style={{marginBottom:'27%', alignItems:'center'}}>
                            <Text style={styles.textHeading}>Making a Road Trip?</Text>
                            <Text style={styles.textSubHeading}>Find your perfect ride partner</Text>
                        
                        <Button style={styles.ButtonOfferRide} onClick={this.addRide} text="OFFER A RIDE" />
                        <Button onClick={this.findRide} text="FIND A RIDE" style={styles.ButtonFindRide} />
                        </View>
                    </ImageBackground>
                {/* </LoaderOverlay> */}
                <BottomTabs state={bottomTabsState} content={content} />
            </View>
        )
    }

    getStatusColor(status: string) {
        let color;
        if (status == 'CONFIRMED') { color = {color: '#245BCF'}} 
        else if (status == 'OFFERED') { color = {color: '#50C878'}} 
        else if (status == 'REQUESTED') { color = {color: '#B51310'}} 
        else if (status == 'REJECTED') { color = {color: '#EE0000'}} 
        else if (status == 'COMPLETED') { color = {color: '#218721'}} 
        else if (status == 'REMOVED') { color = {color: '#A20000'}} 
        else if (status == 'LEFT') { color = { color: '#7F7D7E' }}
        else if (status == 'CANCELLED'){ color={color:'#FC0706'}}
        return color;
    }
    
    renderItem = (data: any) => {
        let color = this.getStatusColor(data.item.status);
        return (
            <RideItem
                status={data.item.status}
                statusColor={color}
                data={data.item}
                onPress={() => {
                    this.props.routing.push({
                        pathname: '/ridedetails',
                        state: data.item
                    })
                }} />
        )
    }

    getDisplay(length: number) {
        if (length < 5) {
            return { ...styles.showMore, ...{ display: 'none'} }
        } else {
            return { ...styles.showMore, ...{ display: 'flex'} }
        }
    }

    renderCurrentRidesList() {
        if (this.props.rides.MyCurrentRides.length == 0) {
            return (
                <ContentBlock style={{ backgroundColor: '#E4E4E4'}} hidden={topTabsState.currentTab != 0}>
                    <View style={styles.noRidesContainer}>
                        <Text style={styles.textNoRides}>No Current Rides</Text>
                    </View>
                </ContentBlock>
            )
        }
        return (
            <ContentBlock style={{ backgroundColor: '#E4E4E4', marginBottom: hp('8.5%') }} hidden={topTabsState.currentTab != 0}>
               
                {this.props.rides.MyCurrentRides.map(data => {
                    return (
                        <RideItem
                            status={data.status}
                            statusColor={this.getStatusColor(data.status)}
                            data={data}
                            onPress={() => {
                                this.props.routing.push({
                                    pathname: '/ridedetails',
                                    state: data
                                })
                            }} />
                    )
                })}
                <LoaderOverlay style={{height:hp('8%')}} loading={this.isloading}>
                    <TouchableOpacity
                        onPress={this.showMoreCurrent}
                        style={this.getDisplay(this.props.rides.MyCurrentRides.length)}
                    >
                        <Text style={{ fontSize: wp('5%') }}>Show More</Text>
                    </TouchableOpacity>
                </LoaderOverlay>
            </ContentBlock>
        )
    }

    renderHistoryRidesList() {
        if (this.props.rides.MyHistoryRides.length == 0) {
            return (
                <ContentBlock style={{ backgroundColor: '#E4E4E4' }} hidden={topTabsState.currentTab != 1}>
                    <View style={styles.noRidesContainer}>
                        <Text style={styles.textNoRides}>No Past Rides</Text>
                    </View>
                </ContentBlock>
            )
        }
        return (
            <ContentBlock style={{ backgroundColor: '#E4E4E4',marginBottom: hp('8.5%') }} hidden={topTabsState.currentTab != 1}>
                 
                <FlatList
                    data={this.props.rides.MyHistoryRides}
                    renderItem={this.renderItem}
                />
                <LoaderOverlay style={{ height: hp('8%'), }} loading={this.isloading}>
                    <TouchableOpacity
                        onPress={this.showMoreHistory}
                        style={this.getDisplay(this.props.rides.MyHistoryRides.length)}
                    >
                        <Text style={{ fontSize: wp('5%') }}>Show More</Text>
                    </TouchableOpacity>
                </LoaderOverlay>
                
            </ContentBlock>
        )
    }

    render() {
        if (this.props.rides.MyCurrentRides.length == 0 && this.props.rides.MyHistoryRides.length == 0) {
            return this.renderStartPage();
        } else {
            return (
                <View style={commonStyles.topContainer}>
                     <Header theme="black" title="My Rides" />
                     <TopTabs textStyle={{ fontSize: 16, fontWeight: '400', color: '#000' }} state={topTabsState} content={['CURRENT', 'HISTORY']} />
                     {this.renderCurrentRidesList()}
                     {this.renderHistoryRidesList()}
                     <BottomTabs state={bottomTabsState} content={content} />
                    
                 </View>
            )
        }

    }
}

const styles = StyleSheet.create({
    textNoRides: {
        fontSize: wp('8%')
    },
    noRidesContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: hp('10%'),
    },
    showMore: {
        width: wp('100%'),
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingBottom: hp('1.5%'),
        paddingTop: hp('1.5%')
    },
    image: {
        width:'100%',
        height:'91.5%',
        alignItems: 'center',
        justifyContent: 'flex-end', 
    },
    ButtonOfferRide: {
        width: 220,
        backgroundColor: '#fff',
        color: '#000',
        marginTop: hp('4%')
    },
    ButtonFindRide: {
        width: 220,
        marginTop: hp('4%'),
    },
    textHeading: {
        color: '#fff', 
        fontSize: wp('8%'), 
        fontWeight: '600', 
        marginBottom: hp('2%')
    },
    textSubHeading: {
        color: '#fff', 
        fontSize: wp('4%'), 
        fontWeight: 'bold',
        alignSelf:'flex-start',
    }
})