import React,{useEffect}  from 'react';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom" 
import ReactDOM from 'react-dom/client';
import "./i18n/i18n";
import {publicRoutes} from './router/routes';
import Layout from './layout';
import DarkMode from './function/darkMode';
import LocalStorage from "./function/localStorage.js";
import { useTranslation } from 'react-i18next';
import "./style/globalStyle.css";
function Main(){
  const {i18n} = useTranslation();
  function setting(){
    i18n.changeLanguage(LocalStorage.getLanguage());
    DarkMode(LocalStorage.getDarkMode());
  }
  useEffect(()=>{
    setting();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  return(
    <>
      <Router>
        <Routes>
          {publicRoutes.map((route,index)=>{
              const LayoutPage = route.layout===null?React.Fragment:Layout;
              return(
                <Route key={index} path={route.path} element={<LayoutPage><route.component/></LayoutPage>}/>
              )
            })}
        </Routes>
      </Router>
    </>
  )
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main/>);

