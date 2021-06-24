import * as React from 'react';
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import autobind from 'autobind-decorator'
import { RouterStore } from 'mobx-react-router';
import { observer, inject } from 'mobx-react';
import Button from '../components/Button';
import LoginService from './../service/LoginService';
import RideService from './../service/RideService';
import Header from './../components/Header';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { observable, toJS } from 'mobx';
import LoaderOverlay from './../components/LoaderOverlay';
import RideItem from '../components/RideItem';


type ridesList = {
    routing?: RouterStore
    login?: LoginService
    rides?: RideService
}

@inject('routing')
@inject('login')
@inject('rides')

@observer
export default class ListRides extends React.Component<ridesList>{
   
    state={
        isloading: false,
        Rides: new Array
    }
    ShowNotFound = false;
    
    componentDidMount() {
      const { state } = this.props.location;
      this.setState({ Rides: state.res});
    }

    @autobind
    goToMain() {
        this.props.routing.replace('/findRide');
    }

    @autobind
    async showMore(){
      this.setState({ isloading: true});
      const rides =  await this.props.rides.paginateRides();
      this.setState({ Rides: rides});
      this.setState({isloading: false});
    }
   renderItem = (data:any) =>{
     return(
       <RideItem data={data} price={data.item.data().data.price} onPress={() =>{
        const rideData ={
          item:data.item,
          price:data.item.data().data.price
        }
        this.props.routing.push({
        pathname: '/ridedetails',
        state: rideData
      })}}/>
     )
   }

   renderRides(){
     return(
      <View> 
      <Header theme="black" icon="close" iconClick={this.goToMain} title="Rides" />  
      <ScrollView style={{height:hp('86%'), backgroundColor:'#E4E4E4'}}>
         <FlatList
         data={this.state.Rides}
         renderItem={this.renderItem}
         />
         <LoaderOverlay style={{ height:hp('8%')}} loading={this.state.isloading}>
         <TouchableOpacity
      
         onPress={this.showMore}
         style={{width:wp('100%'), backgroundColor:'#fff', alignItems:'center', padding:wp('2%')}}
         >
             <Text style={{fontSize:wp('5%')}}>Show More</Text>
         </TouchableOpacity>
         </LoaderOverlay>
      </ScrollView>
   </View>
     )
   }

   renderNoRides(){
    return(
      <View> 
      <Header theme="black" icon="close" iconClick={this.goToMain} title="Rides" />  
      <View style={{height:hp('90%'), alignItems:'center', justifyContent:'center'}}>
        <Text style={{fontSize:wp('7%'), fontWeight:'500'}}>No Rides Found</Text>
        <Button onClick={() => this.props.routing.replace('/findRide')} text="SEARCH AGAIN" style={{marginTop: 42, width: 220}}/>
      </View> 
   </View>
     )
   }
    
    render(){
      const { state } = this.props.location;
       if(state == 'NO RIDES'){
         return this.renderNoRides()
       }else {
         return this.renderRides()
       }
    }
}

const styles = StyleSheet.create({
 itemContainer:{
   flexDirection:'row',
   backgroundColor:'#fff',
   marginBottom: hp('1%'),
   paddingTop: hp('3%'),
   paddingBottom: hp('3%'),
 },
 leftContainer:{
   flex:2,
   alignItems: 'center',
   justifyContent:'flex-end'
 },
 rightContainer:{
  flex:4
 }
});