import React, { Component } from 'react';
import { Text, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { observer } from 'mobx-react';

type rideOptionsProps = {
    rideStatus: any
    passengers: any
    onPassengerClick: (element: any) => void
    onSendRequest: () => any
    driverName: string
    driverPic: any
}

@observer
export default class RideOptions extends Component<rideOptionsProps> {
    getRequestStyle(status: string) {
        let styles: {};
        if (status == 'REQUESTED') { return styles = { color: '#B51310' }} 
        else if (status == 'CONFIRMED') { return styles = { color: '#245BCF' }}
        else if (status == 'LEFT') { return styles = { color: '#7F7D7' }}
        else if (status == 'REMOVED') { return styles = { color: '#A20000' }}
        else if(status == 'CANCELLED'){ return styles = { color: '#FC0706' }}
        return styles;
    }
    renderPassengers() {
        const passengers = this.props.passengers;
        if (this.props.rideStatus == 'OFFERED' || this.props.rideStatus == 'COMPLETED') {
            if (passengers != undefined) {

                if (passengers.length == 0) { return <View style={styles.HeadingContainer}><Text style={{ fontSize: wp('4.5%'), color: '#000' }}>No Riders Yet</Text></View> }

                return passengers.map((element, index) => {
                    const source = element.profilePic ? { uri: element.profilePic } : require('../../assets/profile.png');
                    return (
                        <TouchableOpacity
                            onPress={() => this.props.onPassengerClick(element)}
                            style={[styles.HeadingContainer, { justifyContent: 'space-between' }]}>
                            <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                <Image
                                    source={source}
                                    style={{ width: wp('10%'), height: hp('5.8%'), borderRadius: 30 }}
                                />
                                <Text style={styles.HeadingText}>{element.name}</Text>
                            </View>
                            <Text style={[{ marginRight: wp('3%'), fontSize: wp('4.5%') }, this.getRequestStyle(element.status)]}>{element.status}</Text>
                        </TouchableOpacity>
                    );
                })
            }
            return <View style={styles.HeadingContainer}><Text style={{ fontSize: wp('4.5%'), color: '#000' }}>No Requests Yet</Text></View>
        }
    }

    riderOptions() {

        let headingText: string;

        if (this.props.rideStatus == 'CONFIRMED') { headingText = `Track Ride` }
        else if (this.props.rideStatus == undefined) { headingText = `Request Ride` }

        if (this.props.rideStatus == 'REQUESTED' || this.props.rideStatus == 'REJECTED') {
            return (<View style={styles.HeadingContainer}>
                <Text style={[styles.HeadingText, { color: '#B51310' }]}>{this.props.rideStatus}</Text>
            </View>)
        }
        if (this.props.rideStatus == 'CONFIRMED' || this.props.rideStatus == undefined) {
            return (
                <View>
                    <TouchableOpacity
                        onPress={this.props.onSendRequest}
                        disabled={this.props.rideStatus == 'CONFIRMED'}
                        style={styles.HeadingContainer}>
                        <Text style={styles.HeadingText}>{headingText}</Text>
                    </TouchableOpacity>
                    <View style={styles.HeadingContainer}>
                        <Text style={styles.HeadingText}>Chat with {this.props.driverName}</Text>
                    </View>
                    <View style={styles.HeadingContainer}>
                        <Text style={styles.HeadingText}>Pay Driver</Text>
                    </View>
                </View>
            )
        }

    }
    render() {
        var source: any = this.props.driverPic ? { uri: this.props.driverPic } : require('../../assets/profile.png');;
        let headingText: string = `Ride with ${this.props.driverName}`;
        if (this.props.rideStatus == 'CONFIRMED') { headingText = `Your trip with ${this.props.driverName}` }
        else if (this.props.rideStatus == 'OFFERED') { headingText = `Your trip as driver` }
        else if (this.props.rideStatus == 'COMPLETED') { headingText = `Your trip with ${this.props.driverName}` }
        else if (this.props.rideStatus == 'REQUESTED') { headingText = `Ride with ${this.props.driverName}` }
        else if (this.props.rideStatus == 'REMOVED'){headingText = 'Driver Removed you from this ride'}
        else if (this.props.rideStatus == 'LEFT'){headingText = 'You Left this ride'}
        else if (this.props.rideStatus == 'CANCELLED'){headingText = 'Ride cancelled by driver'}
        return (
            <View>
                <View style={[styles.HeadingContainer, { justifyContent: 'flex-start' }]}>
                    <Image
                        source={source}
                        style={{ width: wp('10%'), height: hp('5.8%'), borderRadius: 30, }}
                    />
                    <Text style={[styles.HeadingText,{width:'99%'}]}>{headingText}</Text>
                </View>
                {this.renderPassengers()}
                {this.riderOptions()}
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
})
