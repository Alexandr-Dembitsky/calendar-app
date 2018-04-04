import React, {Component} from 'react';
import axios from 'axios';

import Header from './Header';

import './Login.css';

class Login extends Component {
    onLogin(event) {
        event.preventDefault();

        let email = this.emailInput.value;
        let password = this.passwordInput.value;

        if (email.length <= 0 || password.length <= 0) {
            alert('Fields can\'t be empty');
        } else {
            axios.post(`/api/login?email=${email}&password=${password}`)
                .then(function (res) {
                    let token = res.headers['x-token'];
                    window.localStorage.setItem('jwtToken', token);
                    window.localStorage.setItem('isLoggedIn', true);
                    window.location.href = '/calendar';
                })
                .catch(function (error) {
                    alert(error);
                });
        }
    }

    render() {
        return (
            <div className="Login">
                <Header />
                <div className="container">
                    <form className="form-login">
                        <h4 className="form-login-heading">Please log in</h4>
                        <label htmlFor="inputEmail" className="sr-only">Email address</label>
                        <input ref={(input) => this.emailInput = input} type="email" id="inputEmail" className="form-control" placeholder="Email address" required="" autoFocus="" />
                        <label htmlFor="inputPassword" className="sr-only">Password</label>
                        <input ref={(input) => this.passwordInput = input} type="password" id="inputPassword" className="form-control" placeholder="Password" required="" />
                        <button className="btn btn-lg btn-primary btn-block" type="submit" onClick={this.onLogin.bind(this)}>Log in</button>
                    </form>
                </div>
            </div>
        )
    }
}

export default Login;