import { Image, TouchableOpacity, StyleSheet, View } from 'react-native';
import * as React from 'react';


type IconProps = {
    icon: string, 
    size?: number,
    style?: any,
    onClick?: ()=> void, 
    strike?: boolean
}

const icons = {
    back: require('../../assets/back_icon.svg'), 
    back_black: require('../../assets/back_icon_black.svg'), 
    profile: require('../../assets/profile_icon.svg'), 
    logout: require('../../assets/logout_icon.svg'), 
    smoke_1: require('../../assets/smoking_icon_1.svg'), 
    smoke_2: require('../../assets/smoking_icon_2.svg'), 
    chat_1: require('../../assets/chat_icon_1.svg'), 
    chat_2: require('../../assets/chat_icon_2.svg'), 
    music_1: require('../../assets/music_icon_1.svg'), 
    music_2: require('../../assets/music_icon_2.svg'), 
    pets_1: require('../../assets/pets_icon_1.svg'), 
    pets_2: require('../../assets/pets_icon_2.svg'), 
    pointer: require('../../assets/pointer_icon.svg'), 
    location: require('../../assets/location_icon.svg'), 
    close: require('../../assets/close_icon.svg'), 
    plus: require('../../assets/plus_icon.svg'), 
    calendar: require('../../assets/calendar_icon.svg'), 
    clock: require('../../assets/clock_icon.svg'), 
    seat: require('../../assets/seat_icon.svg'), 
}



const styles = StyleSheet.create({
    image: {
        position: 'absolute', 
        left: 0, 
        top: 0, 
        width: '100%', 
        height: '100%', 
    }, 

    strike: {
        position: 'absolute', 
        width: '130%', 
        height: '130%', 
        top: -2, 
        left: -2
    }
})

export default class Icon extends React.Component<IconProps> {


    render() {
        var size = this.props.size || 18;

        const Comp: any = this.props.onClick? TouchableOpacity : View; 

        const style = {
            width: size, 
            height: size, 
            ...this.props.style
        }

        const props = this.props.onClick? {style: style, onPress: this.props.onClick}: {style: style};
        

        return (
            <Comp {...props}>
                <Image resizeMode='contain' source={icons[this.props.icon]} style={styles.image}/>
                {this.props.strike? <Image resizeMode='contain' source={require('../../assets/line_icon.svg')} 
                style={styles.strike}/> : null}
            </Comp>
        )
    }
}