//TODO: Create EditRideModal
//TODO: Create fields to enter date, num of seats, time 

import React, { Component } from 'react'
import { Text, StyleSheet, View, Modal } from 'react-native'
import ModaleDateInput from './ModalDateInput'
import Icon from '../components/Icon';
import { observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import NumericInput from 'react-native-numeric-input';
import Button from '../components/Button';
import Header from './../components/Header';
import { Alert } from 'react-native';
type modalProps = {
    isVisible: boolean,
    date: Date,
    time: string,
    seats: number,
    onRequestClose: () => void,
    updateRide: (date?: Date, time?: string, seats?: number) => void,
    onLimitReached?: (isMax, msg) => void
}
@observer
export default class EditRideModal extends Component<modalProps>{

    @observable
    numSeats: number;

    @observable
    errorMessage = ""

    @observable
    errorDialogVisible = false;

    @observable
    date: Date

    @observable
    time: Date

    componentDidMount = () => {
        this.numSeats = this.props.seats
    };

    render() {
        let time = this.time ? this.time.toLocaleString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true }) : this.props.time
        let date = this.date ? this.date : this.props.date
        return (
            <Modal
                visible={this.props.isVisible}
                onRequestClose={this.props.onRequestClose}
            >
                <View>
                    <Header theme="black" icon="back" iconClick={this.props.onRequestClose} title="Edit Ride" />
                    <ModaleDateInput date={this.date} onDateChanged={it => this.date = it} style={{ marginTop: 20, marginLeft: 4, }}
                        placeholder={this.props.date.toDateString()} label="Start Date" />

                    <ModaleDateInput date={this.time} onDateChanged={it => this.time = it} mode="time"
                        placeholder={this.props.time} label="Start Time" style={{ marginTop: 20, marginLeft: 4 }} />

                    <View style={{ flexDirection: 'row', marginTop: 22, alignItems: 'center', marginLeft: 4 }}>
                        <Icon icon="seat" size={20} style={{ marginRight: 12 }} />
                        <View>
                            <Text style={styles.label}> Number Of Available Seats </Text>
                            <NumericInput editable={false} totalHeight={36} containerStyle={{ marginTop: 3, marginLeft: 3 }}
                                minValue={0} maxValue={3} value={this.numSeats}
                                onChange={(value) => this.numSeats = value}
                                onLimitReached={(isMax, msg) => {Alert.alert('Seats limit','1-3')}}
                            />
                        </View>
                    </View>
                    <View style={{ marginTop: 20, marginBottom: 54, alignItems: 'center', width: '100%' }}>
                        <Button onClick={() => this.props.updateRide(
                            date,
                            time,
                            this.numSeats)} text="UPDATE RIDE" style={{ marginTop: 15, width: 220 }} />
                    </View>
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        color: 'rgb(120, 120, 120)',
        marginBottom: 6
    },
})
