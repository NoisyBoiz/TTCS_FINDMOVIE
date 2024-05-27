import React, {useState,useEffect} from "react";
import { useParams } from "react-router-dom";
import YouTube from 'react-youtube';
import "../style/detail.css";
import {useTranslation} from 'react-i18next';
import DragScrolling from "../function/dragScrolling";
import LocalStorage from "../function/localStorage.js";
import GenresService from "../services/genres.js";
import moviesService from "../services/movies.js";
import userService from "../services/users.js";
import Notification from "../component/notication.js";
import { MdDeleteForever } from "react-icons/md";

function Detail(){
    let videoElement = null;
    const {t} = useTranslation();
    const {idMovie} = useParams();
    const imgActorURL = "https://image.tmdb.org/t/p/w138_and_h175_face";
    const posterURL = "https://image.tmdb.org/t/p/w500";
    const backDropURL = "https://image.tmdb.org/t/p/original";
    const imgTrailerURL = "https://img.youtube.com/vi/";
    const endImgTrailerURL = "/mqdefault.jpg"; //hqdefault.jpg maxresdefault.jpg
    const [dataDetail,setDataDetail] = useState(null);
    const [keyTrailer,setKeyTrailer] = useState(null);
    const [showTrailer,setShowTrailer] = useState(false);
    const [arrFavorite,setArrFavorite] = useState([]);
    const [genreName, setGenreName] = useState([]);
    const [comment, setComment] = useState([]);
    const [cast, setCast] = useState([]);
    const [userInfor,setUserInfor] = useState(null);

    let dataDetailFunc = (x) => {
        if(x!==null){
            setDataDetail(x);
            getGenres(x);  
        }
        if(document.getElementsByClassName('emptyDataDetail')[0]!==undefined) {
            x!=null?document.getElementsByClassName('emptyDataDetail')[0].style.opacity = 0:
            document.getElementsByClassName('emptyDataDetail')[0].style.opacity = 1;
        }
    }
    useEffect(()=>{
        const user = LocalStorage.getUserInfo();
        setUserInfor(user);
        if(user!==null){
            userService.getFavorite(user.id).then(res=>{
                setArrFavorite(res);
            })
        }
        moviesService.getMovieById(idMovie,LocalStorage.getLanguage()).then(res=>{
            dataDetailFunc(res);
        })
        moviesService.getCast(idMovie).then(res=>{
            setCast(res);
        })

        moviesService.getComments(idMovie).then(res=>{
            setComment(res.sort((a,b)=>{return new Date(b.createdAt)-new Date(a.createdAt)}));
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[LocalStorage.getLanguage()])

    let getGenres = (movie)=>{
        GenresService.getAllGenres().then(allGenres=>{
            let rs = [];
            movie._id.genre_ids.forEach(item=>{
                allGenres.forEach(genre=>{
                    if(genre._id===item) rs.push(genre.name);
                })
            })
            setGenreName(rs);
        })
    }

    let convertRunTime = (x)=>{
        let h = Math.floor(x/60);
        let m = x%60;
        return h+"h "+m+"m";
    }

    const createComment = () => {
        const content = document.getElementsByClassName('comment-textarea')[0].value;
        if(content==="") {
            Notification.alert({
                title: t("Warning"),
                message: t("You need to write comment"),
            })
            return
        }
        const userInfor = LocalStorage.getUserInfo();
        if(userInfor===null){
            Notification.warning({
                title: t("Warning"),
                message: t("You need to login to comment"),
                handleAccept: ()=>{window.location.href="/login/login"},
                handleCancel: ()=>{Notification.closeNotification()},
                titleAccept: "Login",
                titleCancel: "Cancel"
            })
            return
        }
        document.getElementsByClassName('comment-textarea')[0].value = "";
        const data = {
            idUser: userInfor.id,
            idMovie: idMovie,
            content: content
        }
        moviesService.createComment(data).then(res=>{
            if(res.status===200){
                moviesService.getComments(idMovie).then(res=>{
                    setComment(res.sort((a,b)=>{return new Date(b.createdAt)-new Date(a.createdAt)}));
                })
            }
            else{
                Notification.error({
                    title: t("Error"),
                    message: t("Create comment fail"),
                })
            }
        })
    }

    const deleteComment = (id) => {
        Notification.comfirm({
            title: t("Warning"),
            message: t("Do you want to delete this comment?"),
            handleAccept: ()=>{
                moviesService.deleteComment(id).then(res=>{
                    if(res.status===200){
                        moviesService.getComments(idMovie).then(res=>{
                            setComment(res.sort((a,b)=>{return new Date(b.createdAt)-new Date(a.createdAt)}));
                        })
                    }
                    else{
                        Notification.error({
                            title: t("Error"),
                            message: t("Delete comment fail"),
                        })
                    }
                })
            },
            handleCancel: ()=>{Notification.closeNotification()},
            titleAccept: t("Accept"),
            titleCancel: t("Cancel")
        })
    }
    const handleFavorite = (id) => {
        const userInfor = LocalStorage.getUserInfo();
        if(userInfor===null){
            Notification.warning({
                title: t("Warning"),
                message: t("You need to login to add favorite"),
                handleAccept: ()=>{window.location.href="/login/login"},
                handleCancel: ()=>{Notification.closeNotification()},
                titleAccept: "Login",
                titleCancel: "Cancel"
            })
            return
        }
        let data = {
            id: userInfor.id,
            idMovie: id
        }
        userService.updateFavorite(data).then(res=>{
            if(res.status===200){
                setArrFavorite(res.data);
            }
        })
    }

    return(
        <>
        {dataDetail!=null?(
            <>
            <div className="detail">
                <div className="detailBackDrop"> 
                    {dataDetail!=null&&<img src={backDropURL+dataDetail._id.backdrop_path} alt="backDrop"/>}
                </div>
                <div className="detailContent"> 
                    <div className="topDetailContent"> 
                        <h3> {dataDetail._id.original_title} </h3>
                        <button className={`btn-favorite ${arrFavorite.includes(dataDetail._id._id)?"activeFavoriteDetail":"inactiveFavoriteDetail"}`}
                            onClick={()=>{handleFavorite(dataDetail._id._id)}}
                        > <i className="fa-solid fa-heart"></i> {t("Favorite")} </button>
                    </div>
                    <div className="centerDetailContent">
                        <div className="leftDetailContent"> 
                            {dataDetail!=null&&<img className="detailPosterImg" src={posterURL+dataDetail._id.poster_path} alt="poster" /> }
                            <div className="bottomLDContent">
                                <div className='rateContainer'>
                                    <svg xmlns="http://www.w3.org/2000/svg" className='circleRate'>
                                        <circle fill="transparent" className='fillCircle'/>
                                        <circle fill="transparent" className='barCircleRate' style={{"--voteRate":Math.floor(dataDetail._id.vote_average*10)/10}} />
                                    </svg>
                                    <p className='detailRate'> {Math.floor(dataDetail._id.vote_average*10)/10} </p>
                                </div>
                                <p> {dataDetail.vote_count} <span> {t("Ratings")} </span> </p>
                            </div>
                        </div>
                        <div className="rightDetailContent"> 
                            <h1 className="detailTitle"> {dataDetail.title} </h1>
                            <div className="detailGenres"> {genreName.map((item,index)=>{return(<span key={index}>{t(item)}</span>)})}</div>
                            <p className="detailDate"> <span>{t("Release Date")}: </span> {dataDetail._id.release_date} </p>
                            <p className="detailRuntime"> <span> {t("Runtime")}: </span> {convertRunTime(dataDetail._id.runtime)} </p>
                            <div className="detailOverview">
                                <p> {t("Overview")} {!dataDetail.overview&&<span> ({t("No Overview")}) </span>}</p>
                                <span> {dataDetail.overview} </span>
                            </div>
                            <div className="trailerDetailContainer">
                                <p> {t("Trailer")} {dataDetail.video.length===0&&<span> ({t("No Trailer")}) </span>} </p>
                                <div className="slideTDContainer" >
                                    <div className="slideTD" onMouseDown={(e)=>{DragScrolling(e,"slideTDContainer")}}> 
                                        {dataDetail.video.length!==0&&dataDetail.video.map((x,index)=>{
                                            return <button key={index} className="buttonShowTrailer" onClick={()=>{setShowTrailer(true);setKeyTrailer(x);}}> {<><img src={imgTrailerURL+x+endImgTrailerURL} width={150} height={90} alt="trailer"/><i className="fa-solid fa-caret-right"></i></>}  </button>
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="detailActorContainer">
                    <p>  {t("Cast")} </p>
                        <div className="listActorContainer">
                            <div className="slideActor" onMouseDown={(e)=>{DragScrolling(e,"listActorContainer")}}>
                                {cast!=null&&cast.length>0?cast.map((item,index)=>{
                                    return(
                                        <div className="actorCard" key={index}>
                                            <img src={item.avatar!=null?imgActorURL+item.avatar:"https://cdn.glitch.global/f41a9bd0-8a31-41ac-a400-886f727e1815/img.jpg?v=1682936306067"} alt="actor"/>
                                            <p> {item.name} </p>
                                            <p> {item.character}</p>
                                        </div>
                                    )
                                }):""}
                            </div>
                        </div>
                    </div>
                    <div className="comment-container">
                        <p> {t("Comment")} </p>
                        <div className="yourCmtCrad">
                            <textarea type="text" placeholder={t("Write Comment")} className="comment-textarea"/>
                            <button onClick={()=>{createComment()}}><i className="fa-regular fa-paper-plane"></i></button>
                        </div>
                        {comment!=null?(comment.map((item,index)=>{
                                return(
                                    <>
                                    <div className="card">
                                        <div className="author"> 
                                            <div className="image"> <img src={item.idUser.avatar!=null?item.idUser.avatar:"https://cdn.glitch.global/f41a9bd0-8a31-41ac-a400-886f727e1815/img.jpg?v=1682936306067"} alt="author"/> </div>
                                            <div className="infor"> 
                                                <h3> {item.idUser.name!==""?item.idUser.name:item.author} </h3>
                                                <p> {new Date(item.createdAt).toLocaleString()} </p>
                                            </div>
                                            {userInfor!==null&&item.idUser._id===userInfor.id?<button className="action" onClick={() => deleteComment(item._id)}>
                                                <MdDeleteForever />
                                            </button>:""}
                                        </div>
                                        <div className="content"> {item.content} </div>
                                    </div>
                                    </>
                                )
                            })):<h3> {t("No Comment")} </h3>
                        }
                    </div>
                </div>
            </div>

            <div className={`trailerContainer ${showTrailer?"showTrailer":"hiddenTrailer"}`}> 
               {keyTrailer!=null&&<YouTube videoId={keyTrailer} className="trailerMovie" onReady = {(event) => {videoElement = event}}/>}
                <button className="buttonHiddenTrailer" onClick={()=>{videoElement.target.stopVideo(); setShowTrailer(false); setKeyTrailer(null)}}> + </button>
            </div>
          
        </>
        ):<div className="emptyDataDetail">
            <h1> 4<i className="fa-solid fa-ghost"></i>4 </h1>
            <span> {t("No Detail1")} <br/>
            {t("No Detail2")} </span>
        </div>}
        </>
    )
}

export default Detail;
