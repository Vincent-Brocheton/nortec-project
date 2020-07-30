import React, {useState} from 'react';
import ReactDOM from "react-dom";
import {HashRouter, Route, Switch, withRouter} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import AuthContext from "./contexts/AuthContext";
import AuthAPI from "./services/AuthAPI"
import {toast, ToastContainer} from "react-toastify";
import PrivateRoute from "./components/PrivateRoute";
import NavbarTop from "./components/navbars/NavbarTop";
import LoginPage from "./pages/LoginPage";
import ListProjectsPage from "./pages/ListProjectsPage";
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap/dist/css/bootstrap.css';
import '../css/app.css';
import DetailProjectPage from "./pages/DetailProjectPage";
import SearchContext from "./contexts/SearchContext";
import ReportEffectifsPage from "./pages/ReportEffectifsPage";
import ReportPropreteAccesPage from "./pages/ReportPropreteAccesPage";
import ReportSecuritePage from "./pages/ReportSecuritePage";
import ReportPropretePartiesCommunesPage from "./pages/ReportPropretePartiesCommunesPage";
import ReportEcheancesPage from "./pages/ReportEcheancesPage";
import ListReportsByProject from "./pages/ListReportsByProject";
import ReportValidatePage from "./pages/ReportValidatePage";
import ProfilPage from "./pages/ProfilPage";
import AdminProjectsPage from "./pages/AdminProjectsPage";
import AdminPage from "./pages/AdminPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminUserPage from './pages/AdminUserPage';
import AdminProjectPage from './pages/AdminProjectPage';
import 'fontsource-roboto';


AuthAPI.setup();


const App = () => {

    const NavbarTopWithRouter = withRouter(NavbarTop);

    const [isAuthenticated, setIsAuthenticated] = useState(AuthAPI.isAuthenticated());
    const [searchContext, setSearchContext] = useState('');

    const contextValue = {
        isAuthenticated: isAuthenticated,
        setIsAuthenticated: setIsAuthenticated
    };

    const searchContextValue = {
        searchValue: searchContext,
        setSearchValue: setSearchContext
    };



    return (

        <AuthContext.Provider value={contextValue}>


                <HashRouter>

                    <SearchContext.Provider value={searchContextValue}>
                        {isAuthenticated && <NavbarTopWithRouter/>}
                    </SearchContext.Provider>


                    <Switch>
                        {!isAuthenticated && <Route path="/" component={LoginPage}/>}
                        <PrivateRoute path="/profil/:id" component={ProfilPage}/>
                        <PrivateRoute path="/project/:id/:idReport/effectifs" component={ReportEffectifsPage}/>
                        <PrivateRoute path="/project/:id/:idReport/propreteacces" component={ReportPropreteAccesPage}/>
                        <PrivateRoute path="/project/:id/:idReport/securite" component={ReportSecuritePage}/>
                        <PrivateRoute path="/project/:id/:idReport/propretepartiescommunes"
                                      component={ReportPropretePartiesCommunesPage}/>
                        <PrivateRoute path="/project/:id/:idReport/echeances" component={ReportEcheancesPage}/>
                        <PrivateRoute path="/project/:id/:idReport/validate" component={ReportValidatePage}/>

                        <PrivateRoute path="/project/:id/listReports" component={ListReportsByProject}/>
                        <PrivateRoute path="/project/:id" component={DetailProjectPage}/>

                        <PrivateRoute path="/admin/userslist" component={AdminUsersPage}/>
                        <PrivateRoute path="/admin/user/:id" component={AdminUserPage}/>
                        <PrivateRoute path="/admin/project/:id" component={AdminProjectPage}/>
                        <PrivateRoute path="/admin/project" component={AdminProjectsPage}/>
                        <PrivateRoute path="/admin/:id" component={AdminPage}/>


                        <SearchContext.Provider value={searchContextValue}>
                            <PrivateRoute path="/projects" component={ListProjectsPage}/>
                        </SearchContext.Provider>

                    </Switch>

                </HashRouter>

                < ToastContainer
                    position={toast.POSITION.BOTTOM_LEFT}
                />

        </AuthContext.Provider>

    );
};

const rootElement = document.querySelector('#app');
ReactDOM.render(<App/>, rootElement);







