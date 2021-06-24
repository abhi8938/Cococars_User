import * as React from 'react'
import Icon from './Icon'
import { observer } from "mobx-react"
import { View, Text, StyleSheet } from 'react-native';


const styles = StyleSheet.create({
    headerContainer: {
        width: '100%', 
        minHeight: 64, 
        padding: 12, 
        flexDirection: 'row',
        alignItems: 'center'
    }, 

    headerTitleBlock: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
    }, 

    headerIcon: {
        marginRight: 16,
        marginLeft: 6
    }, 

    headerTitle: {
        fontSize: 22,
    }, 

    headerSubTitle: {
        fontSize: 12,
        marginTop: 6,
    }
})



interface HeaderProps {
    icon?: string
    title?: string
    subtitle?: string
    iconClick?: ()=>void
    rightIcon?: string
    rightIconClick?: ()=>void
    theme?: 'white'| "black"
}

@observer
export default class Header extends React.Component<HeaderProps> {


    render() {
        var iconClick = this.props.iconClick || (()=> {});
        var rightIconClick = this.props.rightIconClick || (()=> {});

        var bgColor = this.props.theme == 'white'? 'rgba(0, 0, 0, 0)': 'black'; 
        var fgColor = this.props.theme == 'white'? 'black': 'white'; 

        return (
            <View style={{...styles.headerContainer, backgroundColor: bgColor}} >
                {this.props.icon? <Icon icon={this.props.icon} onClick={iconClick} style={styles.headerIcon}/> : 
                    <View style={{width: 12}}/>}
                <View style={styles.headerTitleBlock}>
                    {this.props.title? <Text style={{...styles.headerTitle, color: fgColor}}>{this.props.title}</Text>: null }
                    {this.props.subtitle? <Text style={{...styles.headerSubTitle, color: fgColor}}>{this.props.subtitle}</Text>: null}
                </View>
                <View style={{flexGrow: 1}}/>
                {this.props.rightIcon? <Icon icon={this.props.rightIcon} size={18} style={{marginRight: 8}} onClick={rightIconClick}/>: null}
            </View>
        )
    }
}
