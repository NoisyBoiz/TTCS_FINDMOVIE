import Common from './common.js';

const usersService = {
    async login(data) {
        const res = await Common.postMethod('/users/login', data);
        return res
    }, 
    
    async signup(data){
        const res = await Common.postMethod('/users/signup', data);
        return res
    },

    async getFavorite(id){
        const res = await Common.getMethod('/users/getFavorite?id='+id);
        return res.data;
    },

    async updateFavorite(data){
        const res = await Common.postMethod('/users/updateFavorite', data);
        return res
    },
}

export default usersService;