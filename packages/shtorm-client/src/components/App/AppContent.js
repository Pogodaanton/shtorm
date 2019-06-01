
import React, { Fragment } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Loader, { ContextLoader } from '../Loader'
import { UserContext } from '../../contexts/UserContext'

const Home = Loader('Home')
const Task = Loader('Task')
const NotFound = Loader('NotFound')
const Login = Loader('Login')
const Logout = Loader('Logout')
const Terminal = Loader('Terminal')
const BotConfigs = Loader('BotConfigs')
const Users = Loader('Users')
const Header = Loader('Header')
const DefaultGridContainer = Loader('DefaultGridContainer')
const TerminalContextProvider = ContextLoader('TerminalContext', () => null)

const AppContent = () => (
  <UserContext.Consumer>
    {({ currentUser }) => {
      const isUserLoggedIn = (Object.keys(currentUser).length > 0)
      return (
        <Switch>
          <Route
            path='/login'
            component={(props) => isUserLoggedIn ? <Redirect to='/' /> : <Login {...props} />}
          />
          <Route path='/'>
            {isUserLoggedIn ? (
              <Fragment>
                <Header />
                <div className='content content-flex'>
                  <DefaultGridContainer name='main'>
                    <Switch>
                      <Route
                        exact
                        path='/'
                        component={Home}
                      />
                      <Route
                        path='/add'
                        component={Home}
                      />
                      <Route
                        path='/edit/:name'
                        component={Home}
                      />
                      <Route
                        path='/delete/:name'
                        component={Home}
                      />
                      <Route
                        path='/start/:name'
                        component={Home}
                      />
                      <Route
                        path='/task/:uuid'
                        component={Task}
                      />
                      <Route
                        path='/users'
                        component={Users}
                      />
                      <Route
                        path='/configs'
                        component={BotConfigs}
                      />
                      <Route
                        path='/logout'
                        component={Logout}
                      />
                      <Route
                        path='/'
                        component={NotFound}
                      />
                    </Switch>
                  </DefaultGridContainer>
                  <TerminalContextProvider>
                    <Switch>
                      <Route
                        path='/configs'
                        component={() => null}
                      />
                      <Route
                        path='/users'
                        component={() => null}
                      />
                      <Route
                        path='/login'
                        component={() => null}
                      />
                      <Route
                        path='/logout'
                        component={() => null}
                      />
                      <Route
                        path='/'
                        component={Terminal}
                      />
                    </Switch>
                  </TerminalContextProvider>
                </div>
              </Fragment>
            ) : <Redirect to='/login' />}
          </Route>
        </Switch>
      )
    }}
  </UserContext.Consumer>
)

export default AppContent
