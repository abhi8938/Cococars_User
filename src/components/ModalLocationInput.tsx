import * as React from 'react'
import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, KeyboardTypeOptions } from 'react-native';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import autobind from 'autobind-decorator';
import Header from './Header';
import { commonStyles } from './commonStyles';
import Button from './Button';
import LocationView from './LocationView';
import Icon from './Icon';

 
export type Location = {
    latitude: number
    longitude: number
    address: string
}

export type LocationChangedEvent =  (location: Location)=> void;


export type ModalLocationInputProps = {
    placeholder?: string
    location?: Location
    icon?: string
    onLocationChanged?: LocationChangedEvent
    style?: any
    label?: string
    disabled?: boolean
    autoOpen?: boolean
}

const styles = StyleSheet.create({

    value: {
        fontSize: 18,
        lineHeight: 22,
        color: 'black',
    },

    placeholder: {
        fontSize: 18,
        lineHeight: 22,
        color: 'rgb(180, 180, 180)',
    },

    textContainer: {
        paddingBottom: 8,
        flex: 1
    },

    label: {
        fontSize: 14, 
        color: 'rgb(120, 120, 120)', 
        marginBottom: 6
    }, 
})


@observer
export default class ModalLocationInput extends React.Component<ModalLocationInputProps> {

    @observable
    modalOpen = false;


    componentDidMount() {
        if(this.props.autoOpen) {
            this.openModal();
        }
    }

   
    @autobind
    openModal() {

        if(this.props.disabled) {
            return;
        }

        this.modalOpen = true;
    }

    @autobind
    closeModal() {
        this.modalOpen = false;
    }

    @autobind
    saveAndCloseModal(locationData: any) {
        this.modalOpen = false;
        console.log(locationData);  
        var location = {
            latitude: locationData.latitude, 
            longitude: locationData.longitude, 
            address: locationData.address
        }


        if(this.props.onLocationChanged) {
            this.props.onLocationChanged(location);
        }
    }

   
    getModalContent() {
        return (
            <View style={commonStyles.topContainer}>
                <LocationView
                    apiKey="AIzaSyBingc6-iojmFM1vHcsoooqMMu5OOz7U7U"
                    actionText="DONE"
                    onLocationSelect={this.saveAndCloseModal}
                    location={this.props.location}
                />
                <Icon icon="back_black" style={{position: 'absolute', left: 24, top: 24}} onClick={this.closeModal}/>
            </View>
        )
    }

    render() {
        var text = this.props.location? this.props.location.address : this.props.placeholder;
        var textStyle = this.props.location? styles.value : styles.placeholder;

        return (
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', ...this.props.style}} onPress={this.openModal}>
                <Icon icon={this.props.icon} size={28} style={{marginRight: 12}}/>
                <View style={styles.textContainer}>
                    <Text style={styles.label}> {this.props.label} </Text>
                    <Text style={{...textStyle}} ellipsizeMode="tail" numberOfLines={1}> {text} </Text>
                </View>
                <Modal animationType="slide" transparent={false} visible={this.modalOpen}>
                    {this.getModalContent()}
                </Modal>
            </TouchableOpacity>
        )
    }
}




