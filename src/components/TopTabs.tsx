import * as React from 'react'
import { observer } from "mobx-react"
import { observable } from "mobx"
import { StyleSheet, View, Text, TouchableOpacity} from 'react-native'


const styles = StyleSheet.create({
    container: {
        width: '100%', 
        height: 46, 
        backgroundColor: 'white',

        borderBottomWidth: 1,
        borderStyle: 'solid', 
        borderColor: 'rgba(0, 0, 0, 0.15)',
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 4,
        display: 'flex', 
        flexDirection: 'row'
    }, 

    tab: {
        borderBottomWidth: 0,
        borderColor: 'black',
        borderStyle: 'solid',
        height: '102%'
    }, 

    tabSelected: {
        borderBottomWidth: 2,
    },

    tabText: {
        textAlign: 'center', 
        lineHeight: 46,
        fontSize: 14, 
    }
})



export class TopTabsState {
    @observable
    currentTab = 0;
}

export type TopTabsProps = {
    state: TopTabsState;
    content: Array<any>;
    textStyle?:any
}



@observer
export default class TopTabs extends React.Component<TopTabsProps> {

    getTabStyle(selected: boolean) {
        var selectedProps = selected? styles.tabSelected: null;
        var length = this.props.content.length || 1;

        var percent = 100 / length;
    
        return {...styles.tab, ...selectedProps, width: `${percent}%`}
    }
    

    renderTabContent() {
        var tabContent = this.props.content;

        if(tabContent == null || tabContent.length == 0) {
            return null;
        }


        return tabContent.map((item, index) => {

            return (
                <TouchableOpacity style={this.getTabStyle(this.props.state.currentTab == index)} key={`TopTab${index}`}
                    onPress={()=>this.props.state.currentTab = index}>
                    <Text style={[styles.tabText,this.props.textStyle]}> {item} </Text>
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


