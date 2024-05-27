import Notification from "../component/notication";

const path = "http://localhost:3001";

const handleLogout = ()=>{
    localStorage.removeItem("user-info");
    window.location.reload();
}

const common = {
    getMethod: async (url) => {
        const response = await fetch(
            path + url,
            {
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        );
        const res = await response.json();
        return res;
    },
    postMethod: async (url, data) => {
        let x = localStorage.getItem('user-info')?localStorage.getItem('user-info'):null;
        let token = "";
        if(x!=null) token = JSON.parse(x).token;

        const response = await fetch(
            path + url,
            {
                method: "post",
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
            }
        );
        const res = await response.json();

        if(res.message === "Token is null!" || res.message === "Token expired!"){
            Notification.error2({
                title: "Error",
                message: "Login session ended!",
                handleAccept: ()=>{handleLogout()},
                titleAccept: "Ok",
            })
        }
        return res;
    },

    deleteMethod: async (url) => {
        let x = localStorage.getItem('user-info')?localStorage.getItem('user-info'):null;
        let token = "";
        if(x!=null) token = JSON.parse(x).token;

        const response = await fetch(
            path + url,
            {
                method: "delete",
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Authorization': 'Bearer ' + token  
                }
            }
        );
        const res = await response.json();

        if(res.message === "Token is null!" || res.message === "Token expired!"){
            Notification.error2({
                title: "Error",
                message: "Login session ended!",
                handleAccept: ()=>{handleLogout()},
                titleAccept: "Ok",
            })
        }

        return res;
    }

}

export default common;