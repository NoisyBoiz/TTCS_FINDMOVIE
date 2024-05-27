import React, {useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import { Link } from "react-router-dom";
import CardMovie from "../component/cardMovie";
import Pagination from "../component/pagination"
import LocalStorage from "../function/localStorage.js";
import moviesService from "../services/movies.js";
import Notification from "../component/notication.js";

import "../style/collections.css"
function Collections(){
    const {t} = useTranslation();
    const [dataPage,setDataPage] = useState([]);
    const [totalPages,setTotalPages] = useState();
    const [postPerPage] = useState(20);
    const [indexPage,setIndexPage] = useState(1);
    useEffect(()=>{ 
        const user = LocalStorage.getUserInfo();
        if(user == null) {
            Notification.warning({
                title: 'Warning!',
                message: 'You need to login to see your collections!',
                handleAccept: () => {
                    window.location.href = "/login/login";
                },
                handleCancel: () => {
                    window.location.href = "/";
                },
                titleAccept: 'Login',
                titleCancel: 'Cancel'
            })
            return;
        }
        moviesService.getMovieByUser(user.id).then(res=>{
            setTotalPages(Math.ceil(res.length/postPerPage));
            setDataPage(res.slice(0,Math.min(postPerPage,res.length)));
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);
   
    return(
        <div className="commonContainer">
            {dataPage.length?<>
                <h2> {t("Collections")} </h2>
                <CardMovie method={"favorite"} data={dataPage}/> 
                <Pagination totalPages={totalPages} indexPage={indexPage} setIndexPage={setIndexPage} showPagination={LocalStorage.getShowPagination()}/>
            </>:
            <div className="emptyCollections"> 
                <img src="https://cdn.glitch.global/f41a9bd0-8a31-41ac-a400-886f727e1815/box.png?v=1684402478245" alt="empty collections"/>
                <h1> There is no data in the collection right now! </h1>
                <h1> Let's explore more </h1>
                <Link to="/"> Back to home </Link>
            </div>
            }       
        </div>
    )
}
export default Collections;