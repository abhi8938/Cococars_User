import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { observer, inject } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
type onPressEvent = () => void;
export type RideItemProps = {
    routing?: RouterStore
    data: any
    price?:number
    onPress:onPressEvent
    status?: string
    statusColor?:any
}

@inject('routing')
@observer
export default class RideItem extends Component<RideItemProps> {
state={
    Date:{}
}
    render() {
        const {data} = this.props.data.item.data();
        // console.log(`data`,this.props.data.item);
        const destination = data.Locations.map(element =>{
            if(element.point == 'END'){
                return element.city;
            }else{
                return
            }
        });
        if(data.Date.Timestamp == undefined){
        let date= new Date(data.Date)
        var date1 = date.toDateString();
        }// 
        let date2 = date1.split(' ',4);
        let price = this.props.status? this.props.status:`${this.props.price}`  
       return (
               <TouchableOpacity
               onPress={this.props.onPress}
               >
                    <View style={styles.itemContainer}>
               <View style={styles.leftContainer}>
                 <Image
                 style={{width:wp('9%'), height:hp('5%')}}
                  source={require('../../assets/carList.jpg')}
                 />
                 <Text style={{fontSize:hp('5%'), color:'#000'}}>{date2[2]}</Text>
                 <Text style={{color:'#000', fontSize:wp('5%')}}>{date2[0]}</Text>
                 <Text style={{color:'#ADADAD',fontSize:wp('6%')}}>{date2[1]} {date2[3]}</Text>
               </View>
               <View style={styles.rightContainer}>
                 <View style={{ flex:1, alignItems:'flex-end', paddingRight:wp('5%')}}>
                     <Text style={[{color:'#000', fontSize:wp('5%'), marginBottom:hp('.7%')},this.props.statusColor]}
                     >{price}</Text>
                     </View>
                 <View>
                     <Text style={{ color:'#000', fontSize:wp('6%'), marginBottom:hp('.7%')}}>{data.startCity.city} - {destination}</Text>
                     <Text style={{fontSize:wp('5%'), marginBottom:hp('.5%')}}>{data.Driver.name}</Text>
                     <Text style={{marginBottom:hp('2%')}}>{data.Driver.carModal}</Text>
                     {/* <Text>Boarding: <Text style={{color:'#8F9095', fontWeight:'bold'}}>Guindy Junction</Text></Text> */}
                 </View>
               </View>
               </View>
               </TouchableOpacity>
           
       );
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
})
