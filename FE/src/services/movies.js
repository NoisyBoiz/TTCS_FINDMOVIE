import Common from './common.js';

const moviesService = {
    async getMovieById(id, language) {
        const url = '/movies/getById?id='+id + '&language=' + language;
        const res = await Common.getMethod(url);
        return res.data;
    },

    async getMovieByUser(ids,language) {
        const url = '/movies/getByUser?id='+ids+'&language=' + language;
        const res = await Common.getMethod(url);
        return res.data;
    },

    async getMovies(type,language) {
        const url = '/movies/'+ type+'?language='+language;
        const res = await Common.getMethod(url);
        return res.data;
    },     

    async getMoviesByTitle(title,language) {
  
        const url = '/movies/getByTitle?title='+ title+'&language='+language;
        const res = await Common.getMethod(url);
        return res.data;
    },
    async filterMovies(query,language) {
   
        const url = '/movies/filter?'+ query +'&language=' +language;
        const res = await Common.getMethod(url);
        return res.data;
    },

    async getCast(id){
        const url = '/casts/getByListId?id='+id;
        const res = await Common.getMethod(url);
        return res.data;
    },

    async getComments(id){
        const url = '/comments/getByMovieId?id='+id;
        const res = await Common.getMethod(url);
        return res.data;
    },

    async createComment(data){
        const url = '/comments/create';
        const res = await Common.postMethod(url,data);
        return res;
    },

    async deleteComment(id){
        const url = '/comments/delete?id='+id;
        const res = await Common.deleteMethod(url);
        return res;
    }
}

export default moviesService;