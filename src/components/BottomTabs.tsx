import React, { Component } from 'react'
import { observer } from "mobx-react"
import { observable } from "mobx"
import { StyleSheet, View, Text, TouchableOpacity, Image, Animated, Easing } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RouterStore } from 'mobx-react-router';
import { inject } from 'mobx-react';
export const content = [
    { Label: 'HOME', Icon: require('../../assets/ic_directions_car.svg'), route: '/' },
    { Label: 'SEARCH', Icon: require('../../assets/ic_search.svg'), route: '/findRide' },
    { Label: 'RIDES', Icon: require('../../assets/ic_add_circle_outline.svg'), route: '/addride' },
    { Label: 'PROFILE', Icon: require('../../assets/ic_person.svg'), route: '/profile' }
];
// { Label: 'CHATS', Icon: require('../../assets/ic_chat.svg'), route: '' },
class BottomTabsState {
    @observable
    currentTab = 0;
}
export const bottomTabsState = new BottomTabsState;
export type BottomTabsProps = {
    state: BottomTabsState;
    content: any;
    routing?: RouterStore
}
@observer
@inject('routing')
export default class BottomTabs extends Component<BottomTabsProps> {


    getTabStyle(selected: boolean) {
        // var selectedProps = selected? styles.tabSelected: null;
        var length = this.props.content.length || 1;

        var percent = 100 / length;

        return { ...styles.tab, width: `${percent}%` }
    }
    getIconStyle(selected: boolean) {
        var seletedProps = selected ? styles.IconSelected : null;
        return { ...styles.Icon, ...seletedProps }
    }
    getTextStyle(selected: boolean) {
        var seletedProps = selected ? styles.TextSelected : null;
        return { ...styles.tabText, ...seletedProps }
    }
    renderTabContent() {
        var tabContent = this.props.content;

        if (tabContent == null || tabContent.length == 0) {
            return null;
        }
        return tabContent.map((item, index) => {
            // console.log(this.props);
            return (
                <TouchableOpacity style={this.getTabStyle(this.props.state.currentTab == index)} key={`BottomTab${index}`}
                    onPress={() => {
                        this.props.state.currentTab = index;
                        if (this.props.state.currentTab == 1 || this.props.state.currentTab == 2) {
                            this.props.state.currentTab = 0;
                            return this.props.routing.replace(item.route)
                        } else {
                            return this.props.routing.replace(item.route)
                        }

                    }}>
                     <View style={{width:'100%', height:hp('5%'), alignItems:'center', justifyContent:'center'}}>
                    <Image
                        style={this.getIconStyle(this.props.state.currentTab == index)}
                        source={item.Icon}
                    />
                    </View>
                    <Text style={this.getTextStyle(this.props.state.currentTab == index)}> {item.Label} </Text>
                </TouchableOpacity>
            )
        })
    }
    render() {
        return (
            <View style={styles.container}>
                {this.renderTabContent()}
            </View>
        )
    }
}


const styles = StyleSheet.create({
    Icon: {
        resizeMode:'contain',
        width: 18,
        height: 18
    },
    IconSelected: {
        resizeMode:'contain',
        height: 23,
        width: 23
    },
    TextSelected: {
        paddingTop: hp('.1%'),
        display: 'flex',
        textAlign: 'center',
        fontSize: wp('2.5%'),
        color: '#000',
    },
    container: {
        margin: 0,
        width: '100%',
        height: hp('8.5%'),
        backgroundColor: 'white',
        bottom:0,
        flexDirection: 'row',
        position:'absolute'
    },

    tab: {
        alignItems: 'center',
        justifyContent: 'space-evenly',
        height: '100%',
        padding: hp('.7%'),
    },

    tabText: {
        display: 'none'
    }
})
