import * as React from 'react'
import { inject, observer } from "mobx-react"
import { RouterStore } from 'mobx-react-router';
import LoginService from '../service/LoginService';

type LoginCheckProps = {
    login?: LoginService
    routing?: RouterStore
    check?: (login: LoginService, routing: RouterStore)=> void
}


@inject('routing')
@inject('login')
export default class LoginCheck extends React.Component<LoginCheckProps, {}> {

    componentDidUpdate() {
        this.handleUpdate();
    }

    componentDidMount() {
        this.handleUpdate();    
    }

    handleUpdate() {
        if(this.props.check) {
            this.props.check(this.props.login, this.props.routing);
        }
    }
    
    render() {
        return null;
    }
}
