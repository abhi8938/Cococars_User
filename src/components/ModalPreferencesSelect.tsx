import * as React from 'react'
import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, Picker } from 'react-native';
import { observer } from 'mobx-react';
import { observable, toJS } from 'mobx';
import autobind from 'autobind-decorator';
import Header from './Header';
import { commonStyles } from './commonStyles';
import Button from './Button';
import PreferencesIcon from './PreferencesIcon';


type PreferencesChangedEventArgs =  (value: Preferences)=> void;
type Preferences = {
    chat?: number, 
    smoke?: number, 
    music?: number, 
    pets?: number
}

type ModalPreferencesSelectProps = {
    preferences?: Preferences, 
    onPreferencesChanged?: PreferencesChangedEventArgs
    style?: any
}

const styles = StyleSheet.create({
    prefContainer: {
        flexDirection: 'row'
    }, 

    prefIcon: {
        marginRight: 24
    }, 

    prefRow:{
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24
    }, 

    picker: {
        height: 50, 
        flexGrow: 1, 
        marginLeft: 18
    }


})

export function getDefaultPreferences(prefs?: Preferences){
    const defaults = {   
        chat: 2,
        smoke: 0,
        music: 2,
        pets: 0
    }

    if(prefs == null) {
        return defaults;
    }

    return {
        chat: prefs.chat == null? defaults.chat: prefs.chat,
        smoke: prefs.smoke == null? defaults.smoke: prefs.smoke,
        music: prefs.music == null? defaults.music: prefs.music,
        pets: prefs.pets == null? defaults.pets: prefs.pets
    }
}

export function preferencesEqual(p1: Preferences, p2: Preferences) {
    if(p1 == null && p2 == null) {
        return true;
    }

    if(p1 == null  || p2 == null) {
        return false;
    }

    return p1.chat == p2.chat && p1.smoke == p2.smoke && p1.music == p2.music && p1.pets == p2.pets;
}

@observer
export default class ModalPreferencesSelect extends React.Component<ModalPreferencesSelectProps> {

    @observable
    modalOpen = false;

    @observable 
    preferences: Preferences = getDefaultPreferences();

    @autobind
    openModal() {
        this.modalOpen = true;
        this.preferences = getDefaultPreferences(this.props.preferences);
    }

    @autobind
    closeModal() {
        this.modalOpen = false;
    }

    @autobind
    saveAndCloseModal() {
        this.modalOpen = false;
        if(this.props.onPreferencesChanged && !preferencesEqual(this.preferences, this.props.preferences)) {
            this.props.onPreferencesChanged(toJS(this.preferences));
        }
    }

    getModalContent() {
        return (
            <View style={commonStyles.topContainer}>
                <Header theme="white" icon="back_black" iconClick={this.closeModal}/>
                <View style={{paddingLeft: 18, paddingRight: 18, paddingTop: 12}}>
                    <View style={styles.prefRow}>
                        <PreferencesIcon type="chat" level={this.preferences.chat}/>
                        <Picker selectedValue={`${this.preferences.chat}`}
                            style={styles.picker} onValueChange={it => this.preferences.chat = it}>

                            <Picker.Item label="I'm the quiet type" value="0" />
                            <Picker.Item label="I talk depending on my mood" value="1" />
                            <Picker.Item label="I love to chat" value="2" />
                        </Picker>
                    </View>

                    <View style={styles.prefRow}>
                        <PreferencesIcon type="smoke" level={this.preferences.smoke}/>

                        <Picker selectedValue={`${this.preferences.smoke}`}
                            style={styles.picker} onValueChange={it => this.preferences.smoke = it}>
                                
                            <Picker.Item label="No smoking in the car" value="0" />
                            <Picker.Item label="Don't know" value="1" />
                            <Picker.Item label="Cigarettes are great!" value="2" />
                        </Picker>
                    </View>

                    <View style={styles.prefRow}>
                        <PreferencesIcon type="music" level={this.preferences.music}/>

                        <Picker selectedValue={`${this.preferences.music}`}
                            style={styles.picker} onValueChange={it => this.preferences.music = it}>
                                
                            <Picker.Item label="Silence is golden" value="0" />
                            <Picker.Item label="Don't know" value="1" />
                            <Picker.Item label="It's all about the playlist" value="2" />
                        </Picker>
                    </View>

                    <View style={styles.prefRow}>
                        <PreferencesIcon type="pets" level={this.preferences.pets}/>

                        <Picker selectedValue={`${this.preferences.pets}`}
                            style={styles.picker} onValueChange={it => this.preferences.pets = it}>
                                
                            <Picker.Item label="No pets please" value="0" />
                            <Picker.Item label="Don't know" value="1" />
                            <Picker.Item label="Pets welcome. Woof!" value="2" />
                        </Picker>
                    </View>
                    
                    <View style={{alignItems: 'center', width: '100%'}}>
                        <Button onClick={this.saveAndCloseModal} text="SAVE" style={{marginTop: 42, width: 220}}/>
                    </View>
                </View>
            </View>
        )
    }

    render() {
        var preferences = getDefaultPreferences(this.props.preferences);

        return (
            <TouchableOpacity style={this.props.style} onPress={this.openModal}>
             
                <View style={styles.prefContainer}>
                    <PreferencesIcon type="chat" level={preferences.chat} style={styles.prefIcon}/>
                    <PreferencesIcon type="smoke" level={preferences.smoke} style={styles.prefIcon}/>
                    <PreferencesIcon type="music" level={preferences.music} style={styles.prefIcon}/>
                    <PreferencesIcon type="pets" level={preferences.pets} style={styles.prefIcon}/>
                </View>

                <Modal animationType="slide" transparent={false} visible={this.modalOpen}>
                    {this.getModalContent()}
                </Modal>
            </TouchableOpacity>
        )
    }
}




